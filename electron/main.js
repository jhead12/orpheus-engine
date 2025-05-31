"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const service_manager_1 = require("./service-manager");
const startup_window_1 = require("./startup-window");
class OrpheusEngine {
    constructor() {
        this.mainWindow = null;
        this.serviceManager = new service_manager_1.ServiceManager();
        this.startupWindow = new startup_window_1.StartupWindow(this.serviceManager);
        this.registerServices();
        this.setupIPCHandlers();
    }
    registerServices() {
        const rootPath = path_1.default.join(__dirname, '..');
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
                }
                catch {
                    return false;
                }
            }
        });
        // Frontend Development Server
        this.serviceManager.registerService({
            name: 'frontend',
            command: 'npm',
            args: ['run', 'dev'],
            cwd: path_1.default.join(rootPath, 'workstation/frontend'),
            env: { BACKEND_PORT: '5001' },
            port: 5173,
            description: 'Vite Frontend Development Server',
            critical: false,
            healthCheck: async () => {
                try {
                    const response = await fetch('http://localhost:5173');
                    return response.ok;
                }
                catch {
                    return false;
                }
            }
        });
        // DAW/Workstation Service
        this.serviceManager.registerService({
            name: 'daw',
            command: 'npm',
            args: ['run', 'dev'],
            cwd: path_1.default.join(rootPath, 'workstation/frontend'),
            env: { DAW_PORT: '3000' },
            port: 3000,
            description: 'DAW/Electron Development Server',
            critical: true,
            healthCheck: async () => {
                try {
                    const response = await fetch('http://localhost:3000');
                    return response.ok;
                }
                catch {
                    return false;
                }
            }
        });
        // Audio Processing Service (if available)
        this.serviceManager.registerService({
            name: 'audio',
            command: 'python',
            args: ['audio_service.py'],
            cwd: path_1.default.join(rootPath, 'workstation', 'backend'),
            port: 7008,
            description: 'Audio Processing Service',
            critical: false
        });
    }
    setupIPCHandlers() {
        // MCP Analysis handler - placeholder implementation
        electron_1.ipcMain.handle('mcp:analyze', async (event, request) => {
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
            }
            catch (error) {
                console.error('MCP Analysis error:', error);
                throw error;
            }
        });
    }
    async start() {
        // Set application name
        electron_1.app.name = 'Orpheus Engine';
        await electron_1.app.whenReady();
        // Create and show startup window
        this.startupWindow.create();
        // Set up service manager event listeners
        this.serviceManager.on('startup-complete', () => {
            setTimeout(() => {
                this.createMainWindow();
            }, 2000);
        });
        // Handle app activation (macOS)
        electron_1.app.on('activate', () => {
            if (electron_1.BrowserWindow.getAllWindows().length === 0) {
                if (this.mainWindow === null) {
                    this.startupWindow.create();
                }
            }
        });
        // Handle window close
        electron_1.app.on('window-all-closed', () => {
            if (process.platform !== 'darwin') {
                this.cleanup();
                electron_1.app.quit();
            }
        });
        // Handle app quit
        electron_1.app.on('before-quit', () => {
            this.cleanup();
        });
    }
    createMainWindow() {
        if (this.mainWindow !== null)
            return;
        this.mainWindow = new electron_1.BrowserWindow({
            width: 1400,
            height: 900,
            minWidth: 1000,
            minHeight: 700,
            webPreferences: {
                preload: path_1.default.join(__dirname, 'preload.js'),
                nodeIntegration: true,
                contextIsolation: false,
            },
            titleBarStyle: 'hiddenInset',
            title: 'Orpheus Engine',
            icon: path_1.default.join(__dirname, '../assets/icons/icon.png'),
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
    async cleanup() {
        try {
            await this.serviceManager.stopAllServices();
        }
        catch (error) {
            console.error('Error during cleanup:', error);
        }
    }
}
// Create and start the application
const orpheusEngine = new OrpheusEngine();
orpheusEngine.start().catch(console.error);
