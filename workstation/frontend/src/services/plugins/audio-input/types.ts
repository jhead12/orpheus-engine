/**
 * Audio Input Plugin System Types for Orpheus Engine
 * Supports various audio input devices including nRF, MADI, USB audio interfaces, etc.
 */

/**
 * Audio input device information
 */
export interface AudioInputDevice {
  id: string;
  name: string;
  type: 'usb' | 'bluetooth' | 'madi' | 'nrf' | 'thunderbolt' | 'pci' | 'network';
  manufacturer?: string;
  channels: number;
  sampleRates: number[];
  bitDepths: number[];
  maxLatency: number; // in milliseconds
  isAvailable: boolean;
  capabilities: AudioInputCapabilities;
}

/**
 * Audio input capabilities
 */
export interface AudioInputCapabilities {
  monitoring: boolean;
  directMonitoring: boolean;
  phantom48V: boolean;
  highGain: boolean;
  lowLatency: boolean;
  multiChannel: boolean;
  midi: boolean;
  synchronization: boolean;
  networkStreaming?: boolean;
  wirelessRange?: number; // for wireless devices like nRF
}

/**
 * Audio input plugin metadata
 */
export interface AudioInputPluginMetadata {
  id: string;
  name: string;
  version: string;
  category: 'wireless' | 'professional' | 'consumer' | 'network' | 'specialty';
  supportedDeviceTypes: string[];
  supportedProtocols: string[];
  tags: string[];
  author?: string;
  description?: string;
  homepage?: string;
  license?: string;
  icon?: string;
  minLatency?: number;
  maxChannels?: number;
}

/**
 * Audio input configuration
 */
export interface AudioInputConfiguration {
  deviceId?: string;
  sampleRate: number;
  bitDepth: number;
  bufferSize: number;
  channels: AudioChannelConfiguration[];
  monitoring: {
    enabled: boolean;
    volume: number;
    latency: number;
  };
  processing: {
    gainControl: boolean;
    noiseGate: boolean;
    compression: boolean;
    eq: boolean;
  };
  // Plugin-specific configuration
  [key: string]: any;
}

/**
 * Audio channel configuration
 */
export interface AudioChannelConfiguration {
  index: number;
  name: string;
  enabled: boolean;
  gain: number;
  phantom48V?: boolean;
  highpass?: number;
  pad?: boolean;
}

/**
 * Audio input stream information
 */
export interface AudioInputStream {
  id: string;
  deviceId: string;
  sampleRate: number;
  bitDepth: number;
  channels: number;
  latency: number;
  isActive: boolean;
  stream: MediaStream;
  audioNode?: AudioNode;
}

/**
 * Audio input plugin context
 */
export interface AudioInputPluginContext {
  audioContext: AudioContext;
  sessionId: string;
  environment: 'development' | 'production' | 'test';
  capabilities: {
    webAudio: boolean;
    webRTC: boolean;
    bluetooth: boolean;
    usb: boolean;
    lowLatency: boolean;
  };
  preferences: {
    preferredLatency: number;
    preferredSampleRate: number;
    preferredBitDepth: number;
  };
}

/**
 * Audio input plugin result
 */
export interface AudioInputResult {
  success: boolean;
  stream?: AudioInputStream;
  device?: AudioInputDevice;
  error?: string;
  warnings?: string[];
  metadata?: {
    actualLatency?: number;
    actualSampleRate?: number;
    actualChannels?: number;
    [key: string]: any;
  };
}

/**
 * Main audio input plugin interface
 */
export interface AudioInputPlugin {
  metadata: AudioInputPluginMetadata;
  
  /**
   * Initialize the plugin with configuration and context
   */
  initialize(config: AudioInputConfiguration, context: AudioInputPluginContext): Promise<void>;
  
  /**
   * Discover available audio input devices
   */
  discoverDevices(): Promise<AudioInputDevice[]>;
  
  /**
   * Connect to an audio input device
   */
  connect(deviceId: string, config: AudioInputConfiguration): Promise<AudioInputResult>;
  
  /**
   * Disconnect from the current device
   */
  disconnect(): Promise<void>;
  
  /**
   * Start audio input stream
   */
  startStream(): Promise<AudioInputResult>;
  
  /**
   * Stop audio input stream
   */
  stopStream(): Promise<void>;
  
  /**
   * Check if plugin can handle the given device type
   */
  canHandle(deviceType: string, protocol?: string): boolean;
  
  /**
   * Get current stream information
   */
  getStreamInfo(): AudioInputStream | null;
  
  /**
   * Update configuration
   */
  updateConfiguration(config: Partial<AudioInputConfiguration>): Promise<void>;
  
  /**
   * Get device-specific controls
   */
  getDeviceControls?(deviceId: string): Promise<any>;
  
  /**
   * Validate plugin configuration
   */
  validateConfiguration?(config: AudioInputConfiguration): Promise<boolean>;
  
  /**
   * Clean up resources
   */
  dispose?(): Promise<void>;
}

/**
 * Audio input plugin registry interface
 */
export interface AudioInputPluginRegistry {
  register(plugin: AudioInputPlugin): void;
  unregister(pluginId: string): void;
  getPlugin(pluginId: string): AudioInputPlugin | undefined;
  getPluginsByCategory(category: string): AudioInputPlugin[];
  getPluginsForDeviceType(deviceType: string): AudioInputPlugin[];
  getAllPlugins(): AudioInputPlugin[];
}

/**
 * Audio input plugin manager interface
 */
export interface AudioInputPluginManager {
  registry: AudioInputPluginRegistry;
  
  loadPlugins(): Promise<void>;
  installPlugin(source: string): Promise<AudioInputPlugin>;
  uninstallPlugin(pluginId: string): Promise<void>;
  updatePlugin(pluginId: string): Promise<AudioInputPlugin>;
  
  discoverAllDevices(): Promise<AudioInputDevice[]>;
  connectToDevice(deviceId: string, config: AudioInputConfiguration): Promise<AudioInputResult>;
  getRecommendedPlugins(deviceType: string): AudioInputPlugin[];
  
  configurePlugin(pluginId: string, config: AudioInputConfiguration): Promise<void>;
  getPluginConfiguration(pluginId: string): AudioInputConfiguration | undefined;
  
  findPlugins(criteria: Partial<AudioInputPluginMetadata>): AudioInputPlugin[];
  getCurrentStream(): AudioInputStream | null;
}

/**
 * Audio input events
 */
export interface AudioInputEvents {
  'device-connected': (device: AudioInputDevice) => void;
  'device-disconnected': (deviceId: string) => void;
  'stream-started': (stream: AudioInputStream) => void;
  'stream-stopped': () => void;
  'error': (error: Error) => void;
  'latency-changed': (latency: number) => void;
  'device-discovered': (devices: AudioInputDevice[]) => void;
}
