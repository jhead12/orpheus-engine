// Platform detection and service routing
export type PlatformType = 'electron' | 'web' | 'python-backend';

export interface PlatformConfig {
  type: PlatformType;
  apiEndpoint?: string;
  electronAPI?: any;
  pythonBackendUrl?: string;
}

class PlatformManager {
  private config: PlatformConfig;

  constructor() {
    this.config = this.detectPlatform();
  }

  private detectPlatform(): PlatformConfig {
    // Check if running in Electron
    if (typeof window !== 'undefined' && (window as any).electronAPI) {
      return {
        type: 'electron',
        electronAPI: (window as any).electronAPI
      };
    }

    // Check for Python backend environment variable
    const pythonBackendUrl = import.meta.env.VITE_PYTHON_BACKEND_URL || 'http://localhost:5001';
    
    // Default to web with potential Python backend
    return {
      type: 'web',
      apiEndpoint: import.meta.env.VITE_API_ENDPOINT || 'http://localhost:5173',
      pythonBackendUrl
    };
  }

  public getPlatform(): PlatformType {
    return this.config.type;
  }

  public getConfig(): PlatformConfig {
    return this.config;
  }

  public isElectron(): boolean {
    return this.config.type === 'electron';
  }

  public isWeb(): boolean {
    return this.config.type === 'web';
  }

  public hasPythonBackend(): boolean {
    return !!this.config.pythonBackendUrl;
  }

  public getPythonBackendUrl(): string | undefined {
    return this.config.pythonBackendUrl;
  }
}

export const platformManager = new PlatformManager();
export default platformManager;
