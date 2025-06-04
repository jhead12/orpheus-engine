/**
 * MADI Audio Input Plugin for Orpheus Engine
 * Supports MADI (Multichannel Audio Digital Interface) devices
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

export class MADIAudioInputPlugin implements AudioInputPlugin {
  metadata: AudioInputPluginMetadata = {
    id: 'madi-audio-input',
    name: 'MADI Audio Interface',
    version: '1.0.0',
    category: 'professional',
    supportedDeviceTypes: ['madi', 'professional', 'multichannel'],
    supportedProtocols: ['madi-optical', 'madi-coaxial', 'aes67', 'dante'],
    tags: ['madi', 'professional', 'multichannel', 'broadcast', 'studio'],
    author: 'Orpheus Engine Team',
    description: 'Professional MADI audio interface plugin for broadcast and studio applications',
    minLatency: 1, // Ultra-low latency for professional applications
    maxChannels: 64, // MADI supports up to 64 channels
  };

  private context?: AudioInputPluginContext;
  private config?: AudioInputConfiguration;
  private currentDevice?: AudioInputDevice;
  private currentStream?: AudioInputStream;
  private madiConnection?: MADIConnection;

  async initialize(
    config: AudioInputConfiguration,
    context: AudioInputPluginContext
  ): Promise<void> {
    this.config = config;
    this.context = context;
    
    // Initialize MADI connection manager
    this.madiConnection = new MADIConnection();
  }

  async discoverDevices(): Promise<AudioInputDevice[]> {
    if (!this.madiConnection) {
      throw new Error('Plugin not initialized');
    }

    const devices: AudioInputDevice[] = [];

    try {
      // Discover MADI devices (this would typically interface with system drivers)
      const madiDevices = await this.madiConnection.scanForDevices();
      
      for (const device of madiDevices) {
        const capabilities: AudioInputCapabilities = {
          monitoring: true,
          directMonitoring: true,
          phantom48V: false, // MADI is digital, no phantom power
          highGain: false,
          lowLatency: true,
          multiChannel: true,
          midi: false,
          synchronization: true,
          networkStreaming: device.protocol === 'aes67' || device.protocol === 'dante',
        };

        devices.push({
          id: device.id,
          name: device.name,
          type: 'madi',
          manufacturer: device.manufacturer,
          channels: device.channels,
          sampleRates: device.supportedSampleRates,
          bitDepths: [24, 32], // MADI typically uses 24-bit
          maxLatency: 2, // Professional MADI interfaces have very low latency
          isAvailable: device.isAvailable,
          capabilities,
        });
      }

      return devices;
    } catch (error) {
      console.error('Error discovering MADI devices:', error);
      return [];
    }
  }

  async connect(
    deviceId: string,
    config: AudioInputConfiguration
  ): Promise<AudioInputResult> {
    if (!this.madiConnection) {
      return {
        success: false,
        error: 'Plugin not initialized',
      };
    }

    try {
      const connectionResult = await this.madiConnection.connect(deviceId, {
        sampleRate: config.sampleRate,
        bitDepth: config.bitDepth,
        channels: config.channels.length,
        clockSource: 'internal', // or 'external' for sync
        wordClock: config.wordClock || 'internal',
      });

      if (!connectionResult.success) {
        return {
          success: false,
          error: connectionResult.error || 'Failed to connect to MADI device',
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
          clockSource: connectionResult.clockSource,
          syncStatus: connectionResult.syncStatus,
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

    if (this.madiConnection && this.currentDevice) {
      await this.madiConnection.disconnect(this.currentDevice.id);
    }

    this.currentDevice = undefined;
    this.currentStream = undefined;
  }

  async startStream(): Promise<AudioInputResult> {
    if (!this.currentDevice || !this.madiConnection || !this.config) {
      return {
        success: false,
        error: 'No device connected',
      };
    }

    try {
      const streamResult = await this.madiConnection.startAudioStream(
        this.currentDevice.id,
        {
          channels: this.config.channels.map(ch => ch.index),
          sampleRate: this.config.sampleRate,
          bitDepth: this.config.bitDepth,
          bufferSize: this.config.bufferSize,
        }
      );
      
      if (!streamResult.success) {
        return {
          success: false,
          error: streamResult.error || 'Failed to start audio stream',
        };
      }

      // Create audio stream from MADI data
      const stream = await this.createAudioStreamFromMADI(streamResult.audioData);
      
      this.currentStream = {
        id: `madi-stream-${this.currentDevice.id}`,
        deviceId: this.currentDevice.id,
        sampleRate: streamResult.sampleRate || this.config.sampleRate,
        bitDepth: streamResult.bitDepth || this.config.bitDepth,
        channels: streamResult.channels || this.currentDevice.channels,
        latency: streamResult.latency || 2,
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
          clockSource: streamResult.clockSource,
          syncStatus: streamResult.syncStatus,
          channelMap: streamResult.channelMap,
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
    if (this.currentStream && this.madiConnection) {
      await this.madiConnection.stopAudioStream(this.currentStream.deviceId);
      
      this.currentStream.stream.getTracks().forEach(track => track.stop());
      this.currentStream = undefined;
    }
  }

  canHandle(deviceType: string, protocol?: string): boolean {
    const supportedTypes = ['madi', 'multichannel', 'professional'];
    const supportedProtocols = ['madi-optical', 'madi-coaxial', 'aes67', 'dante'];
    
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
    
    // Update MADI device configuration
    if (this.currentStream && this.madiConnection) {
      await this.madiConnection.updateConfiguration(this.currentDevice!.id, {
        sampleRate: config.sampleRate,
        bitDepth: config.bitDepth,
        channels: config.channels?.length,
        bufferSize: config.bufferSize,
      });
    }
  }

  async getDeviceControls(deviceId: string): Promise<any> {
    if (!this.madiConnection) {
      throw new Error('Plugin not initialized');
    }

    return await this.madiConnection.getDeviceControls(deviceId);
  }

  async validateConfiguration(config: AudioInputConfiguration): Promise<boolean> {
    // MADI typically supports specific sample rates
    const supportedSampleRates = [44100, 48000, 88200, 96000];
    if (!supportedSampleRates.includes(config.sampleRate)) {
      return false;
    }

    // MADI uses 24-bit audio
    if (config.bitDepth !== 24 && config.bitDepth !== 32) {
      return false;
    }

    // Validate channel count (MADI supports up to 64 channels)
    if (config.channels.length > 64) {
      return false;
    }

    return true;
  }

  private async createAudioStreamFromMADI(audioData: Float32Array[]): Promise<MediaStream> {
    // This would create a MediaStream from MADI audio data
    // In a real implementation, this would interface with the MADI driver
    const stream = new MediaStream();
    return stream;
  }

  async dispose(): Promise<void> {
    await this.disconnect();
    
    if (this.madiConnection) {
      await this.madiConnection.dispose();
      this.madiConnection = undefined;
    }
  }
}

/**
 * MADI Connection Manager
 * Handles low-level MADI device communication
 */
class MADIConnection {
  private connectedDevices = new Map<string, any>();

  async scanForDevices(): Promise<any[]> {
    // In a real implementation, this would scan for MADI devices
    // This could interface with system drivers, network discovery, etc.
    const mockDevices = [
      {
        id: 'rme-madi-1',
        name: 'RME MADIface XT',
        manufacturer: 'RME',
        channels: 64,
        supportedSampleRates: [44100, 48000, 88200, 96000],
        protocol: 'madi-optical',
        isAvailable: true,
      },
      {
        id: 'ssl-madi-1',
        name: 'SSL Network I/O MADI',
        manufacturer: 'Solid State Logic',
        channels: 64,
        supportedSampleRates: [48000, 96000],
        protocol: 'madi-coaxial',
        isAvailable: true,
      },
    ];

    return mockDevices;
  }

  async connect(deviceId: string, config: any): Promise<any> {
    // Mock connection result
    return {
      success: true,
      device: {
        id: deviceId,
        name: 'MADI Device',
        channels: 64,
        supportedSampleRates: [48000, 96000],
        isAvailable: true,
      },
      latency: 1,
      sampleRate: config.sampleRate,
      channels: config.channels,
      clockSource: config.clockSource,
      syncStatus: 'locked',
    };
  }

  async disconnect(deviceId: string): Promise<void> {
    this.connectedDevices.delete(deviceId);
  }

  async startAudioStream(deviceId: string, config: any): Promise<any> {
    // Mock audio stream result
    const audioData = Array.from({ length: config.channels }, () => new Float32Array(1024));
    
    return {
      success: true,
      audioData,
      sampleRate: config.sampleRate,
      bitDepth: config.bitDepth,
      channels: config.channels,
      latency: 1,
      clockSource: 'internal',
      syncStatus: 'locked',
      channelMap: Array.from({ length: config.channels }, (_, i) => ({
        input: i + 1,
        output: i + 1,
        name: `Ch ${i + 1}`,
      })),
    };
  }

  async stopAudioStream(deviceId: string): Promise<void> {
    // Stop MADI audio stream
  }

  async updateConfiguration(deviceId: string, config: any): Promise<void> {
    // Update MADI device configuration
  }

  async getDeviceControls(deviceId: string): Promise<any> {
    return {
      clockSource: {
        options: ['internal', 'wordclock', 'madi'],
        current: 'internal',
      },
      sampleRate: {
        options: [44100, 48000, 88200, 96000],
        current: 48000,
      },
      syncStatus: {
        status: 'locked',
        source: 'internal',
      },
      channelSettings: Array.from({ length: 64 }, (_, i) => ({
        channel: i + 1,
        active: i < 8, // First 8 channels active by default
        gain: 0,
        phase: false,
        mute: false,
      })),
    };
  }

  async dispose(): Promise<void> {
    for (const deviceId of this.connectedDevices.keys()) {
      await this.disconnect(deviceId);
    }
  }
}

export default MADIAudioInputPlugin;
