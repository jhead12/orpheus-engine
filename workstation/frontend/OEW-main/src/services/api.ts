import environment from '../config/environment';
import { ipcRenderer } from 'electron';

// Handle test environment
const getIpcRenderer = (): any => {
  if (typeof window !== 'undefined' && window.electron?.ipcRenderer) {
    return window.electron.ipcRenderer;
  }
  return ipcRenderer;
};

/**
 * Service for handling API calls to various services with environment-aware URLs
 */
export class ApiService {
  /**
   * Make a request to the main API
   * @param endpoint The API endpoint
   * @param options Fetch options
   */
  static async apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = environment.urls.apiUrl(endpoint);
    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    return response.json() as Promise<T>;
  }
  
  /**
   * Make a request to the audio processing service
   * @param endpoint The audio processing endpoint
   * @param options Fetch options
   */
  static async audioProcessingRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = environment.urls.audioProcessingUrl(endpoint);
    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(`Audio processing request failed: ${response.status} ${response.statusText}`);
    }
    
    return response.json() as Promise<T>;
  }
  
  /**
   * Make a health check request to the monitor service
   * @param service Optional service name to check
   */
  static async healthCheck(service?: string): Promise<{ status: string }> {
    const url = environment.urls.monitorUrl(service);
    const response = await fetch(url);
    
    return response.json() as Promise<{ status: string }>;
  }
  
  /**
   * Invoke a Python bridge function through the Electron IPC
   * @param command The command to invoke
   * @param params The parameters to pass
   */
  static async invokePython<T, P>(command: string, params: P): Promise<T> {
    if (!environment.config.PYTHON_BRIDGE_ENABLED) {
      throw new Error('Python bridge is disabled');
    }
    
    try {
      const renderer = getIpcRenderer();
      const result = await renderer.invoke(command, params);
      return result as T;
    } catch (error) {
      console.error(`Python bridge invocation failed (${command}):`, error);
      throw error;
    }
  }
}

export default ApiService;
