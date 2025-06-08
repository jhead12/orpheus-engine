// Platform detection and capability service for Orpheus Engine
// Handles Electron, Browser, and Python backend environments

export interface PlatformCapabilities {
  canAccessFiles: boolean;
  canAnalyzeAudio: boolean;
  canExportAudio: boolean;
  hasNativeMenus: boolean;
  supportsNotifications: boolean;
}

export interface PlatformDetails {
  platform: 'electron' | 'browser' | 'python';
  browserType?: 'chrome' | 'firefox' | 'safari' | 'edge' | 'unknown';
  mobile: boolean;
  tablet: boolean;
  desktop: boolean;
  os?: string;
}

export interface EnvironmentConfig {
  isDevelopment: boolean;
  isProduction: boolean;
  apiEndpoint: string;
  enableDebugLogging: boolean;
}

export class PlatformService {
  /**
   * Detect if running in Electron environment
   */
  static isElectron(): boolean {
    // Check for process.versions.electron
    if (typeof process !== 'undefined' && process.versions && process.versions.electron) {
      return true;
    }

    // Check for electronAPI global
    if (typeof globalThis !== 'undefined' && (globalThis as any).electronAPI) {
      return true;
    }

    // Check user agent for Electron
    if (typeof navigator !== 'undefined' && navigator.userAgent) {
      return navigator.userAgent.toLowerCase().includes('electron');
    }

    return false;
  }

  /**
   * Detect if running in browser environment
   */
  static isBrowser(): boolean {
    if (this.isElectron()) return false;
    
    return typeof window !== 'undefined' && 
           typeof navigator !== 'undefined' && 
           !this.isPython();
  }

  /**
   * Detect if running in Python backend environment
   */
  static isPython(): boolean {
    // Check for process.versions.python
    if (typeof process !== 'undefined' && process.versions && process.versions.python) {
      return true;
    }

    // Check for Python environment variable
    if (typeof process !== 'undefined' && 
        process.env && 
        process.env.PYTHON_BACKEND === 'true') {
      return true;
    }

    return false;
  }

  /**
   * Get the API endpoint for the current environment
   */
  static getApiEndpoint(): string {
    if (typeof process !== 'undefined' && process.env) {
      const customEndpoint = process.env.VITE_API_ENDPOINT;
      if (customEndpoint) {
        return customEndpoint;
      }

      if (process.env.NODE_ENV === 'production') {
        return '/api';
      }
    }

    return 'http://localhost:5001';
  }

  /**
   * Get browser type if running in browser
   */
  static getBrowserType(): 'chrome' | 'firefox' | 'safari' | 'edge' | 'unknown' {
    if (!this.isBrowser() || typeof navigator === 'undefined') {
      return 'unknown';
    }

    const userAgent = navigator.userAgent.toLowerCase();

    if (userAgent.includes('chrome') && !userAgent.includes('edge')) {
      return 'chrome';
    } else if (userAgent.includes('firefox')) {
      return 'firefox';
    } else if (userAgent.includes('safari') && !userAgent.includes('chrome')) {
      return 'safari';
    } else if (userAgent.includes('edge')) {
      return 'edge';
    }

    return 'unknown';
  }

  /**
   * Get platform capabilities based on current environment
   */
  static getCapabilities(): PlatformCapabilities {
    if (this.isElectron()) {
      return {
        canAccessFiles: true,
        canAnalyzeAudio: true,
        canExportAudio: true,
        hasNativeMenus: true,
        supportsNotifications: true,
      };
    }

    if (this.isBrowser()) {
      return {
        canAccessFiles: this.hasFileSystemAccess(),
        canAnalyzeAudio: this.hasWebAudioSupport(),
        canExportAudio: true, // Download API
        hasNativeMenus: false,
        supportsNotifications: this.hasNotificationSupport(),
      };
    }

    if (this.isPython()) {
      return {
        canAccessFiles: true,
        canAnalyzeAudio: true,
        canExportAudio: true,
        hasNativeMenus: false,
        supportsNotifications: false,
      };
    }

    // Default fallback
    return {
      canAccessFiles: false,
      canAnalyzeAudio: false,
      canExportAudio: false,
      hasNativeMenus: false,
      supportsNotifications: false,
    };
  }

  /**
   * Check if file system access is available
   */
  static hasFileSystemAccess(): boolean {
    if (this.isElectron()) {
      return typeof (globalThis as any).electronAPI !== 'undefined';
    }

    // Check for File System Access API
    if (typeof globalThis !== 'undefined' && 'showOpenFilePicker' in globalThis) {
      return true;
    }

    // Fallback to File API
    return typeof File !== 'undefined';
  }

  /**
   * Check if Web Audio API is supported
   */
  static hasWebAudioSupport(): boolean {
    return typeof AudioContext !== 'undefined' || 
           typeof (globalThis as any).webkitAudioContext !== 'undefined';
  }

  /**
   * Check if Notification API is supported
   */
  static hasNotificationSupport(): boolean {
    return typeof Notification !== 'undefined';
  }

  /**
   * Check if localStorage is supported and accessible
   */
  static hasLocalStorageSupport(): boolean {
    try {
      return typeof localStorage !== 'undefined' && localStorage !== null;
    } catch (e) {
      return false;
    }
  }

  /**
   * Detect if running on mobile device
   */
  static isMobile(): boolean {
    if (typeof navigator === 'undefined') return false;
    
    const userAgent = navigator.userAgent.toLowerCase();
    return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent) &&
           !/ipad/i.test(userAgent); // Exclude tablets
  }

  /**
   * Detect if running on tablet device
   */
  static isTablet(): boolean {
    if (typeof navigator === 'undefined') return false;
    
    const userAgent = navigator.userAgent.toLowerCase();
    return /ipad|android.*tablet|kindle|playbook|silk/i.test(userAgent);
  }

  /**
   * Detect if running on desktop device
   */
  static isDesktop(): boolean {
    return !this.isMobile() && !this.isTablet();
  }

  /**
   * Get detailed platform information
   */
  static getPlatformDetails(): PlatformDetails {
    const platform = this.isElectron() ? 'electron' : 
                    this.isPython() ? 'python' : 'browser';

    return {
      platform,
      browserType: this.isBrowser() ? this.getBrowserType() : undefined,
      mobile: this.isMobile(),
      tablet: this.isTablet(),
      desktop: this.isDesktop(),
      os: this.getOperatingSystem(),
    };
  }

  /**
   * Get operating system information
   */
  private static getOperatingSystem(): string | undefined {
    if (typeof navigator === 'undefined') return undefined;

    const userAgent = navigator.userAgent;
    
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac OS')) return 'macOS';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iOS')) return 'iOS';

    return 'Unknown';
  }

  /**
   * Get environment configuration
   */
  static getEnvironmentConfig(): EnvironmentConfig {
    const isDevelopment = typeof process !== 'undefined' && 
                         process.env && 
                         process.env.NODE_ENV === 'development';

    return {
      isDevelopment,
      isProduction: !isDevelopment,
      apiEndpoint: this.getApiEndpoint(),
      enableDebugLogging: isDevelopment,
    };
  }
}

export default PlatformService;
