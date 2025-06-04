/**
 * nRF (Nordic RF) Audio Input Plugin for Orpheus Engine
 * Supports wireless audio input via nRF-based devices
 */

import {
  AudioInputPlugin,
  AudioInputPluginMetadata,
  AudioInputPluginContext,
  AudioInputConfiguration,
  AudioInputDevice,
  AudioInputResult,
  AudioInputStream,
  AudioInputCapabilities,
} from '../types';

export class NRFAudioInputPlugin implements AudioInputPlugin {
  metadata: AudioInputPluginMetadata = {
    id: 'nrf-audio-input',
    name: 'nRF Wireless Audio Input',
    version: '1.0.0',
    category: 'wireless',
    supportedDeviceTypes: ['nrf', 'bluetooth', 'wireless'],
    supportedProtocols: ['nrf24l01', 'nrf52', 'ble', 'proprietary-rf'],
    tags: ['wireless', 'low-latency', 'battery-powered', 'portable'],
    author: 'Orpheus Engine Team',
    description: 'Wireless audio input plugin supporting nRF-based audio devices with ultra-low latency',
    minLatency: 5, // 5ms minimum latency
    maxChannels: 8,
  };

  private context?: AudioInputPluginContext;
  private config?: AudioInputConfiguration;
  private currentDevice?: AudioInputDevice;
  private currentStream?: AudioInputStream;
  private nrfConnection?: NRFConnection;
  private audioBuffer?: ArrayBuffer;
  private isInitialized = false;

  async initialize(
    config: AudioInputConfiguration,
    context: AudioInputPluginContext
  ): Promise<void> {
    this.config = config;
    this.context = context;
    
    // Check for nRF support
    if (!this.isNRFSupported()) {
      throw new Error('nRF audio devices not supported in this environment');
    }

    // Initialize nRF connection manager
    this.nrfConnection = new NRFConnection({
      sampleRate: config.sampleRate,
      bitDepth: config.bitDepth,
      bufferSize: config.bufferSize,
    });

    this.isInitialized = true;
  }

  async discoverDevices(): Promise<AudioInputDevice[]> {
    if (!this.isInitialized || !this.nrfConnection) {
      throw new Error('Plugin not initialized');
    }

    const devices: AudioInputDevice[] = [];

    try {
      // Scan for nRF devices
      const nrfDevices = await this.nrfConnection.scanForDevices();
      
      for (const device of nrfDevices) {
        const capabilities: AudioInputCapabilities = {
          monitoring: true,
          directMonitoring: false,
          phantom48V: false,
          highGain: device.hasPreamp || false,
          lowLatency: true,
          multiChannel: device.channels > 1,
          midi: false,
          synchronization: true,
          networkStreaming: false,
          wirelessRange: device.range || 100, // meters
        };

        devices.push({
          id: device.id,
          name: device.name || `nRF Audio Device ${device.id}`,
          type: 'nrf',
          manufacturer: device.manufacturer || 'Unknown',
          channels: device.channels || 2,
          sampleRates: device.supportedSampleRates || [44100, 48000, 96000],
          bitDepths: device.supportedBitDepths || [16, 24],
          maxLatency: device.maxLatency || 10,
          isAvailable: device.isConnectable,
          capabilities,
        });
      }

      return devices;
    } catch (error) {
      console.error('Error discovering nRF devices:', error);
      return [];
    }
  }

  async connect(
    deviceId: string,
    config: AudioInputConfiguration
  ): Promise<AudioInputResult> {
    if (!this.nrfConnection) {
      return {
        success: false,
        error: 'Plugin not initialized',
      };
    }

    try {
      // Connect to the nRF device
      const connectionResult = await this.nrfConnection.connect(deviceId, {
        sampleRate: config.sampleRate,
        bitDepth: config.bitDepth,
        channels: config.channels.length,
        bufferSize: config.bufferSize,
      });

      if (!connectionResult.success) {
        return {
          success: false,
          error: connectionResult.error || 'Failed to connect to nRF device',
        };
      }

      this.currentDevice = connectionResult.device;
      
      return {
        success: true,
        device: this.currentDevice,
        metadata: {
          actualLatency: connectionResult.latency,
          actualSampleRate: connectionResult.sampleRate,
          actualChannels: connectionResult.channels,
          signalStrength: connectionResult.signalStrength,
          batteryLevel: connectionResult.batteryLevel,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  async disconnect(): Promise<void> {
    if (this.currentStream) {
      await this.stopStream();
    }

    if (this.nrfConnection && this.currentDevice) {
      await this.nrfConnection.disconnect(this.currentDevice.id);
    }

    this.currentDevice = undefined;
    this.currentStream = undefined;
  }

  async startStream(): Promise<AudioInputResult> {
    if (!this.currentDevice || !this.nrfConnection || !this.context) {
      return {
        success: false,
        error: 'No device connected',
      };
    }

    try {
      // Start audio stream from nRF device
      const streamResult = await this.nrfConnection.startAudioStream(this.currentDevice.id);
      
      if (!streamResult.success || !streamResult.audioData) {
        return {
          success: false,
          error: streamResult.error || 'Failed to start audio stream',
        };
      }

      // Create audio stream
      const stream = await this.createAudioStream(streamResult.audioData);
      
      this.currentStream = {
        id: `nrf-stream-${this.currentDevice.id}`,
        deviceId: this.currentDevice.id,
        sampleRate: streamResult.sampleRate || this.config!.sampleRate,
        bitDepth: streamResult.bitDepth || this.config!.bitDepth,
        channels: streamResult.channels || this.currentDevice.channels,
        latency: streamResult.latency || 10,
        isActive: true,
        stream,
        audioNode: streamResult.audioNode,
      };

      return {
        success: true,
        stream: this.currentStream,
        metadata: {
          actualLatency: this.currentStream.latency,
          actualSampleRate: this.currentStream.sampleRate,
          actualChannels: this.currentStream.channels,
          signalStrength: streamResult.signalStrength,
          batteryLevel: streamResult.batteryLevel,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to start stream: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  async stopStream(): Promise<void> {
    if (this.currentStream && this.nrfConnection) {
      await this.nrfConnection.stopAudioStream(this.currentStream.deviceId);
      
      // Stop media stream tracks
      this.currentStream.stream.getTracks().forEach(track => track.stop());
      
      this.currentStream = undefined;
    }
  }

  canHandle(deviceType: string, protocol?: string): boolean {
    const supportedTypes = ['nrf', 'nrf24l01', 'nrf52', 'wireless-audio'];
    const supportedProtocols = ['nrf24l01', 'nrf52', 'ble', 'proprietary-rf'];
    
    if (supportedTypes.includes(deviceType.toLowerCase())) {
      return true;
    }
    
    if (protocol && supportedProtocols.includes(protocol.toLowerCase())) {
      return true;
    }
    
    return false;
  }

  getStreamInfo(): AudioInputStream | null {
    return this.currentStream || null;
  }

  async updateConfiguration(config: Partial<AudioInputConfiguration>): Promise<void> {
    if (!this.config) {
      throw new Error('Plugin not initialized');
    }

    this.config = { ...this.config, ...config };
    
    // If there's an active stream, update it
    if (this.currentStream && this.nrfConnection) {
      await this.nrfConnection.updateConfiguration(this.currentDevice!.id, {
        sampleRate: config.sampleRate,
        bitDepth: config.bitDepth,
        bufferSize: config.bufferSize,
      });
    }
  }

  async getDeviceControls(deviceId: string): Promise<any> {
    if (!this.nrfConnection) {
      throw new Error('Plugin not initialized');
    }

    return await this.nrfConnection.getDeviceControls(deviceId);
  }

  async validateConfiguration(config: AudioInputConfiguration): Promise<boolean> {
    // Validate sample rate
    const supportedSampleRates = [44100, 48000, 96000];
    if (!supportedSampleRates.includes(config.sampleRate)) {
      return false;
    }

    // Validate bit depth
    const supportedBitDepths = [16, 24];
    if (!supportedBitDepths.includes(config.bitDepth)) {
      return false;
    }

    // Validate channel count
    if (config.channels.length > 8) {
      return false;
    }

    return true;
  }

  async dispose(): Promise<void> {
    await this.disconnect();
    
    if (this.nrfConnection) {
      await this.nrfConnection.dispose();
      this.nrfConnection = undefined;
    }
    
    this.isInitialized = false;
  }

  private isNRFSupported(): boolean {
    // Check for Web Bluetooth API (for BLE nRF devices)
    if ('bluetooth' in navigator) {
      return true;
    }

    // Check for WebUSB API (for USB nRF dongles)
    if ('usb' in navigator) {
      return true;
    }

    // Check for Serial API (for serial nRF connections)
    if ('serial' in navigator) {
      return true;
    }

    return false;
  }

  private async createAudioStream(audioData: Float32Array): Promise<MediaStream> {
    if (!this.context?.audioContext) {
      throw new Error('Audio context not available');
    }

    // Create a MediaStream from the nRF audio data
    const audioBuffer = this.context.audioContext.createBuffer(
      this.currentStream?.channels || 2,
      audioData.length,
      this.config!.sampleRate
    );

    // Fill the buffer with audio data
    for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
      const channelData = audioBuffer.getChannelData(channel);
      for (let i = 0; i < audioData.length; i++) {
        channelData[i] = audioData[i];
      }
    }

    // Create a MediaStreamAudioSourceNode (this is a simplified approach)
    // In a real implementation, you'd want to create a proper MediaStream
    const stream = new MediaStream();
    
    return stream;
  }
}

/**
 * nRF Connection Manager
 * Handles low-level nRF device communication
 */
class NRFConnection {
  private config: any;
  private connectedDevices = new Map<string, any>();

  constructor(config: any) {
    this.config = config;
  }

  async scanForDevices(): Promise<any[]> {
    const devices: any[] = [];

    try {
      // Scan for Bluetooth LE nRF devices
      if ('bluetooth' in navigator) {
        const bleDevices = await this.scanBLEDevices();
        devices.push(...bleDevices);
      }

      // Scan for USB nRF devices
      if ('usb' in navigator) {
        const usbDevices = await this.scanUSBDevices();
        devices.push(...usbDevices);
      }

      // Scan for Serial nRF devices
      if ('serial' in navigator) {
        const serialDevices = await this.scanSerialDevices();
        devices.push(...serialDevices);
      }
    } catch (error) {
      console.error('Error scanning for nRF devices:', error);
    }

    return devices;
  }

  async connect(deviceId: string, config: any): Promise<any> {
    // Implementation would depend on the connection type (BLE, USB, Serial)
    // This is a simplified mock implementation
    
    return {
      success: true,
      device: {
        id: deviceId,
        name: `nRF Audio Device ${deviceId}`,
        channels: 2,
        supportedSampleRates: [44100, 48000],
        supportedBitDepths: [16, 24],
        maxLatency: 8,
        isConnectable: true,
      },
      latency: 8,
      sampleRate: config.sampleRate,
      channels: config.channels,
      signalStrength: -45, // dBm
      batteryLevel: 85, // percentage
    };
  }

  async disconnect(deviceId: string): Promise<void> {
    this.connectedDevices.delete(deviceId);
  }

  async startAudioStream(deviceId: string): Promise<any> {
    // Mock audio data - in real implementation, this would come from the nRF device
    const audioData = new Float32Array(1024);
    for (let i = 0; i < audioData.length; i++) {
      audioData[i] = Math.sin(2 * Math.PI * 440 * i / 44100) * 0.1; // 440Hz sine wave
    }

    return {
      success: true,
      audioData,
      sampleRate: this.config.sampleRate,
      bitDepth: this.config.bitDepth,
      channels: 2,
      latency: 8,
      signalStrength: -45,
      batteryLevel: 85,
    };
  }

  async stopAudioStream(deviceId: string): Promise<void> {
    // Stop audio streaming from the nRF device
  }

  async updateConfiguration(deviceId: string, config: any): Promise<void> {
    // Update device configuration
  }

  async getDeviceControls(deviceId: string): Promise<any> {
    return {
      gain: { min: 0, max: 60, current: 30, unit: 'dB' },
      highpass: { min: 20, max: 200, current: 80, unit: 'Hz' },
      batteryLevel: { current: 85, unit: '%' },
      signalStrength: { current: -45, unit: 'dBm' },
      transmissionPower: { min: -20, max: 4, current: 0, unit: 'dBm' },
    };
  }

  async dispose(): Promise<void> {
    for (const deviceId of this.connectedDevices.keys()) {
      await this.disconnect(deviceId);
    }
  }

  private async scanBLEDevices(): Promise<any[]> {
    // Scan for Bluetooth LE nRF devices
    try {
      const device = await (navigator as any).bluetooth.requestDevice({
        filters: [
          { services: ['12345678-1234-1234-1234-123456789abc'] }, // nRF audio service UUID
          { namePrefix: 'nRF Audio' },
          { namePrefix: 'Nordic' },
        ],
        optionalServices: ['battery_service', 'device_information'],
      });

      return [{
        id: device.id,
        name: device.name,
        type: 'ble',
        channels: 2,
        supportedSampleRates: [44100, 48000],
        supportedBitDepths: [16, 24],
        maxLatency: 10,
        isConnectable: true,
        hasPreamp: true,
        range: 50,
      }];
    } catch (error) {
      return [];
    }
  }

  private async scanUSBDevices(): Promise<any[]> {
    // Scan for USB nRF devices
    try {
      const devices = await (navigator as any).usb.getDevices();
      return devices
        .filter((device: any) => 
          device.vendorId === 0x1915 || // Nordic Semiconductor vendor ID
          device.productName?.includes('nRF') ||
          device.manufacturerName?.includes('Nordic')
        )
        .map((device: any) => ({
          id: `usb-${device.serialNumber || device.productId}`,
          name: device.productName || 'nRF USB Audio Device',
          type: 'usb',
          channels: 8,
          supportedSampleRates: [44100, 48000, 96000],
          supportedBitDepths: [16, 24],
          maxLatency: 5,
          isConnectable: true,
          hasPreamp: false,
          range: 0, // USB doesn't have wireless range
        }));
    } catch (error) {
      return [];
    }
  }

  private async scanSerialDevices(): Promise<any[]> {
    // Scan for Serial nRF devices
    try {
      const ports = await (navigator as any).serial.getPorts();
      return ports
        .filter((port: any) => 
          port.getInfo().usbVendorId === 0x1915 || // Nordic Semiconductor
          port.getInfo().usbProductId === 0x521F    // nRF52840 Dongle
        )
        .map((port: any, index: number) => ({
          id: `serial-${index}`,
          name: 'nRF Serial Audio Device',
          type: 'serial',
          channels: 2,
          supportedSampleRates: [44100, 48000],
          supportedBitDepths: [16, 24],
          maxLatency: 12,
          isConnectable: true,
          hasPreamp: false,
          range: 100,
        }));
    } catch (error) {
      return [];
    }
  }
}

export default NRFAudioInputPlugin;
