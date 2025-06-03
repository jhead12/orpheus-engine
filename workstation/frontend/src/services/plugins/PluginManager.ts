/**
 * Core Plugin Manager for Orpheus Engine Audio Export System
 */

import { 
  AudioExportPlugin, 
  PluginManager, 
  PluginRegistry, 
  PluginConfiguration,
  PluginContext,
  ExportPluginOptions,
  PluginExportResult,
  PluginMetadata
} from './types';
import { Clip } from '../types/types';
import { EventEmitter } from 'events';

// Extend Window interface for Web3 properties
declare global {
  interface Window {
    ethereum?: any;
    ipfs?: any;
    webkitAudioContext?: typeof AudioContext;
  }
}

export class PluginRegistryImpl implements PluginRegistry {
  private plugins: Map<string, AudioExportPlugin> = new Map();

  register(plugin: AudioExportPlugin): void {
    this.plugins.set(plugin.metadata.id, plugin);
    console.log(`Plugin registered: ${plugin.metadata.name} (${plugin.metadata.id})`);
  }

  unregister(pluginId: string): void {
    const plugin = this.plugins.get(pluginId);
    if (plugin) {
      plugin.dispose?.();
      this.plugins.delete(pluginId);
      console.log(`Plugin unregistered: ${pluginId}`);
    }
  }

  getPlugin(pluginId: string): AudioExportPlugin | undefined {
    return this.plugins.get(pluginId);
  }

  getPluginsByCategory(category: string): AudioExportPlugin[] {
    return Array.from(this.plugins.values()).filter(
      plugin => plugin.metadata.category === category
    );
  }

  getPluginsForFormat(format: string): AudioExportPlugin[] {
    return Array.from(this.plugins.values()).filter(
      plugin => plugin.metadata.supportedFormats.includes(format)
    );
  }

  getAllPlugins(): AudioExportPlugin[] {
    return Array.from(this.plugins.values());
  }
}

export class AudioExportPluginManager extends EventEmitter implements PluginManager {
  public registry: PluginRegistry;
  private context: PluginContext;
  private configurations: Map<string, PluginConfiguration> = new Map();

  constructor() {
    super();
    this.registry = new PluginRegistryImpl();
    this.context = this.createContext();
  }

  private createContext(): PluginContext {
    return {
      audioContext: new (window.AudioContext || window.webkitAudioContext)(),
      sessionId: this.generateSessionId(),
      environment: process.env.NODE_ENV as 'development' | 'production' | 'test' || 'development',
      capabilities: {
        blockchain: typeof window.ethereum !== 'undefined',
        ipfs: typeof window.ipfs !== 'undefined',
        webRTC: typeof RTCPeerConnection !== 'undefined',
        offlineStorage: typeof indexedDB !== 'undefined'
      }
    };
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async loadPlugins(): Promise<void> {
    try {
      // Load built-in plugins
      await this.loadBuiltInPlugins();
      
      // Load external plugins
      await this.loadExternalPlugins();
      
      this.emit('plugins-loaded', this.registry.getAllPlugins());
    } catch (error) {
      console.error('Failed to load plugins:', error);
      this.emit('plugins-load-error', error);
    }
  }

  private async loadBuiltInPlugins(): Promise<void> {
    // Import and register built-in plugins
    const { LocalFilePlugin } = await import('./built-in/LocalFilePlugin');
    const { IPFSPlugin } = await import('./built-in/IPFSPlugin');
    const { StoryProtocolPlugin } = await import('./built-in/StoryProtocolPlugin');
    const { CloudStoragePlugin } = await import('./built-in/CloudStoragePlugin');
    
    const builtInPlugins = [
      new LocalFilePlugin(),
      new IPFSPlugin(),
      new StoryProtocolPlugin(),
      new CloudStoragePlugin()
    ];

    for (const plugin of builtInPlugins) {
      try {
        await plugin.initialize({}, this.context);
        this.registry.register(plugin);
      } catch (error) {
        console.error(`Failed to initialize plugin ${plugin.metadata.id}:`, error);
      }
    }
  }

  private async loadExternalPlugins(): Promise<void> {
    // Load plugins from configuration or external sources
    // This could load from npm packages, URLs, or local files
    const externalPluginConfigs = this.getExternalPluginConfigs();
    
    for (const config of externalPluginConfigs) {
      try {
        const plugin = await this.loadExternalPlugin(config);
        await plugin.initialize(config.config || {}, this.context);
        this.registry.register(plugin);
      } catch (error) {
        console.error(`Failed to load external plugin ${config.id}:`, error);
      }
    }
  }

  private getExternalPluginConfigs(): any[] {
    // Return configuration for external plugins
    // This could come from localStorage, a config file, or API
    return [];
  }

  private async loadExternalPlugin(config: any): Promise<AudioExportPlugin> {
    // Load plugin from URL, npm package, or local file
    // This is a simplified implementation
    throw new Error('External plugin loading not implemented yet');
  }

  async installPlugin(source: string): Promise<AudioExportPlugin> {
    try {
      // Install plugin from source (URL, npm package, etc.)
      const plugin = await this.loadPluginFromSource(source);
      
      // Initialize plugin
      await plugin.initialize({}, this.context);
      
      // Register plugin
      this.registry.register(plugin);
      
      this.emit('plugin-installed', plugin);
      return plugin;
    } catch (error) {
      console.error(`Failed to install plugin from ${source}:`, error);
      this.emit('plugin-install-error', error);
      throw error;
    }
  }

  private async loadPluginFromSource(source: string): Promise<AudioExportPlugin> {
    // Implementation for loading plugins from various sources
    throw new Error('Plugin loading from source not implemented yet');
  }

  async uninstallPlugin(pluginId: string): Promise<void> {
    try {
      this.registry.unregister(pluginId);
      this.configurations.delete(pluginId);
      this.emit('plugin-uninstalled', pluginId);
    } catch (error) {
      console.error(`Failed to uninstall plugin ${pluginId}:`, error);
      this.emit('plugin-uninstall-error', error);
      throw error;
    }
  }

  async updatePlugin(pluginId: string): Promise<AudioExportPlugin> {
    // Implementation for updating plugins
    throw new Error('Plugin updating not implemented yet');
  }

  async export(
    clips: Clip | Clip[],
    options: ExportPluginOptions
  ): Promise<PluginExportResult> {
    const clipsArray = Array.isArray(clips) ? clips : [clips];
    
    // Find the best plugin for this export
    const plugin = this.selectBestPlugin(options);
    
    if (!plugin) {
      throw new Error('No suitable plugin found for export options');
    }

    try {
      this.emit('export-started', { plugin: plugin.metadata.id, options });
      
      let result: PluginExportResult;
      
      if (clipsArray.length === 1) {
        result = await plugin.exportClip(clipsArray[0], options);
      } else {
        result = await plugin.exportMultipleClips(clipsArray, options);
      }
      
      this.emit('export-completed', { plugin: plugin.metadata.id, result });
      return result;
    } catch (error) {
      this.emit('export-error', { plugin: plugin.metadata.id, error });
      throw error;
    }
  }

  private selectBestPlugin(options: ExportPluginOptions): AudioExportPlugin | undefined {
    const availablePlugins = this.registry.getAllPlugins();
    
    // Filter plugins that can handle the request
    const compatiblePlugins = availablePlugins.filter(plugin => 
      plugin.canHandle(options)
    );

    if (compatiblePlugins.length === 0) {
      return undefined;
    }

    // Score plugins based on options and return the best one
    const scoredPlugins = compatiblePlugins.map(plugin => ({
      plugin,
      score: this.scorePlugin(plugin, options)
    }));

    scoredPlugins.sort((a, b) => b.score - a.score);
    return scoredPlugins[0].plugin;
  }

  protected scorePlugin(plugin: AudioExportPlugin, options: ExportPluginOptions): number {
    let score = 0;

    // Base score for general plugin capability
    score += 5;

    // Category-specific scoring
    if (options.blockchain && plugin.metadata.category === 'blockchain') {
      score += 20;
    }

    if (options.storage?.provider === 'ipfs' && plugin.metadata.tags.includes('ipfs')) {
      score += 15;
    }

    if (plugin.metadata.category === 'dapp' && options.blockchain?.storyProtocol?.enabled) {
      score += 25;
    }

    // Storage provider specific scoring
    if (options.storage?.provider && plugin.metadata.category === 'storage') {
      score += 10;
    }

    return score;
  }

  getExportRecommendations(options: ExportPluginOptions): AudioExportPlugin[] {
    const availablePlugins = this.registry.getAllPlugins();
    
    const recommendations = availablePlugins
      .filter(plugin => plugin.canHandle(options))
      .map(plugin => ({
        plugin,
        score: this.scorePlugin(plugin, options)
      }))
      .sort((a, b) => b.score - a.score)
      .map(item => item.plugin);

    return recommendations.slice(0, 5); // Return top 5 recommendations
  }

  /**
   * Configure a specific plugin
   */
  async configurePlugin(pluginId: string, config: PluginConfiguration): Promise<void> {
    const plugin = this.registry.getPlugin(pluginId);
    if (!plugin) {
      throw new Error(`Plugin not found: ${pluginId}`);
    }

    if (plugin.validateConfiguration) {
      const isValid = await plugin.validateConfiguration(config);
      if (!isValid) {
        throw new Error(`Invalid configuration for plugin: ${pluginId}`);
      }
    }

    this.configurations.set(pluginId, config);
    this.emit('plugin-configured', { pluginId, config });
  }

  /**
   * Get plugin configuration
   */
  getPluginConfiguration(pluginId: string): PluginConfiguration | undefined {
    return this.configurations.get(pluginId);
  }

  /**
   * Get plugin by metadata criteria
   */
  findPlugins(criteria: Partial<PluginMetadata>): AudioExportPlugin[] {
    return this.registry.getAllPlugins().filter(plugin => {
      const metadata = plugin.metadata;
      
      return Object.entries(criteria).every(([key, value]) => {
        if (key === 'tags') {
          return Array.isArray(value) 
            ? value.some(tag => metadata.tags.includes(tag))
            : metadata.tags.includes(value);
        }
        
        return metadata[key as keyof PluginMetadata] === value;
      });
    });
  }

  /**
   * Clean up all plugins and resources
   */
  async dispose(): Promise<void> {
    const plugins = this.registry.getAllPlugins();
    
    for (const plugin of plugins) {
      try {
        await plugin.dispose?.();
      } catch (error) {
        console.error(`Error disposing plugin ${plugin.metadata.id}:`, error);
      }
    }

    this.configurations.clear();
    this.removeAllListeners();
  }
}

// Singleton instance
export const pluginManager = new AudioExportPluginManager();
