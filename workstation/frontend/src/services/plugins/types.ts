/**
 * Plugin System Types for Orpheus Engine Audio Export
 * Supports dApps, Node.js, and React applications
 */

import { Clip } from '../types/types';

/**
 * Plugin metadata interface
 */
export interface PluginMetadata {
  id: string;
  name: string;
  version: string;
  category: 'storage' | 'blockchain' | 'dapp' | 'utility' | 'export' | 'cloud' | 'local';
  supportedFormats: string[];
  tags: string[];
  author?: string;
  description?: string;
  homepage?: string;
  license?: string;
  icon?: string;
}

/**
 * Plugin context provided to plugins during initialization
 */
export interface PluginContext {
  audioContext: AudioContext;
  sessionId: string;
  environment: 'development' | 'production' | 'test';
  capabilities: {
    blockchain: boolean;
    ipfs: boolean;
    webRTC: boolean;
    offlineStorage: boolean;
  };
}

/**
 * Export options for plugins
 */
export interface ExportPluginOptions {
  // Storage options
  storage?: {
    provider?: 'local' | 'ipfs' | 'aws-s3' | 'google-cloud' | 'azure-blob' | 'dropbox' | 'cloudflare-r2';
    bucket?: string;
    path?: string;
    options?: Record<string, any>;
  };
  
  // Blockchain options
  blockchain?: {
    storyProtocol?: {
      enabled: boolean;
      registerIP?: boolean;
      licenseTerms?: string;
      metadata?: {
        title?: string;
        creator?: string;
        license?: string;
        [key: string]: any;
      };
    };
  };
  
  // Audio format options
  audioFormat?: 'wav' | 'mp3' | 'ogg' | 'flac';
  exportFormat?: string; // More flexible format for plugins that handle non-audio exports
  sampleRate?: number;
  bitDepth?: 16 | 24 | 32;
  bitRate?: number;
  
  // Metadata
  metadata?: {
    title?: string;
    artist?: string;
    album?: string;
    genre?: string;
    [key: string]: any;
  };
  
  // Quality settings
  quality?: 'low' | 'medium' | 'high' | 'lossless';
  normalize?: boolean;
  
  // Additional options
  [key: string]: any;
}

/**
 * Plugin export result
 */
export interface PluginExportResult {
  success: boolean;
  filePath?: string;
  url?: string;
  hash?: string;
  ipfsHash?: string;
  storyProtocolId?: string;
  format?: string;
  urls?: Record<string, string>;
  metadata?: Record<string, any>;
  error?: string;
  warnings?: string[];
}

/**
 * Plugin configuration interface
 */
export interface PluginConfiguration {
  [key: string]: any;
}

/**
 * Main audio export plugin interface
 */
export interface AudioExportPlugin {
  metadata: PluginMetadata;
  
  /**
   * Initialize the plugin with configuration and context
   */
  initialize(config: PluginConfiguration, context: PluginContext): Promise<void>;
  
  /**
   * Export a single audio clip
   */
  exportClip(clip: Clip, options: ExportPluginOptions): Promise<PluginExportResult>;
  
  /**
   * Export multiple audio clips
   */
  exportMultipleClips(clips: Clip[], options: ExportPluginOptions): Promise<PluginExportResult>;
  
  /**
   * Check if plugin can handle the given export options
   */
  canHandle(options: ExportPluginOptions): boolean;
  
  /**
   * Validate plugin configuration
   */
  validateConfiguration?(config: PluginConfiguration): Promise<boolean>;
  
  /**
   * Clean up resources
   */
  dispose?(): Promise<void>;
}

/**
 * Plugin registry interface
 */
export interface PluginRegistry {
  register(plugin: AudioExportPlugin): void;
  unregister(pluginId: string): void;
  getPlugin(pluginId: string): AudioExportPlugin | undefined;
  getPluginsByCategory(category: string): AudioExportPlugin[];
  getPluginsForFormat(format: string): AudioExportPlugin[];
  getAllPlugins(): AudioExportPlugin[];
}

/**
 * Plugin manager interface
 */
export interface PluginManager {
  registry: PluginRegistry;
  
  loadPlugins(): Promise<void>;
  installPlugin(source: string): Promise<AudioExportPlugin>;
  uninstallPlugin(pluginId: string): Promise<void>;
  updatePlugin(pluginId: string): Promise<AudioExportPlugin>;
  
  export(clips: Clip | Clip[], options: ExportPluginOptions): Promise<PluginExportResult>;
  getExportRecommendations(options: ExportPluginOptions): AudioExportPlugin[];
  
  configurePlugin(pluginId: string, config: PluginConfiguration): Promise<void>;
  getPluginConfiguration(pluginId: string): PluginConfiguration | undefined;
  
  findPlugins(criteria: Partial<PluginMetadata>): AudioExportPlugin[];
  dispose(): Promise<void>;
}

/**
 * Plugin recommendation with score
 */
export interface PluginRecommendation {
  plugin: AudioExportPlugin;
  score: number;
  reasons: string[];
}

/**
 * Plugin installation source
 */
export interface PluginSource {
  type: 'npm' | 'url' | 'local';
  source: string;
  version?: string;
}

/**
 * Plugin event types
 */
export type PluginEvent = 
  | 'plugins-loaded'
  | 'plugins-load-error'
  | 'plugin-installed'
  | 'plugin-install-error'
  | 'plugin-uninstalled'
  | 'plugin-uninstall-error'
  | 'plugin-configured'
  | 'export-started'
  | 'export-completed'
  | 'export-error';

/**
 * Plugin capabilities interface
 */
export interface PluginCapabilities {
  formats: string[];
  storage: string[];
  blockchain: string[];
  features: string[];
}
