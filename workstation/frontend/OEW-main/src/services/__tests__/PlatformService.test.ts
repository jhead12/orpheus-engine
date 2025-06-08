import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PlatformService } from '../PlatformService';

// Mock environment variables and global objects
const mockUserAgent = (userAgent: string) => {
  Object.defineProperty(window.navigator, 'userAgent', {
    writable: true,
    value: userAgent,
  });
};

const mockProcess = (versions: any) => {
  (global as any).process = {
    versions,
    env: {},
  };
};

const mockElectronAPI = (api: any) => {
  (global as any).electronAPI = api;
};

describe('PlatformService', () => {
  beforeEach(() => {
    // Reset global objects
    delete (global as any).process;
    delete (global as any).electronAPI;
    
    // Mock AudioContext for browser capability tests
    (global as any).AudioContext = vi.fn();
    Object.defineProperty(window, 'AudioContext', {
      writable: true,
      value: vi.fn()
    });
    
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Platform Detection', () => {
    describe('Electron Detection', () => {
      it('should detect Electron via process.versions.electron', () => {
        mockProcess({ electron: '13.0.0', node: '14.0.0' });
        
        expect(PlatformService.isElectron()).toBe(true);
        expect(PlatformService.isBrowser()).toBe(false);
        expect(PlatformService.isPython()).toBe(false);
      });

      it('should detect Electron via electronAPI', () => {
        mockElectronAPI({ version: '1.0.0' });
        
        expect(PlatformService.isElectron()).toBe(true);
      });

      it('should detect Electron via user agent', () => {
        mockUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Electron/13.0.1 Safari/537.36');
        
        expect(PlatformService.isElectron()).toBe(true);
      });
    });

    describe('Browser Detection', () => {
      it('should detect browser environment', () => {
        mockUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        
        expect(PlatformService.isBrowser()).toBe(true);
        expect(PlatformService.isElectron()).toBe(false);
        expect(PlatformService.isPython()).toBe(false);
      });

      it('should detect Safari browser', () => {
        mockUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15');
        
        expect(PlatformService.isBrowser()).toBe(true);
        expect(PlatformService.getBrowserType()).toBe('safari');
      });

      it('should detect Firefox browser', () => {
        mockUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0');
        
        expect(PlatformService.isBrowser()).toBe(true);
        expect(PlatformService.getBrowserType()).toBe('firefox');
      });

      it('should detect Chrome browser', () => {
        mockUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        
        expect(PlatformService.isBrowser()).toBe(true);
        expect(PlatformService.getBrowserType()).toBe('chrome');
      });
    });

    describe('Python Backend Detection', () => {
      it('should detect Python environment via process', () => {
        mockProcess({ python: '3.9.0' });
        
        expect(PlatformService.isPython()).toBe(true);
      });

      it('should detect Python via environment variable', () => {
        (global as any).process = {
          env: { PYTHON_BACKEND: 'true' }
        };
        
        expect(PlatformService.isPython()).toBe(true);
      });
    });
  });

  describe('API Endpoint Management', () => {
    it('should return default development endpoint', () => {
      expect(PlatformService.getApiEndpoint()).toBe('http://localhost:5001');
    });

    it('should use custom endpoint from environment', () => {
      (global as any).process = {
        env: { 
          VITE_API_ENDPOINT: 'http://custom-api:8080',
          NODE_ENV: 'development'
        }
      };
      
      expect(PlatformService.getApiEndpoint()).toBe('http://custom-api:8080');
    });

    it('should use production endpoint in production', () => {
      (global as any).process = {
        env: { 
          NODE_ENV: 'production',
          VITE_API_ENDPOINT: 'https://api.orpheus-engine.com'
        }
      };
      
      expect(PlatformService.getApiEndpoint()).toBe('https://api.orpheus-engine.com');
    });

    it('should fall back to relative path when no endpoint configured', () => {
      (global as any).process = {
        env: { NODE_ENV: 'production' }
      };
      
      expect(PlatformService.getApiEndpoint()).toBe('/api');
    });
  });

  describe('Platform Capabilities', () => {
    it('should return Electron capabilities', () => {
      mockProcess({ electron: '13.0.0' });
      mockElectronAPI({ 
        openFile: vi.fn(),
        saveFile: vi.fn(),
        analyzeAudio: vi.fn()
      });
      
      const capabilities = PlatformService.getCapabilities();
      
      expect(capabilities.canAccessFiles).toBe(true);
      expect(capabilities.canAnalyzeAudio).toBe(true);
      expect(capabilities.canExportAudio).toBe(true);
      expect(capabilities.hasNativeMenus).toBe(true);
      expect(capabilities.supportsNotifications).toBe(true);
    });

    it('should return browser capabilities', () => {
      mockUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/91.0.4472.124 Safari/537.36');
      
      // Mock Notification API for browser environment
      (global as any).Notification = {
        permission: 'default',
        requestPermission: vi.fn()
      };
      
      const capabilities = PlatformService.getCapabilities();
      
      expect(capabilities.canAccessFiles).toBe(true); // File API
      expect(capabilities.canAnalyzeAudio).toBe(true); // Web Audio API
      expect(capabilities.canExportAudio).toBe(true);  // Download API
      expect(capabilities.hasNativeMenus).toBe(false);
      expect(capabilities.supportsNotifications).toBe(true); // Notification API
    });

    it('should return Python backend capabilities', () => {
      mockProcess({ python: '3.9.0' });
      
      const capabilities = PlatformService.getCapabilities();
      
      expect(capabilities.canAccessFiles).toBe(true);
      expect(capabilities.canAnalyzeAudio).toBe(true);
      expect(capabilities.canExportAudio).toBe(true);
      expect(capabilities.hasNativeMenus).toBe(false);
      expect(capabilities.supportsNotifications).toBe(false);
    });
  });

  describe('File System Access', () => {
    it('should check if file system access is available in Electron', () => {
      mockProcess({ electron: '13.0.0' });
      mockElectronAPI({ openFile: vi.fn() });
      
      expect(PlatformService.hasFileSystemAccess()).toBe(true);
    });

    it('should check if file system access is available in browser', () => {
      mockUserAgent('Mozilla/5.0 Chrome/91.0.4472.124 Safari/537.36');
      
      // Mock File System Access API
      (global as any).showOpenFilePicker = vi.fn();
      
      expect(PlatformService.hasFileSystemAccess()).toBe(true);
    });

    it('should fallback to File API in unsupported browsers', () => {
      mockUserAgent('Mozilla/5.0 Safari/605.1.15');
      delete (global as any).showOpenFilePicker;
      
      expect(PlatformService.hasFileSystemAccess()).toBe(true); // Still true due to File API
    });
  });

  describe('Audio Context Support', () => {
    it('should detect Web Audio API support', () => {
      (global as any).AudioContext = vi.fn();
      
      expect(PlatformService.hasWebAudioSupport()).toBe(true);
    });

    it('should detect webkit Audio Context support', () => {
      delete (global as any).AudioContext;
      (global as any).webkitAudioContext = vi.fn();
      
      expect(PlatformService.hasWebAudioSupport()).toBe(true);
    });

    it('should return false when no Audio Context available', () => {
      delete (global as any).AudioContext;
      delete (global as any).webkitAudioContext;
      
      expect(PlatformService.hasWebAudioSupport()).toBe(false);
    });
  });

  describe('Notification Support', () => {
    it('should detect Notification API support', () => {
      (global as any).Notification = {
        permission: 'default',
        requestPermission: vi.fn()
      };
      
      expect(PlatformService.hasNotificationSupport()).toBe(true);
    });

    it('should return false when Notification API not available', () => {
      delete (global as any).Notification;
      
      expect(PlatformService.hasNotificationSupport()).toBe(false);
    });
  });

  describe('Storage Support', () => {
    it('should detect localStorage support', () => {
      const mockLocalStorage = {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
        length: 0,
        key: vi.fn()
      };
      
      Object.defineProperty(window, 'localStorage', {
        value: mockLocalStorage,
        writable: true
      });
      
      expect(PlatformService.hasLocalStorageSupport()).toBe(true);
    });

    it('should handle localStorage access errors', () => {
      Object.defineProperty(window, 'localStorage', {
        get() {
          throw new Error('Access denied');
        }
      });
      
      expect(PlatformService.hasLocalStorageSupport()).toBe(false);
    });
  });

  describe('Platform-Specific Features', () => {
    it('should identify mobile platforms', () => {
      mockUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15');
      
      expect(PlatformService.isMobile()).toBe(true);
      expect(PlatformService.getPlatformDetails().mobile).toBe(true);
    });

    it('should identify tablet platforms', () => {
      mockUserAgent('Mozilla/5.0 (iPad; CPU OS 14_6 like Mac OS X) AppleWebKit/605.1.15');
      
      expect(PlatformService.isTablet()).toBe(true);
      expect(PlatformService.getPlatformDetails().tablet).toBe(true);
    });

    it('should identify desktop platforms', () => {
      mockUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
      
      expect(PlatformService.isDesktop()).toBe(true);
      expect(PlatformService.isMobile()).toBe(false);
      expect(PlatformService.isTablet()).toBe(false);
    });
  });

  describe('Environment Configuration', () => {
    it('should return development configuration', () => {
      (global as any).process = {
        env: { NODE_ENV: 'development' }
      };
      
      const config = PlatformService.getEnvironmentConfig();
      
      expect(config.isDevelopment).toBe(true);
      expect(config.isProduction).toBe(false);
      expect(config.apiEndpoint).toBe('http://localhost:5001');
      expect(config.enableDebugLogging).toBe(true);
    });

    it('should return production configuration', () => {
      (global as any).process = {
        env: { 
          NODE_ENV: 'production',
          VITE_API_ENDPOINT: 'https://api.orpheus.com'
        }
      };
      
      const config = PlatformService.getEnvironmentConfig();
      
      expect(config.isDevelopment).toBe(false);
      expect(config.isProduction).toBe(true);
      expect(config.apiEndpoint).toBe('https://api.orpheus.com');
      expect(config.enableDebugLogging).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should handle undefined navigator gracefully', () => {
      const originalNavigator = global.navigator;
      delete (global as any).navigator;
      
      expect(() => PlatformService.isBrowser()).not.toThrow();
      expect(PlatformService.isBrowser()).toBe(false);
      
      global.navigator = originalNavigator;
    });

    it('should handle undefined process gracefully', () => {
      delete (global as any).process;
      
      expect(() => PlatformService.isElectron()).not.toThrow();
      expect(PlatformService.isElectron()).toBe(false);
    });

    it('should handle missing environment variables', () => {
      (global as any).process = { env: {} };
      
      expect(() => PlatformService.getApiEndpoint()).not.toThrow();
      expect(PlatformService.getApiEndpoint()).toBe('http://localhost:5001');
    });
  });
});
