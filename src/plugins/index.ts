/**
 * Plugin System Integration for Orpheus Engine
 * Main entry point for the plugin architecture
 */

import { PluginRegistry } from './core/PluginRegistry';
import { PlatformDetector } from './core/PlatformDetector';
import { AudioAnalysisPlugin } from './examples/AudioAnalysisPlugin';

export class PluginSystem {
  private static instance: PluginSystem;
  private registry: PluginRegistry;
  private platformDetector: PlatformDetector;
  private initialized = false;

  private constructor() {
    this.registry = PluginRegistry.getInstance();
    this.platformDetector = PlatformDetector.getInstance();
  }

  public static getInstance(): PluginSystem {
    if (!PluginSystem.instance) {
      PluginSystem.instance = new PluginSystem();
    }
    return PluginSystem.instance;
  }

  /**
   * Initialize the plugin system
   */
  public async initialize(): Promise<void> {
    if (this.initialized) {
      console.warn('Plugin system already initialized');
      return;
    }

    console.log('Initializing Orpheus Engine Plugin System...');
    
    try {
      // Initialize the registry
      await this.registry.initialize();
      
      // Register built-in plugins
      await this.registerBuiltInPlugins();
      
      // Set up event listeners
      this.setupEventListeners();
      
      this.initialized = true;
      console.log('Plugin system initialized successfully');
      
      // Emit initialization event
      this.registry.emit('system:initialized');
      
    } catch (error) {
      console.error('Failed to initialize plugin system:', error);
      throw error;
    }
  }

  /**
   * Register built-in plugins
   */
  private async registerBuiltInPlugins(): Promise<void> {
    try {
      // Register Audio Analysis Plugin
      const audioAnalysisPlugin = new AudioAnalysisPlugin();
      await this.registry.registerPlugin(audioAnalysisPlugin);
      
      console.log('Built-in plugins registered successfully');
    } catch (error) {
      console.error('Failed to register built-in plugins:', error);
      throw error;
    }
  }

  /**
   * Set up global event listeners for plugin system
   */
  private setupEventListeners(): void {
    // Listen for audio events and forward to plugins
    this.registry.on('audio:loaded', (data) => {
      console.log('Audio loaded event received:', data);
    });

    this.registry.on('audio:playing', (data) => {
      console.log('Audio playing event received:', data);
    });

    // Listen for plugin events
    this.registry.on('plugin:registered', (data) => {
      console.log(`Plugin registered: ${data.manifest.name}`);
    });

    this.registry.on('plugin:activated', (data) => {
      console.log(`Plugin activated: ${data.id}`);
    });

    this.registry.on('plugin:deactivated', (data) => {
      console.log(`Plugin deactivated: ${data.id}`);
    });

    // Listen for analysis events
    this.registry.on('analysis:complete', (data) => {
      console.log('Analysis complete:', data.pluginId);
    });
  }

  /**
   * Get the plugin registry
   */
  public getRegistry(): PluginRegistry {
    return this.registry;
  }

  /**
   * Get platform detector
   */
  public getPlatformDetector(): PlatformDetector {
    return this.platformDetector;
  }

  /**
   * Activate a plugin by ID
   */
  public async activatePlugin(pluginId: string): Promise<void> {
    if (!this.initialized) {
      throw new Error('Plugin system not initialized');
    }
    
    await this.registry.activatePlugin(pluginId);
  }

  /**
   * Deactivate a plugin by ID
   */
  public async deactivatePlugin(pluginId: string): Promise<void> {
    if (!this.initialized) {
      throw new Error('Plugin system not initialized');
    }
    
    await this.registry.deactivatePlugin(pluginId);
  }

  /**
   * Get all available plugins
   */
  public getAvailablePlugins() {
    return this.registry.getAllPlugins();
  }

  /**
   * Get active plugins
   */
  public getActivePlugins() {
    return this.registry.getActivePlugins();
  }

  /**
   * Check if plugin system is initialized
   */
  public isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Shutdown the plugin system
   */
  public async shutdown(): Promise<void> {
    if (!this.initialized) {
      return;
    }

    console.log('Shutting down plugin system...');
    
    try {
      await this.registry.shutdown();
      this.initialized = false;
      
      console.log('Plugin system shutdown complete');
    } catch (error) {
      console.error('Error during plugin system shutdown:', error);
      throw error;
    }
  }

  /**
   * Create UI components for plugin management
   */
  public createPluginManagerUI(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'plugin-manager';
    container.innerHTML = `
      <div class="plugin-manager-header">
        <h2>Plugin Manager</h2>
        <div class="plugin-manager-controls">
          <button id="refresh-plugins">Refresh</button>
          <button id="load-plugin">Load Plugin</button>
        </div>
      </div>
      <div class="plugin-list">
        <div class="plugin-list-header">
          <div class="plugin-column">Name</div>
          <div class="plugin-column">Status</div>
          <div class="plugin-column">Actions</div>
        </div>
        <div id="plugin-items"></div>
      </div>
      <div class="plugin-details">
        <div id="plugin-details-content">
          <p>Select a plugin to view details</p>
        </div>
      </div>
    `;

    // Add event listeners
    const refreshBtn = container.querySelector('#refresh-plugins');
    const loadBtn = container.querySelector('#load-plugin');

    refreshBtn?.addEventListener('click', () => {
      this.updatePluginList(container);
    });

    loadBtn?.addEventListener('click', () => {
      this.showLoadPluginDialog();
    });

    // Initial update
    this.updatePluginList(container);

    return container;
  }

  /**
   * Update plugin list in UI
   */
  private updatePluginList(container: HTMLElement): void {
    const pluginItems = container.querySelector('#plugin-items');
    if (!pluginItems) return;

    const plugins = this.registry.getAllPlugins();
    
    pluginItems.innerHTML = plugins.map(plugin => `
      <div class="plugin-item" data-plugin-id="${plugin.manifest.id}">
        <div class="plugin-column">
          <div class="plugin-name">${plugin.manifest.name}</div>
          <div class="plugin-version">v${plugin.manifest.version}</div>
        </div>
        <div class="plugin-column">
          <span class="plugin-status plugin-status-${plugin.status}">${plugin.status}</span>
        </div>
        <div class="plugin-column">
          <div class="plugin-actions">
            ${plugin.status === 'active' 
              ? `<button onclick="pluginSystem.deactivatePlugin('${plugin.manifest.id}')">Deactivate</button>`
              : `<button onclick="pluginSystem.activatePlugin('${plugin.manifest.id}')">Activate</button>`
            }
            <button onclick="pluginSystem.showPluginDetails('${plugin.manifest.id}')">Details</button>
          </div>
        </div>
      </div>
    `).join('');
  }

  /**
   * Show plugin details
   */
  public showPluginDetails(pluginId: string): void {
    const plugin = this.registry.getPlugin(pluginId);
    if (!plugin) return;

    const detailsContainer = document.querySelector('#plugin-details-content');
    if (!detailsContainer) return;

    detailsContainer.innerHTML = `
      <h3>${plugin.manifest.name}</h3>
      <p><strong>ID:</strong> ${plugin.manifest.id}</p>
      <p><strong>Version:</strong> ${plugin.manifest.version}</p>
      <p><strong>Author:</strong> ${plugin.manifest.author}</p>
      <p><strong>Category:</strong> ${plugin.manifest.category}</p>
      <p><strong>Platform:</strong> ${plugin.manifest.platform}</p>
      <p><strong>Status:</strong> ${plugin.status}</p>
      <p><strong>Loaded:</strong> ${plugin.loadedAt.toLocaleString()}</p>
      <p><strong>Description:</strong></p>
      <p>${plugin.manifest.description}</p>
      
      <h4>Capabilities</h4>
      <ul>
        ${Object.entries(plugin.manifest.capabilities || {})
          .filter(([_, enabled]) => enabled)
          .map(([capability]) => `<li>${capability}</li>`)
          .join('')}
      </ul>
      
      ${plugin.error ? `
        <h4>Error</h4>
        <pre class="plugin-error">${plugin.error.message}</pre>
      ` : ''}
    `;
  }

  /**
   * Show load plugin dialog
   */
  private showLoadPluginDialog(): void {
    // This would open a file dialog or plugin marketplace
    console.log('Load plugin dialog - to be implemented');
    alert('Plugin loading from external sources will be implemented in future versions');
  }
}

// Global instance for browser console access
if (typeof window !== 'undefined') {
  (window as any).pluginSystem = PluginSystem.getInstance();
}

// Export singleton instance
export const pluginSystem = PluginSystem.getInstance();

// Export all plugin types and interfaces
export * from './core/IPlugin';
export * from './core/PlatformDetector';
export * from './core/PluginRegistry';
export * from './examples/AudioAnalysisPlugin';
