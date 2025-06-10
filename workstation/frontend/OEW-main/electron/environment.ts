/**
 * Environment configuration for Electron main process
 * Loads and provides access to environment variables with sensible defaults
 */
import path from 'path';
import fs from 'fs';
import { app } from 'electron';

// Load .env file if it exists
const dotenvPath = path.join(app.getAppPath(), '.env');
if (fs.existsSync(dotenvPath)) {
  require('dotenv').config({ path: dotenvPath });
  console.log('✅ Environment variables loaded from', dotenvPath);
} else {
  console.warn('⚠️ No .env file found at', dotenvPath);
}

// Environment configuration with defaults
interface ElectronEnvironmentConfig {
  // Core application settings
  APP_NAME: string;
  NODE_ENV: 'development' | 'production' | 'test';
  
  // Vite development server
  VITE_PROTOCOL: string;
  VITE_HOST: string;
  VITE_PORT: number;
  
  // Main window settings
  WINDOW_WIDTH: number;
  WINDOW_HEIGHT: number;
  OPEN_DEV_TOOLS: boolean;
  
  // Python bridge settings
  PYTHON_BRIDGE_ENABLED: boolean;
  PYTHON_BRIDGE_PATH: string;
}

// Default configuration for Electron main process
export const electronConfig: ElectronEnvironmentConfig = {
  APP_NAME: process.env.APP_NAME || 'Orpheus Engine',
  NODE_ENV: (process.env.NODE_ENV as any) || 'development',
  
  // Vite development server (default: http://localhost:5174)
  VITE_PROTOCOL: process.env.VITE_PROTOCOL || 'http',
  VITE_HOST: process.env.VITE_HOST || 'localhost',
  VITE_PORT: parseInt(process.env.VITE_PORT || '5174'),
  
  // Window settings
  WINDOW_WIDTH: parseInt(process.env.WINDOW_WIDTH || '1024'),
  WINDOW_HEIGHT: parseInt(process.env.WINDOW_HEIGHT || '768'),
  OPEN_DEV_TOOLS: process.env.NODE_ENV === 'development',
  
  // Python bridge settings
  PYTHON_BRIDGE_ENABLED: process.env.VITE_PYTHON_BRIDGE_ENABLED !== 'false',
  PYTHON_BRIDGE_PATH: process.env.PYTHON_BRIDGE_PATH || path.join(app.getAppPath(), 'python'),
};

// URL generators for various services
export const urls = {
  /**
   * Get the Vite development server URL
   */
  viteBaseUrl: (): string => {
    return `${electronConfig.VITE_PROTOCOL}://${electronConfig.VITE_HOST}:${electronConfig.VITE_PORT}`;
  },
  
  /**
   * Check if the current environment is development
   */
  isDevelopment: (): boolean => {
    return electronConfig.NODE_ENV === 'development';
  },
  
  /**
   * Check if the current environment is production
   */
  isProduction: (): boolean => {
    return electronConfig.NODE_ENV === 'production';
  },
}

export default { config: electronConfig, urls };
