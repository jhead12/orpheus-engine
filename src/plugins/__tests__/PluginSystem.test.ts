/**
 * Plugin System Tests for Orpheus Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PluginRegistry } from '../plugins/core/PluginRegistry';
import { PlatformDetector } from '../plugins/core/PlatformDetector';
import { AudioAnalysisPlugin } from '../plugins/examples/AudioAnalysisPlugin';
import { pluginSystem } from '../plugins';

describe('Plugin System', () => {
  let registry: PluginRegistry;
  let platformDetector: PlatformDetector;

  beforeEach(() => {
    registry = PluginRegistry.getInstance();
    platformDetector = PlatformDetector.getInstance();
  });

  afterEach(async () => {
    // Clean up plugins after each test
    const allPlugins = registry.getAllPlugins();
    for (const plugin of allPlugins) {
      try {
        await registry.unregisterPlugin(plugin.manifest.id);
      } catch (error) {
        // Ignore cleanup errors
      }
    }
  });

  describe('PlatformDetector', () => {
    it('should detect platform correctly', () => {
      expect(platformDetector.platform).toMatch(/^(electron|browser)$/);
    });

    it('should provide platform capabilities', () => {
      const capabilities = platformDetector.capabilities;
      expect(capabilities).toHaveProperty('fileSystem');
      expect(capabilities).toHaveProperty('audioDevices');
      expect(capabilities).toHaveProperty('pythonBackend');
      expect(capabilities).toHaveProperty('clipboard');
      expect(capabilities).toHaveProperty('notifications');
    });

    it('should validate plugin compatibility', () => {
      const compatibleManifest = {
        platform: 'universal',
        capabilities: {
          audio: true,
        },
      };

      const incompatibleManifest = {
        platform: 'electron',
        capabilities: {
          fileSystem: true,
        },
      };

      expect(platformDetector.validatePluginCompatibility(compatibleManifest)).toBe(true);
      
      // This test depends on the actual platform, so we'll check both cases
      const isCompatible = platformDetector.validatePluginCompatibility(incompatibleManifest);
      if (platformDetector.platform === 'electron') {
        expect(isCompatible).toBe(true);
      } else {
        expect(isCompatible).toBe(false);
      }
    });
  });

  describe('PluginRegistry', () => {
    it('should initialize successfully', async () => {
      await registry.initialize();
      expect(registry).toBeDefined();
    });

    it('should register a plugin', async () => {
      const plugin = new AudioAnalysisPlugin();
      await registry.registerPlugin(plugin);
      
      expect(registry.isPluginRegistered(plugin.manifest.id)).toBe(true);
      const registeredPlugin = registry.getPlugin(plugin.manifest.id);
      expect(registeredPlugin).toBeDefined();
      expect(registeredPlugin?.status).toBe('loaded');
    });

    it('should activate a plugin', async () => {
      const plugin = new AudioAnalysisPlugin();
      await registry.registerPlugin(plugin);
      await registry.activatePlugin(plugin.manifest.id);
      
      expect(registry.isPluginActive(plugin.manifest.id)).toBe(true);
      const registeredPlugin = registry.getPlugin(plugin.manifest.id);
      expect(registeredPlugin?.status).toBe('active');
    });

    it('should deactivate a plugin', async () => {
      const plugin = new AudioAnalysisPlugin();
      await registry.registerPlugin(plugin);
      await registry.activatePlugin(plugin.manifest.id);
      await registry.deactivatePlugin(plugin.manifest.id);
      
      expect(registry.isPluginActive(plugin.manifest.id)).toBe(false);
      const registeredPlugin = registry.getPlugin(plugin.manifest.id);
      expect(registeredPlugin?.status).toBe('inactive');
    });

    it('should unregister a plugin', async () => {
      const plugin = new AudioAnalysisPlugin();
      await registry.registerPlugin(plugin);
      await registry.unregisterPlugin(plugin.manifest.id);
      
      expect(registry.isPluginRegistered(plugin.manifest.id)).toBe(false);
      expect(registry.getPlugin(plugin.manifest.id)).toBeUndefined();
    });

    it('should prevent duplicate plugin registration', async () => {
      const plugin1 = new AudioAnalysisPlugin();
      const plugin2 = new AudioAnalysisPlugin();
      
      await registry.registerPlugin(plugin1);
      
      await expect(registry.registerPlugin(plugin2)).rejects.toThrow(
        /already registered/
      );
    });

    it('should get plugins by category', async () => {
      const plugin = new AudioAnalysisPlugin();
      await registry.registerPlugin(plugin);
      
      const analysisPlugins = registry.getPluginsByCategory('analysis');
      expect(analysisPlugins).toHaveLength(1);
      expect(analysisPlugins[0].manifest.id).toBe(plugin.manifest.id);
    });

    it('should get active plugins', async () => {
      const plugin = new AudioAnalysisPlugin();
      await registry.registerPlugin(plugin);
      
      expect(registry.getActivePlugins()).toHaveLength(0);
      
      await registry.activatePlugin(plugin.manifest.id);
      expect(registry.getActivePlugins()).toHaveLength(1);
    });
  });

  describe('AudioAnalysisPlugin', () => {
    it('should have correct manifest', () => {
      const plugin = new AudioAnalysisPlugin();
      
      expect(plugin.manifest.id).toBe('orpheus.audio.analysis');
      expect(plugin.manifest.category).toBe('analysis');
      expect(plugin.manifest.capabilities.audio).toBe(true);
      expect(plugin.manifest.capabilities.python).toBe(true);
    });

    it('should initialize and activate successfully', async () => {
      const plugin = new AudioAnalysisPlugin();
      await registry.registerPlugin(plugin);
      await registry.activatePlugin(plugin.manifest.id);
      
      expect(plugin.isHealthy()).toBe(true);
    });

    it('should process audio data', async () => {
      const plugin = new AudioAnalysisPlugin();
      await registry.registerPlugin(plugin);
      await registry.activatePlugin(plugin.manifest.id);
      
      const mockAudioData = [new Float32Array([0.1, 0.2, 0.3, 0.4, 0.5])];
      const result = await plugin.processAudio(mockAudioData);
      
      expect(result).toEqual(mockAudioData); // Should return original data (non-destructive)
    });

    it('should create UI component', () => {
      const plugin = new AudioAnalysisPlugin();
      const ui = plugin.createUI();
      
      expect(ui).toBeInstanceOf(HTMLElement);
      expect(ui.className).toBe('audio-analysis-plugin');
      expect(ui.querySelector('.plugin-header')).toBeTruthy();
      expect(ui.querySelector('.analysis-display')).toBeTruthy();
    });

    it('should handle configuration', () => {
      const plugin = new AudioAnalysisPlugin();
      const config = { threshold: 0.5, sensitivity: 0.8 };
      
      plugin.setConfiguration(config);
      expect(plugin.getConfiguration()).toEqual(expect.objectContaining(config));
    });
  });

  describe('PluginSystem Integration', () => {
    it('should initialize and register built-in plugins', async () => {
      await pluginSystem.initialize();
      
      expect(pluginSystem.isInitialized()).toBe(true);
      
      const availablePlugins = pluginSystem.getAvailablePlugins();
      expect(availablePlugins.length).toBeGreaterThan(0);
      
      // Check if audio analysis plugin is registered
      const audioAnalysisPlugin = availablePlugins.find(
        p => p.manifest.id === 'orpheus.audio.analysis'
      );
      expect(audioAnalysisPlugin).toBeDefined();
    });

    it('should create plugin manager UI', async () => {
      await pluginSystem.initialize();
      
      const ui = pluginSystem.createPluginManagerUI();
      expect(ui).toBeInstanceOf(HTMLElement);
      expect(ui.className).toBe('plugin-manager');
      expect(ui.querySelector('.plugin-manager-header')).toBeTruthy();
      expect(ui.querySelector('.plugin-list')).toBeTruthy();
    });

    it('should handle plugin activation/deactivation', async () => {
      await pluginSystem.initialize();
      
      const pluginId = 'orpheus.audio.analysis';
      
      // Plugin should be initially inactive
      expect(pluginSystem.getActivePlugins()).toHaveLength(0);
      
      // Activate plugin
      await pluginSystem.activatePlugin(pluginId);
      expect(pluginSystem.getActivePlugins()).toHaveLength(1);
      
      // Deactivate plugin
      await pluginSystem.deactivatePlugin(pluginId);
      expect(pluginSystem.getActivePlugins()).toHaveLength(0);
    });
  });
});

describe('Plugin System Events', () => {
  let registry: PluginRegistry;
  let eventsFired: string[] = [];

  beforeEach(() => {
    registry = PluginRegistry.getInstance();
    eventsFired = [];

    // Set up event listeners
    registry.on('plugin:registered', () => eventsFired.push('registered'));
    registry.on('plugin:activated', () => eventsFired.push('activated'));
    registry.on('plugin:deactivated', () => eventsFired.push('deactivated'));
    registry.on('plugin:unregistered', () => eventsFired.push('unregistered'));
  });

  afterEach(async () => {
    // Clean up
    const allPlugins = registry.getAllPlugins();
    for (const plugin of allPlugins) {
      try {
        await registry.unregisterPlugin(plugin.manifest.id);
      } catch (error) {
        // Ignore cleanup errors
      }
    }
  });

  it('should fire events during plugin lifecycle', async () => {
    const plugin = new AudioAnalysisPlugin();
    
    await registry.registerPlugin(plugin);
    expect(eventsFired).toContain('registered');
    
    await registry.activatePlugin(plugin.manifest.id);
    expect(eventsFired).toContain('activated');
    
    await registry.deactivatePlugin(plugin.manifest.id);
    expect(eventsFired).toContain('deactivated');
    
    await registry.unregisterPlugin(plugin.manifest.id);
    expect(eventsFired).toContain('unregistered');
  });
});
