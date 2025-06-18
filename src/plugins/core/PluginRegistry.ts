/**
 * Plugin Registry System for Orpheus Engine
 * Manages plugin registration, loading, and lifecycle
 */

import { IPlugin, PluginManifest, PluginContext } from './IPlugin';
import { PlatformDetector } from './PlatformDetector';
import { pythonBackend } from '@orpheus/services/PythonBackendService';
import { audioService } from '@orpheus/services/AudioService';

export interface RegisteredPlugin {
  plugin: IPlugin;
  manifest: PluginManifest;
  status: 'loaded' | 'active' | 'inactive' | 'error';
  error?: Error;
  loadedAt: Date;
}

export class PluginRegistry {
  private static instance: PluginRegistry;
  private plugins = new Map<string, RegisteredPlugin>();
  private context: PluginContext;
  private platformDetector: PlatformDetector;
  private eventListeners = new Map<string, Set<(data: any) => void>>();

  private constructor() {
    this.platformDetector = PlatformDetector.getInstance();
    this.context = this.createPluginContext();
  }

  public static getInstance(): PluginRegistry {
    if (!PluginRegistry.instance) {
      PluginRegistry.instance = new PluginRegistry();
    }
    return PluginRegistry.instance;
  }

  /**
   * Register a plugin instance
   */
  public async registerPlugin(plugin: IPlugin): Promise<void> {
    const manifest = plugin.manifest;
    
    // Validate plugin compatibility
    if (!this.platformDetector.validatePluginCompatibility(manifest)) {
      throw new Error(`Plugin ${manifest.id} is not compatible with current platform`);
    }

    // Check for duplicate plugin IDs
    if (this.plugins.has(manifest.id)) {
      throw new Error(`Plugin with ID ${manifest.id} is already registered`);
    }

    try {
      // Initialize the plugin
      await plugin.initialize(this.context);
      
      const registeredPlugin: RegisteredPlugin = {
        plugin,
        manifest,
        status: 'loaded',
        loadedAt: new Date(),
      };

      this.plugins.set(manifest.id, registeredPlugin);
      this.emit('plugin:registered', { id: manifest.id, manifest });
      
      console.log(`Plugin registered: ${manifest.name} (${manifest.id})`);
    } catch (error) {
      const registeredPlugin: RegisteredPlugin = {
        plugin,
        manifest,
        status: 'error',
        error: error as Error,
        loadedAt: new Date(),
      };

      this.plugins.set(manifest.id, registeredPlugin);
      throw error;
    }
  }

  /**
   * Activate a registered plugin
   */
  public async activatePlugin(pluginId: string): Promise<void> {
    const registeredPlugin = this.plugins.get(pluginId);
    
    if (!registeredPlugin) {
      throw new Error(`Plugin ${pluginId} is not registered`);
    }

    if (registeredPlugin.status === 'active') {
      console.warn(`Plugin ${pluginId} is already active`);
      return;
    }

    try {
      await registeredPlugin.plugin.activate();
      registeredPlugin.status = 'active';
      this.emit('plugin:activated', { id: pluginId });
      
      console.log(`Plugin activated: ${registeredPlugin.manifest.name}`);
    } catch (error) {
      registeredPlugin.status = 'error';
      registeredPlugin.error = error as Error;
      throw error;
    }
  }

  /**
   * Deactivate an active plugin
   */
  public async deactivatePlugin(pluginId: string): Promise<void> {
    const registeredPlugin = this.plugins.get(pluginId);
    
    if (!registeredPlugin) {
      throw new Error(`Plugin ${pluginId} is not registered`);
    }

    if (registeredPlugin.status !== 'active') {
      console.warn(`Plugin ${pluginId} is not active`);
      return;
    }

    try {
      await registeredPlugin.plugin.deactivate();
      registeredPlugin.status = 'inactive';
      this.emit('plugin:deactivated', { id: pluginId });
      
      console.log(`Plugin deactivated: ${registeredPlugin.manifest.name}`);
    } catch (error) {
      registeredPlugin.status = 'error';
      registeredPlugin.error = error as Error;
      throw error;
    }
  }

  /**
   * Unregister and destroy a plugin
   */
  public async unregisterPlugin(pluginId: string): Promise<void> {
    const registeredPlugin = this.plugins.get(pluginId);
    
    if (!registeredPlugin) {
      throw new Error(`Plugin ${pluginId} is not registered`);
    }

    try {
      // Deactivate if active
      if (registeredPlugin.status === 'active') {
        await this.deactivatePlugin(pluginId);
      }

      // Destroy the plugin
      await registeredPlugin.plugin.destroy();
      
      // Remove from registry
      this.plugins.delete(pluginId);
      this.emit('plugin:unregistered', { id: pluginId });
      
      console.log(`Plugin unregistered: ${registeredPlugin.manifest.name}`);
    } catch (error) {
      console.error(`Error unregistering plugin ${pluginId}:`, error);
      throw error;
    }
  }

  /**
   * Get plugin by ID
   */
  public getPlugin(pluginId: string): RegisteredPlugin | undefined {
    return this.plugins.get(pluginId);
  }

  /**
   * Get all registered plugins
   */
  public getAllPlugins(): RegisteredPlugin[] {
    return Array.from(this.plugins.values());
  }

  /**
   * Get plugins by category
   */
  public getPluginsByCategory(category: string): RegisteredPlugin[] {
    return Array.from(this.plugins.values()).filter(
      p => p.manifest.category === category
    );
  }

  /**
   * Get active plugins
   */
  public getActivePlugins(): RegisteredPlugin[] {
    return Array.from(this.plugins.values()).filter(
      p => p.status === 'active'
    );
  }

  /**
   * Check if plugin is registered
   */
  public isPluginRegistered(pluginId: string): boolean {
    return this.plugins.has(pluginId);
  }

  /**
   * Check if plugin is active
   */
  public isPluginActive(pluginId: string): boolean {
    const plugin = this.plugins.get(pluginId);
    return plugin?.status === 'active' || false;
  }

  /**
   * Event system
   */
  public on(event: string, callback: (data: any) => void): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(callback);
  }

  public off(event: string, callback: (data: any) => void): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(callback);
    }
  }

  public emit(event: string, data?: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Create plugin context with all required services
   */
  private createPluginContext(): PluginContext {
    const platformDetector = this.platformDetector;
    
    return {
      // Core services
      audioService: audioService, // Inject Audio service
      pythonBackend: pythonBackend, // Inject Python backend service
      
      // Platform detection
      platform: platformDetector.platform,
      capabilities: platformDetector.capabilities,
      
      // Event system
      emit: (event: string, data?: any) => this.emit(event, data),
      on: (event: string, callback: (data: any) => void) => this.on(event, callback),
      off: (event: string, callback: (data: any) => void) => this.off(event, callback),
      
      // State management (simple in-memory store for now)
      getState: (key: string) => (this as any).state?.[key],
      setState: (key: string, value: any) => {
        if (!(this as any).state) (this as any).state = {};
        (this as any).state[key] = value;
      },
      
      // Logging
      log: {
        info: (message: string, data?: any) => console.log(`[Plugin] ${message}`, data),
        warn: (message: string, data?: any) => console.warn(`[Plugin] ${message}`, data),
        error: (message: string, data?: any) => console.error(`[Plugin] ${message}`, data),
        debug: (message: string, data?: any) => console.debug(`[Plugin] ${message}`, data),
      },
    };
  }

  /**
   * Initialize plugin system
   */
  public async initialize(): Promise<void> {
    console.log('Initializing Plugin Registry...');
    console.log(`Platform: ${this.platformDetector.platform}`);
    console.log('Capabilities:', this.platformDetector.capabilities);
    
    // Initialize Python backend if available
    try {
      await pythonBackend.initialize();
      console.log('Python backend connected successfully');
    } catch (error) {
      console.warn('Python backend not available:', error);
    }
    
    this.emit('registry:initialized');
  }

  /**
   * Shutdown plugin system
   */
  public async shutdown(): Promise<void> {
    console.log('Shutting down Plugin Registry...');
    
    // Deactivate all active plugins
    const activePlugins = this.getActivePlugins();
    for (const registeredPlugin of activePlugins) {
      try {
        await this.deactivatePlugin(registeredPlugin.manifest.id);
      } catch (error) {
        console.error(`Error deactivating plugin ${registeredPlugin.manifest.id}:`, error);
      }
    }
    
    // Unregister all plugins
    const allPlugins = Array.from(this.plugins.keys());
    for (const pluginId of allPlugins) {
      try {
        await this.unregisterPlugin(pluginId);
      } catch (error) {
        console.error(`Error unregistering plugin ${pluginId}:`, error);
      }
    }
    
    this.emit('registry:shutdown');
  }
}
