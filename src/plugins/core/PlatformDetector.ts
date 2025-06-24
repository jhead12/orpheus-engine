/**
 * Platform Detection System for Orpheus Engine
 * Detects the current runtime environment and available capabilities
 */

export interface PlatformCapabilities {
  fileSystem: boolean;
  audioDevices: boolean;
  pythonBackend: boolean;
  clipboard: boolean;
  notifications: boolean;
  systemTray: boolean;
  nativeMenus: boolean;
}

export type Platform = 'electron' | 'browser';

export class PlatformDetector {
  private static instance: PlatformDetector;
  private _platform: Platform;
  private _capabilities: PlatformCapabilities;

  private constructor() {
    this._platform = this.detectPlatform();
    this._capabilities = this.detectCapabilities();
  }

  public static getInstance(): PlatformDetector {
    if (!PlatformDetector.instance) {
      PlatformDetector.instance = new PlatformDetector();
    }
    return PlatformDetector.instance;
  }

  public get platform(): Platform {
    return this._platform;
  }

  public get capabilities(): PlatformCapabilities {
    return { ...this._capabilities };
  }

  public isElectron(): boolean {
    return this._platform === 'electron';
  }

  public isBrowser(): boolean {
    return this._platform === 'browser';
  }

  public hasCapability(capability: keyof PlatformCapabilities): boolean {
    return this._capabilities[capability];
  }

  private detectPlatform(): Platform {
    // Check for Electron environment
    if (typeof window !== 'undefined') {
      // Check for Electron-specific APIs
      if ((window as any).electronAPI || (window as any).electron) {
        return 'electron';
      }

      // Check for Node.js integration (older Electron apps)
      if ((window as any).require && (window as any).process) {
        return 'electron';
      }

      // Check user agent for Electron
      if (navigator.userAgent.toLowerCase().includes('electron')) {
        return 'electron';
      }
    }

    // Check Node.js environment (SSR or pure Node)
    if (typeof process !== 'undefined' && process.versions?.electron) {
      return 'electron';
    }

    return 'browser';
  }

  private detectCapabilities(): PlatformCapabilities {
    const capabilities: PlatformCapabilities = {
      fileSystem: false,
      audioDevices: false,
      pythonBackend: false,
      clipboard: false,
      notifications: false,
      systemTray: false,
      nativeMenus: false,
    };

    if (this._platform === 'electron') {
      // Electron capabilities
      capabilities.fileSystem = true;
      capabilities.audioDevices = true;
      capabilities.pythonBackend = true;
      capabilities.clipboard = true;
      capabilities.notifications = true;
      capabilities.systemTray = true;
      capabilities.nativeMenus = true;
    } else {
      // Browser capabilities
      capabilities.audioDevices = this.checkWebAudioAPI();
      capabilities.pythonBackend = this.checkPythonBackendAvailability();
      capabilities.clipboard = this.checkClipboardAPI();
      capabilities.notifications = this.checkNotificationAPI();
      capabilities.fileSystem = this.checkFileSystemAPI();
    }

    return capabilities;
  }

  private checkWebAudioAPI(): boolean {
    return (
      typeof AudioContext !== 'undefined' ||
      typeof (window as any).webkitAudioContext !== 'undefined'
    );
  }

  private checkPythonBackendAvailability(): boolean {
    // Check if Python backend is reachable
    // This will be implemented with actual health check
    return true; // Assume available for now
  }

  private checkClipboardAPI(): boolean {
    return typeof navigator.clipboard !== 'undefined';
  }

  private checkNotificationAPI(): boolean {
    return typeof Notification !== 'undefined';
  }

  private checkFileSystemAPI(): boolean {
    return (
      typeof (window as any).showDirectoryPicker !== 'undefined' ||
      typeof (window as any).showOpenFilePicker !== 'undefined'
    );
  }

  /**
   * Get platform-specific configuration
   */
  public getPlatformConfig(): Record<string, any> {
    const config: Record<string, any> = {
      platform: this._platform,
      capabilities: this._capabilities,
    };

    if (this._platform === 'electron') {
      config.backend_url = 'http://localhost:5001';
      config.file_access = 'native';
    } else {
      config.backend_url =
        process.env.VITE_BACKEND_URL || 'http://localhost:5001';
      config.file_access = 'web_api';
    }

    return config;
  }

  /**
   * Validate plugin compatibility with current platform
   */
  public validatePluginCompatibility(manifest: {
    platform: string;
    capabilities: any;
  }): boolean {
    // Check platform compatibility
    if (
      manifest.platform !== 'universal' &&
      manifest.platform !== this._platform
    ) {
      return false;
    }

    // Check required capabilities
    if (manifest.capabilities) {
      for (const [capability, required] of Object.entries(
        manifest.capabilities
      )) {
        if (
          required &&
          !this._capabilities[capability as keyof PlatformCapabilities]
        ) {
          return false;
        }
      }
    }

    return true;
  }
}
