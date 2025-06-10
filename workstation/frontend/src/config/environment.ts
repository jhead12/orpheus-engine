/**
 * Server-Agnostic Environment Configuration
 * 
 * This module provides a central configuration system that allows the application
 * to work with different backend services regardless of their location or protocol.
 * 
 * Features:
 * - Smart defaults with zero configuration required for local development
 * - Support for custom hosts, ports, and protocols
 * - Environment variable overrides (.env file)
 * - Centralized URL generation for consistent API access
 */

// Environment variable configuration with defaults
interface EnvironmentConfig {
  // Core application settings
  APP_NAME: string;
  NODE_ENV: 'development' | 'production' | 'test';
  
  // Server configurations with protocol, host, and port
  API_PROTOCOL: string;
  API_HOST: string;
  API_PORT: string | number;
  
  // Audio processing service configuration
  AUDIO_PROCESSING_PROTOCOL: string;
  AUDIO_PROCESSING_HOST: string;
  AUDIO_PROCESSING_PORT: string | number;
  
  // Audio engine parameters
  AUDIO_SAMPLE_RATE: number;
  AUDIO_BUFFER_SIZE: number;
  AUDIO_LATENCY_HINT: 'interactive' | 'playback' | 'balanced';

  // Monitoring and health checks
  MONITOR_PROTOCOL: string;
  MONITOR_HOST: string;
  MONITOR_PORT: string | number;
}

// Default configuration
export const defaultConfig: EnvironmentConfig = {
  APP_NAME: 'Orpheus Engine',
  NODE_ENV: (process.env.NODE_ENV as any) || 'development',
  
  // Main API defaults (default: http://localhost:5001)
  API_PROTOCOL: import.meta.env.VITE_API_PROTOCOL || 'http',
  API_HOST: import.meta.env.VITE_API_HOST || 'localhost',
  API_PORT: import.meta.env.VITE_API_PORT || 5001,
  
  // Audio processing service (default: http://localhost:7008)
  AUDIO_PROCESSING_PROTOCOL: import.meta.env.VITE_AUDIO_PROCESSING_PROTOCOL || 'http',
  AUDIO_PROCESSING_HOST: import.meta.env.VITE_AUDIO_PROCESSING_HOST || 'localhost',
  AUDIO_PROCESSING_PORT: import.meta.env.VITE_AUDIO_PROCESSING_PORT || 7008,
  
  // Audio engine settings
  AUDIO_SAMPLE_RATE: parseInt(import.meta.env.VITE_AUDIO_SAMPLE_RATE || '44100'),
  AUDIO_BUFFER_SIZE: parseInt(import.meta.env.VITE_AUDIO_BUFFER_SIZE || '4096'),
  AUDIO_LATENCY_HINT: (import.meta.env.VITE_AUDIO_LATENCY_HINT as any) || 'interactive',
  
  // Monitoring and health checks (default: http://localhost:8000)
  MONITOR_PROTOCOL: import.meta.env.VITE_MONITOR_PROTOCOL || 'http',
  MONITOR_HOST: import.meta.env.VITE_MONITOR_HOST || 'localhost',
  MONITOR_PORT: import.meta.env.VITE_MONITOR_PORT || 8000,
};

// URL generators for various services
export const urls = {
  /**
   * Get the base URL for the main API
   */
  apiBaseUrl: (): string => {
    const { API_PROTOCOL, API_HOST, API_PORT } = defaultConfig;
    return `${API_PROTOCOL}://${API_HOST}:${API_PORT}`;
  },

  /**
   * Get the URL for a specific API endpoint
   * @param path - The API endpoint path (without leading slash)
   */
  apiUrl: (path: string): string => {
    return `${urls.apiBaseUrl()}/${path}`;
  },

  /**
   * Get the base URL for audio processing service
   */
  audioProcessingBaseUrl: (): string => {
    const { AUDIO_PROCESSING_PROTOCOL, AUDIO_PROCESSING_HOST, AUDIO_PROCESSING_PORT } = defaultConfig;
    return `${AUDIO_PROCESSING_PROTOCOL}://${AUDIO_PROCESSING_HOST}:${AUDIO_PROCESSING_PORT}`;
  },

  /**
   * Get the URL for a specific audio processing endpoint
   * @param path - The endpoint path (without leading slash)
   */
  audioProcessingUrl: (path: string): string => {
    return `${urls.audioProcessingBaseUrl()}/${path}`;
  },

  /**
   * Get the monitoring/health check URL
   * @param service - Optional service name to check
   */
  monitorUrl: (service?: string): string => {
    const { MONITOR_PROTOCOL, MONITOR_HOST, MONITOR_PORT } = defaultConfig;
    const baseUrl = `${MONITOR_PROTOCOL}://${MONITOR_HOST}:${MONITOR_PORT}`;
    return service ? `${baseUrl}/health/${service}` : `${baseUrl}/health`;
  },

  /**
   * Check if the current environment is development
   */
  isDevelopment: (): boolean => {
    return defaultConfig.NODE_ENV === 'development';
  },

  /**
   * Check if the current environment is production
   */
  isProduction: (): boolean => {
    return defaultConfig.NODE_ENV === 'production';
  },
  
  /**
   * Check if the current environment is test
   */
  isTest: (): boolean => {
    return defaultConfig.NODE_ENV === 'test';
  },
};

// Export default configuration and URL utilities
export default {
  config: defaultConfig,
  urls
};
