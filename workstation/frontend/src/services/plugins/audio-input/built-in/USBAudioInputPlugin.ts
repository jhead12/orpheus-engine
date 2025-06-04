/**
 * USB Audio Interface Plugin for Orpheus Engine
 * Supports common USB audio interfaces like Focusrite, PreSonus, etc.
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

export class USBAudioInputPlugin implements AudioInputPlugin {
  metadata: AudioInputPluginMetadata = {
    id: 'usb-audio-input',
    name: 'USB Audio Interface',
    version: '1.0.0',
    category: 'professional',
    supportedDeviceTypes: ['usb', 'audio-interface', 'class-compliant'],
    supportedProtocols: ['usb-audio-class-1', 'usb-audio-class-2', 'asio'],
    tags: ['usb', 'professional', 'multi-channel', 'low-latency'],
    author: 'Orpheus Engine Team',
    description: 'Professional USB audio interface plugin supporting class-compliant devices',
    minLatency: 2, // 2ms minimum latency with good USB interfaces
    maxChannels: 32,
  };

  private context?: AudioInputPluginContext;
  private config?: AudioInputConfiguration;
  private currentDevice?: AudioInputDevice;
  private currentStream?: AudioInputStream;
  private mediaStream?: MediaStream;

  async initialize(
    config: AudioInputConfiguration,
    context: AudioInputPluginContext
  ): Promise<void> {
    this.config = config;
    this.context = context;
  }

  async discoverDevices(): Promise<AudioInputDevice[]> {
    const devices: AudioInputDevice[] = [];

    try {
      // Get available audio input devices
      const audioDevices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = audioDevices.filter(device => device.kind === 'audioinput');

      for (const device of audioInputs) {
        // Filter for USB audio interfaces (this is a simplified detection)
        if (this.isUSBAudioInterface(device)) {
          const capabilities = await this.getDeviceCapabilities(device);
          
          devices.push({
            id: device.deviceId,
            name: device.label || 'USB Audio Interface',
            type: 'usb',
            manufacturer: this.extractManufacturer(device.label),
            channels: capabilities.channels,
            sampleRates: capabilities.sampleRates,
            bitDepths: capabilities.bitDepths,
            maxLatency: capabilities.maxLatency,
            isAvailable: true,
            capabilities: {
              monitoring: true,
              directMonitoring: true,
              phantom48V: capabilities.phantom48V,
              highGain: true,
              lowLatency: true,
              multiChannel: capabilities.channels > 2,
              midi: capabilities.midi,
              synchronization: true,
            },
          });
        }
      }

      return devices;
    } catch (error) {
      console.error('Error discovering USB audio devices:', error);
      return [];
    }
  }

  async connect(
    deviceId: string,
    config: AudioInputConfiguration
  ): Promise<AudioInputResult> {
    try {
      const devices = await this.discoverDevices();
      const device = devices.find(d => d.id === deviceId);
      
      if (!device) {
        return {
          success: false,
          error: 'Device not found',
        };
      }

      this.currentDevice = device;
      
      return {
        success: true,
        device: this.currentDevice,
        metadata: {
          actualSampleRate: config.sampleRate,
          actualChannels: config.channels.length,
          driverType: 'web-audio',
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
    this.currentDevice = undefined;
    this.currentStream = undefined;
  }

  async startStream(): Promise<AudioInputResult> {
    if (!this.currentDevice || !this.config) {
      return {
        success: false,
        error: 'No device connected',
      };
    }

    try {
      const constraints: MediaStreamConstraints = {
        audio: {
          deviceId: { exact: this.currentDevice.id },
          sampleRate: { ideal: this.config.sampleRate },
          channelCount: { ideal: this.config.channels.length },
          latency: { ideal: 0.01 }, // 10ms
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.mediaStream = stream;

      this.currentStream = {
        id: `usb-stream-${this.currentDevice.id}`,
        deviceId: this.currentDevice.id,
        sampleRate: this.config.sampleRate,
        bitDepth: this.config.bitDepth,
        channels: this.config.channels.length,
        latency: 5, // Typical USB audio latency
        isActive: true,
        stream,
      };

      return {
        success: true,
        stream: this.currentStream,
        metadata: {
          actualLatency: this.currentStream.latency,
          actualSampleRate: this.currentStream.sampleRate,
          actualChannels: this.currentStream.channels,
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
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = undefined;
    }
    this.currentStream = undefined;
  }

  canHandle(deviceType: string, protocol?: string): boolean {
    const supportedTypes = ['usb', 'audio-interface', 'class-compliant'];
    const supportedProtocols = ['usb-audio-class-1', 'usb-audio-class-2', 'asio'];
    
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
    
    // Restart stream if active to apply new configuration
    if (this.currentStream) {
      await this.stopStream();
      await this.startStream();
    }
  }

  async validateConfiguration(config: AudioInputConfiguration): Promise<boolean> {
    // Validate sample rate
    const supportedSampleRates = [44100, 48000, 88200, 96000, 176400, 192000];
    if (!supportedSampleRates.includes(config.sampleRate)) {
      return false;
    }

    // Validate bit depth
    const supportedBitDepths = [16, 24, 32];
    if (!supportedBitDepths.includes(config.bitDepth)) {
      return false;
    }

    return true;
  }

  private isUSBAudioInterface(device: MediaDeviceInfo): boolean {
    const usbIndicators = [
      'usb', 'focusrite', 'presonus', 'scarlett', 'audiobox', 'behringer',
      'steinberg', 'rme', 'motu', 'zoom', 'tascam', 'roland', 'yamaha',
      'mackie', 'm-audio', 'native instruments', 'arturia', 'apogee'
    ];
    
    const labelLower = device.label.toLowerCase();
    return usbIndicators.some(indicator => labelLower.includes(indicator));
  }

  private extractManufacturer(label: string): string {
    const manufacturers = [
      'Focusrite', 'PreSonus', 'Behringer', 'Steinberg', 'RME', 'MOTU',
      'Zoom', 'Tascam', 'Roland', 'Yamaha', 'Mackie', 'M-Audio',
      'Native Instruments', 'Arturia', 'Apogee'
    ];
    
    for (const manufacturer of manufacturers) {
      if (label.toLowerCase().includes(manufacturer.toLowerCase())) {
        return manufacturer;
      }
    }
    
    return 'Unknown';
  }

  private async getDeviceCapabilities(device: MediaDeviceInfo): Promise<any> {
    // This would typically query the device for its actual capabilities
    // For now, we'll return common USB audio interface specs
    const capabilities = {
      channels: 2, // Default to stereo, could be detected
      sampleRates: [44100, 48000, 96000],
      bitDepths: [16, 24],
      maxLatency: 10,
      phantom48V: true, // Most professional interfaces have phantom power
      midi: false, // Some have MIDI, but we'll default to false
    };

    // Enhance based on device name patterns
    const labelLower = device.label.toLowerCase();
    
    if (labelLower.includes('18i') || labelLower.includes('24i')) {
      capabilities.channels = 8; // Multi-channel interfaces
    } else if (labelLower.includes('4i') || labelLower.includes('6i')) {
      capabilities.channels = 4;
    }

    if (labelLower.includes('clarett') || labelLower.includes('rme') || labelLower.includes('apogee')) {
      capabilities.sampleRates.push(192000); // High-end interfaces
      capabilities.maxLatency = 3;
    }

    return capabilities;
  }

  async dispose(): Promise<void> {
    await this.disconnect();
  }
}

export default USBAudioInputPlugin;
