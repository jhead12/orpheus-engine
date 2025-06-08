/**
 * Environment configuration for server-agnostic deployment
 */

interface ServerConfig {
  host: string;
  port: number;
  protocol: 'http' | 'https';
}

interface EnvironmentConfig {
  backend: ServerConfig;
  frontend: ServerConfig;
  vite: ServerConfig;
  api: {
    baseUrl: string;
    timeout: number;
  };
  development: boolean;
}

// Default configuration - can be overridden by environment variables
const defaultConfig: EnvironmentConfig = {
  backend: {
    host: process.env.BACKEND_HOST || 'localhost',
    port: parseInt(process.env.BACKEND_PORT || '5001'),
    protocol: (process.env.BACKEND_PROTOCOL as 'http' | 'https') || 'http',
  },
  frontend: {
    host: process.env.FRONTEND_HOST || 'localhost', 
    port: parseInt(process.env.FRONTEND_PORT || '3000'),
    protocol: (process.env.FRONTEND_PROTOCOL as 'http' | 'https') || 'http',
  },
  vite: {
    host: process.env.VITE_HOST || 'localhost',
    port: parseInt(process.env.VITE_PORT || '5174'),
    protocol: (process.env.VITE_PROTOCOL as 'http' | 'https') || 'http',
  },
  api: {
    baseUrl: process.env.API_BASE_URL || '',
    timeout: parseInt(process.env.API_TIMEOUT || '5000'),
  },
  development: process.env.NODE_ENV !== 'production',
};

// Helper functions to generate URLs
export const getServerUrl = (config: ServerConfig): string => {
  return `${config.protocol}://${config.host}:${config.port}`;
};

export const getBackendUrl = (): string => {
  return getServerUrl(defaultConfig.backend);
};

export const getFrontendUrl = (): string => {
  return getServerUrl(defaultConfig.frontend);
};

export const getViteUrl = (): string => {
  return getServerUrl(defaultConfig.vite);
};

export const getApiBaseUrl = (): string => {
  return defaultConfig.api.baseUrl || getBackendUrl();
};

// Health check endpoints
export const getHealthCheckUrl = (service: 'backend' | 'frontend' | 'vite'): string => {
  const baseUrl = service === 'backend' 
    ? getBackendUrl() 
    : service === 'frontend' 
    ? getFrontendUrl() 
    : getViteUrl();
  
  return service === 'backend' ? `${baseUrl}/health` : baseUrl;
};

export default defaultConfig;
