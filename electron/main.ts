import { app, BrowserWindow, ipcMain } from 'electron';
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
    this.setupIPCHandlers();
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

    // Frontend Development Server
    this.serviceManager.registerService({
      name: 'frontend',
      command: 'npm',
      args: ['run', 'dev'],
      cwd: path.join(rootPath, 'workstation/frontend'),
      env: { BACKEND_PORT: '5001' },
      port: 5174, // Updated from 5173 to 5174
      description: 'Vite Frontend Development Server',
      critical: false,
      healthCheck: async () => {
        try {
          const response = await fetch('http://localhost:5174');
          return response.ok;
        } catch {
          return false;
        }
      }
    });

    // DAW/Workstation Service
    this.serviceManager.registerService({
      name: 'daw',
      command: 'npm',
      args: ['run', 'dev'],
      cwd: path.join(rootPath, 'workstation/frontend'),
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

  private setupIPCHandlers() {
    // MCP Analysis handler - placeholder implementation
    ipcMain.handle('mcp:analyze', async (event, request) => {
      try {
        console.log('MCP Analysis requested:', request);
        
        // Placeholder implementation - return mock analysis results
        // In a real implementation, this would process the audio data
        // and return actual analysis results
        return {
          spectralData: [],
          waveform: [],
          features: {},
          statistics: {
            rmsEnergy: { mean: 0, stdDev: 0 },
            sampleRate: request.data.sampleRate || 44100
          }
        };
      } catch (error) {
        console.error('MCP Analysis error:', error);
        throw error;
      }
    });
  }

  async start() {
    // Set application name
    app.name = 'Orpheus Engine';
    await app.whenReady();
    
    // Create and show startup window
    const startupWin = this.startupWindow.create();
    
    // Check if --display-startup flag is passed
    const displayStartup = process.argv.includes('--display-startup');
    
    if (displayStartup) {
      // Start services automatically after startup window is shown
      startupWin.once('ready-to-show', async () => {
        await this.serviceManager.startAllServices();
      });
    }
    
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

    // Select icon based on platform
    let iconPath;
    switch (process.platform) {
      case 'win32':
        iconPath = path.join(__dirname, '../assets/icons/icon.ico');
        break;
      case 'darwin':
        iconPath = path.join(__dirname, '../assets/icons/icon.icns');
        break;
      default:
        iconPath = path.join(__dirname, '../assets/icons/icon.png');
    }

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
      title: 'Orpheus Engine',
      icon: iconPath,
      show: false
    });

    // Load the DAW interface
    if (process.env.NODE_ENV === 'development') {
      this.mainWindow.loadURL('http://localhost:3000');
      this.mainWindow.webContents.openDevTools();
    } else {
      // In production, load the built frontend
      const distPath = path.join(__dirname, '../workstation/frontend/dist/index.html');
      this.mainWindow.loadFile(distPath);
    }

    this.mainWindow.once('ready-to-show', () => {
      this.mainWindow?.show();
      this.mainWindow?.focus();
    });

    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
    });
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