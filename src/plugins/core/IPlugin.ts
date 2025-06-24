/**
 * Core Plugin Interface for Orpheus Engine
 * Defines the contract that all plugins must implement
 */

export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  category: 'effect' | 'instrument' | 'analysis' | 'ui' | 'utility';

  // Compatibility and dependencies
  engineVersion: string;
  platform: 'electron' | 'browser' | 'universal';
  dependencies?: string[];

  // Plugin capabilities
  capabilities: {
    audio?: boolean;
    midi?: boolean;
    ui?: boolean;
    python?: boolean;
  };

  // Entry points
  main: string;
  ui?: string;
  python?: string;

  // Permissions required
  permissions?: Array<
    'file_system' | 'audio_devices' | 'network' | 'python_backend'
  >;
}

export interface PluginContext {
  // Core services
  audioService: any; // Will be typed properly when AudioService is available
  pythonBackend: any; // Connection to Python RAG backend

  // Platform detection
  platform: 'electron' | 'browser';
  capabilities: {
    fileSystem: boolean;
    audioDevices: boolean;
    pythonBackend: boolean;
  };

  // Event system
  emit(event: string, data?: any): void;
  on(event: string, callback: (data: any) => void): void;
  off(event: string, callback: (data: any) => void): void;

  // State management
  getState(key: string): any;
  setState(key: string, value: any): void;

  // Logging
  log: {
    info: (message: string, data?: any) => void;
    warn: (message: string, data?: any) => void;
    error: (message: string, data?: any) => void;
    debug: (message: string, data?: any) => void;
  };
}

export interface IPlugin {
  manifest: PluginManifest;

  // Lifecycle methods
  initialize(context: PluginContext): Promise<void>;
  activate(): Promise<void>;
  deactivate(): Promise<void>;
  destroy(): Promise<void>;

  // Plugin-specific processing
  processAudio?(audioData: Float32Array[]): Promise<Float32Array[]>;
  processMidi?(midiData: any): Promise<any>;

  // UI integration
  createUI?(): HTMLElement | React.ReactElement;

  // Configuration
  getConfiguration?(): Record<string, any>;
  setConfiguration?(config: Record<string, any>): void;

  // Health check
  isHealthy(): boolean;
}

export abstract class BasePlugin implements IPlugin {
  public manifest: PluginManifest;
  protected context?: PluginContext;
  protected isActive = false;
  protected config: Record<string, any> = {};

  constructor(manifest: PluginManifest) {
    this.manifest = manifest;
  }

  async initialize(context: PluginContext): Promise<void> {
    this.context = context;
    context.log.info(`Initializing plugin: ${this.manifest.name}`);
  }

  async activate(): Promise<void> {
    if (!this.context) {
      throw new Error('Plugin not initialized');
    }
    this.isActive = true;
    this.context.log.info(`Activating plugin: ${this.manifest.name}`);
  }

  async deactivate(): Promise<void> {
    this.isActive = false;
    this.context?.log.info(`Deactivating plugin: ${this.manifest.name}`);
  }

  async destroy(): Promise<void> {
    this.isActive = false;
    this.context?.log.info(`Destroying plugin: ${this.manifest.name}`);
    this.context = undefined;
  }

  getConfiguration(): Record<string, any> {
    return { ...this.config };
  }

  setConfiguration(config: Record<string, any>): void {
    this.config = { ...this.config, ...config };
  }

  isHealthy(): boolean {
    return this.context !== undefined && this.isActive;
  }
}
