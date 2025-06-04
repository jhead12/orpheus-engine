/**
 * Audio Input Plugin Manager for Orpheus Engine
 * Manages audio input plugins and device connections
 */

import {
  AudioInputPlugin,
  AudioInputPluginManager,
  AudioInputPluginRegistry,
  AudioInputDevice,
  AudioInputConfiguration,
  AudioInputResult,
  AudioInputStream,
  AudioInputPluginMetadata,
  AudioInputEvents,
} from './types';

import NRFAudioInputPlugin from './built-in/NRFAudioInputPlugin';
import USBAudioInputPlugin from './built-in/USBAudioInputPlugin';
import MADIAudioInputPlugin from './built-in/MADIAudioInputPlugin';

/**
 * Audio Input Plugin Registry Implementation
 */
export class AudioInputPluginRegistryImpl implements AudioInputPluginRegistry {
  private plugins = new Map<string, AudioInputPlugin>();

  register(plugin: AudioInputPlugin): void {
    this.plugins.set(plugin.metadata.id, plugin);
  }

  unregister(pluginId: string): void {
    this.plugins.delete(pluginId);
  }

  getPlugin(pluginId: string): AudioInputPlugin | undefined {
    return this.plugins.get(pluginId);
  }

  getPluginsByCategory(category: string): AudioInputPlugin[] {
    return Array.from(this.plugins.values()).filter(
      plugin => plugin.metadata.category === category
    );
  }

  getPluginsForDeviceType(deviceType: string): AudioInputPlugin[] {
    return Array.from(this.plugins.values()).filter(
      plugin => plugin.metadata.supportedDeviceTypes.includes(deviceType)
    );
  }

  getAllPlugins(): AudioInputPlugin[] {
    return Array.from(this.plugins.values());
  }
}

/**
 * Audio Input Plugin Manager Implementation
 */
export class AudioInputPluginManagerImpl implements AudioInputPluginManager {
  registry: AudioInputPluginRegistry;
  private eventListeners = new Map<keyof AudioInputEvents, Function[]>();
  private currentStream: AudioInputStream | null = null;
  private connectedDevice: AudioInputDevice | null = null;
  private activePlugin: AudioInputPlugin | null = null;

  constructor() {
    this.registry = new AudioInputPluginRegistryImpl();
  }

  async loadPlugins(): Promise<void> {
    // Load built-in plugins
    const builtInPlugins = [
      new NRFAudioInputPlugin(),
      new USBAudioInputPlugin(),
      new MADIAudioInputPlugin(),
      // Add other built-in plugins here
    ];

    for (const plugin of builtInPlugins) {
      this.registry.register(plugin);
    }

    // Note: 'plugins-loaded' event would need to be added to AudioInputEvents type if needed
  }

  async installPlugin(source: string): Promise<AudioInputPlugin> {
    // Implementation for installing external plugins
    // This could support loading from URLs, npm packages, etc.
    throw new Error('External plugin installation not yet implemented');
  }

  async uninstallPlugin(pluginId: string): Promise<void> {
    const plugin = this.registry.getPlugin(pluginId);
    if (plugin) {
      await plugin.dispose?.();
      this.registry.unregister(pluginId);
    }
  }

  async updatePlugin(pluginId: string): Promise<AudioInputPlugin> {
    // Implementation for updating plugins
    throw new Error('Plugin updates not yet implemented');
  }

  async discoverAllDevices(): Promise<AudioInputDevice[]> {
    const allDevices: AudioInputDevice[] = [];
    const plugins = this.registry.getAllPlugins();

    for (const plugin of plugins) {
      try {
        // Initialize plugin with default config if not already initialized
        if (!plugin.getStreamInfo) {
          const defaultConfig: AudioInputConfiguration = {
            sampleRate: 44100,
            bitDepth: 16,
            bufferSize: 512,
            channels: [
              { index: 0, name: 'Left', enabled: true, gain: 0 },
              { index: 1, name: 'Right', enabled: true, gain: 0 },
            ],
            monitoring: {
              enabled: false,
              volume: 0.5,
              latency: 10,
            },
            processing: {
              gainControl: false,
              noiseGate: false,
              compression: false,
              eq: false,
            },
          };

          const context = {
            audioContext: new AudioContext(),
            sessionId: 'discovery-session',
            environment: 'development' as const,
            capabilities: {
              webAudio: true,
              webRTC: true,
              bluetooth: 'bluetooth' in navigator,
              usb: 'usb' in navigator,
              lowLatency: true,
            },
            preferences: {
              preferredLatency: 10,
              preferredSampleRate: 44100,
              preferredBitDepth: 16,
            },
          };

          await plugin.initialize(defaultConfig, context);
        }

        const devices = await plugin.discoverDevices();
        allDevices.push(...devices);
      } catch (error) {
        console.warn(`Failed to discover devices for plugin ${plugin.metadata.id}:`, error);
      }
    }

    this.emit('device-discovered', allDevices);
    return allDevices;
  }

  async connectToDevice(
    deviceId: string,
    config: AudioInputConfiguration
  ): Promise<AudioInputResult> {
    // Find the plugin that can handle this device
    const devices = await this.discoverAllDevices();
    const device = devices.find(d => d.id === deviceId);
    
    if (!device) {
      return {
        success: false,
        error: `Device ${deviceId} not found`,
      };
    }

    const plugins = this.registry.getPluginsForDeviceType(device.type);
    let selectedPlugin: AudioInputPlugin | null = null;
    
    // Find the best plugin for this device
    for (const plugin of plugins) {
      if (plugin.canHandle(device.type)) {
        selectedPlugin = plugin;
        break;
      }
    }

    if (!selectedPlugin) {
      return {
        success: false,
        error: `No plugin found for device type ${device.type}`,
      };
    }

    try {
      // Initialize plugin if needed
      const context = {
        audioContext: new AudioContext(),
        sessionId: `session-${Date.now()}`,
        environment: 'production' as const,
        capabilities: {
          webAudio: true,
          webRTC: true,
          bluetooth: 'bluetooth' in navigator,
          usb: 'usb' in navigator,
          lowLatency: true,
        },
        preferences: {
          preferredLatency: config.monitoring.latency,
          preferredSampleRate: config.sampleRate,
          preferredBitDepth: config.bitDepth,
        },
      };

      await selectedPlugin.initialize(config, context);

      // Connect to device
      const result = await selectedPlugin.connect(deviceId, config);
      
      if (result.success) {
        this.activePlugin = selectedPlugin;
        this.connectedDevice = device;
        this.emit('device-connected', device);
      }

      return result;
    } catch (error) {
      return {
        success: false,
        error: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  async startStream(): Promise<AudioInputResult> {
    if (!this.activePlugin) {
      return {
        success: false,
        error: 'No device connected',
      };
    }

    try {
      const result = await this.activePlugin.startStream();
      
      if (result.success && result.stream) {
        this.currentStream = result.stream;
        this.emit('stream-started', result.stream);
      }

      return result;
    } catch (error) {
      return {
        success: false,
        error: `Failed to start stream: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  async stopStream(): Promise<void> {
    if (this.activePlugin) {
      await this.activePlugin.stopStream();
      this.currentStream = null;
      this.emit('stream-stopped');
    }
  }

  async disconnect(): Promise<void> {
    if (this.activePlugin) {
      await this.activePlugin.disconnect();
      this.activePlugin = null;
      this.connectedDevice = null;
      this.currentStream = null;
      this.emit('device-disconnected', '');
    }
  }

  getRecommendedPlugins(deviceType: string): AudioInputPlugin[] {
    const plugins = this.registry.getPluginsForDeviceType(deviceType);
    
    // Sort by compatibility and features
    return plugins.sort((a, b) => {
      // Prefer plugins with lower latency
      const aLatency = a.metadata.minLatency || 100;
      const bLatency = b.metadata.minLatency || 100;
      
      if (aLatency !== bLatency) {
        return aLatency - bLatency;
      }
      
      // Prefer plugins with more channels
      const aChannels = a.metadata.maxChannels || 0;
      const bChannels = b.metadata.maxChannels || 0;
      
      return bChannels - aChannels;
    });
  }

  async configurePlugin(
    pluginId: string,
    config: AudioInputConfiguration
  ): Promise<void> {
    const plugin = this.registry.getPlugin(pluginId);
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not found`);
    }

    await plugin.updateConfiguration(config);
  }

  getPluginConfiguration(pluginId: string): AudioInputConfiguration | undefined {
    // In a real implementation, this would return the stored configuration
    return undefined;
  }

  findPlugins(criteria: Partial<AudioInputPluginMetadata>): AudioInputPlugin[] {
    return this.registry.getAllPlugins().filter(plugin => {
      const metadata = plugin.metadata;
      
      // Check each criteria
      for (const [key, value] of Object.entries(criteria)) {
        if (key === 'tags') {
          // For tags, check if any match
          const tags = value as string[];
          if (!tags.some(tag => metadata.tags.includes(tag))) {
            return false;
          }
        } else if (key === 'supportedDeviceTypes') {
          // For device types, check if any match
          const types = value as string[];
          if (!types.some(type => metadata.supportedDeviceTypes.includes(type))) {
            return false;
          }
        } else {
          // For other properties, check exact match
          if ((metadata as any)[key] !== value) {
            return false;
          }
        }
      }
      
      return true;
    });
  }

  getCurrentStream(): AudioInputStream | null {
    return this.currentStream;
  }

  // Event management
  on<K extends keyof AudioInputEvents>(event: K, listener: AudioInputEvents[K]): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(listener);
  }

  off<K extends keyof AudioInputEvents>(event: K, listener: AudioInputEvents[K]): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit<K extends keyof AudioInputEvents>(event: K, ...args: Parameters<AudioInputEvents[K]>): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          (listener as any)(...args);
        } catch (error) {
          console.error(`Error in ${event} listener:`, error);
        }
      });
    }
  }

  // Utility methods
  async getDeviceLatency(deviceId: string): Promise<number> {
    const devices = await this.discoverAllDevices();
    const device = devices.find(d => d.id === deviceId);
    return device?.maxLatency || 100;
  }

  async getDeviceCapabilities(deviceId: string): Promise<any> {
    if (!this.activePlugin || !this.connectedDevice || this.connectedDevice.id !== deviceId) {
      throw new Error('Device not connected');
    }

    if (this.activePlugin.getDeviceControls) {
      return await this.activePlugin.getDeviceControls(deviceId);
    }

    return null;
  }

  isDeviceConnected(deviceId: string): boolean {
    return this.connectedDevice?.id === deviceId;
  }

  getConnectedDevice(): AudioInputDevice | null {
    return this.connectedDevice;
  }

  async dispose(): Promise<void> {
    await this.disconnect();
    
    const plugins = this.registry.getAllPlugins();
    for (const plugin of plugins) {
      await plugin.dispose?.();
    }
    
    this.eventListeners.clear();
  }
}

// Create singleton instance
export const audioInputPluginManager = new AudioInputPluginManagerImpl();

export default audioInputPluginManager;
