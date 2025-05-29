import { app, BrowserWindow } from 'electron';
import path from 'path';
import { ServiceManager } from './service-manager';
import { StartupWindow } from './startup-window';

class OrpheusEngine {
  private serviceManager: ServiceManager;
  private startupWindow: StartupWindow;
  private mainWindow: BrowserWindow | null = null;

  constructor() {
    this.serviceManager = new ServiceManager();
    this.startupWindow = new StartupWindow(this.serviceManager);
    this.registerServices();
  }

  private registerServices() {
    const rootPath = path.join(__dirname, '..');
    
    // Backend API Service
    this.serviceManager.registerService({
      name: 'backend',
      command: 'node',
      args: ['scripts/start-backend-smart.js'],
      cwd: rootPath,
      port: 5001,
      description: 'Python RAG Backend API',
      critical: true,
      healthCheck: async () => {
        try {
          const response = await fetch('http://localhost:5001/health');
          return response.ok;
        } catch {
          return false;
        }
      }
    });

    // Frontend Development Server (OEW-main)
    this.serviceManager.registerService({
      name: 'frontend',
      command: 'npm',
      args: ['run', 'dev'],
      cwd: path.join(rootPath, 'OEW-main'),
      env: { BACKEND_PORT: '5001' },
      port: 5173,
      description: 'Vite Frontend Development Server',
      critical: false,
      healthCheck: async () => {
        try {
          const response = await fetch('http://localhost:5173');
          return response.ok;
        } catch {
          return false;
        }
      }
    });

    // DAW/Workstation Service (same as frontend since OEW-main is the DAW)
    this.serviceManager.registerService({
      name: 'daw',
      command: 'npm',
      args: ['run', 'dev'],
      cwd: path.join(rootPath, 'OEW-main'),
      env: { DAW_PORT: '3000' },
      port: 3000,
      description: 'DAW/Electron Development Server',
      critical: true,
      healthCheck: async () => {
        try {
          const response = await fetch('http://localhost:3000');
          return response.ok;
        } catch {
          return false;
        }
      }
    });

    // Audio Processing Service (if available)
    this.serviceManager.registerService({
      name: 'audio',
      command: 'python',
      args: ['audio_service.py'],
      cwd: path.join(rootPath, 'workstation', 'backend'),
      port: 7008,
      description: 'Audio Processing Service',
      critical: false
    });
  }

  async start() {
    await app.whenReady();
    
    // Create and show startup window
    this.startupWindow.create();
    
    // Set up service manager event listeners
    this.serviceManager.on('startup-complete', () => {
      setTimeout(() => {
        this.createMainWindow();
      }, 2000);
    });

    // Handle app activation (macOS)
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        if (this.mainWindow === null) {
          this.startupWindow.create();
        }
      }
    });

    // Handle window close
    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        this.cleanup();
        app.quit();
      }
    });

    // Handle app quit
    app.on('before-quit', () => {
      this.cleanup();
    });
  }

  private createMainWindow() {
    if (this.mainWindow !== null) return;

    this.mainWindow = new BrowserWindow({
      width: 1400,
      height: 900,
      minWidth: 1000,
      minHeight: 700,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        nodeIntegration: true,
        contextIsolation: false,
      },
      titleBarStyle: 'hiddenInset',
      show: false
    });

    // Load the DAW interface
    this.mainWindow.loadURL('http://localhost:3000');

    this.mainWindow.once('ready-to-show', () => {
      this.mainWindow?.show();
      this.mainWindow?.focus();
    });

    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
    });

    // Open DevTools in development
    if (process.env.NODE_ENV === 'development') {
      this.mainWindow.webContents.openDevTools();
    }
  }

  private async cleanup() {
    try {
      await this.serviceManager.stopAllServices();
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }
}

// Create and start the application
const orpheusEngine = new OrpheusEngine();
orpheusEngine.start().catch(console.error);