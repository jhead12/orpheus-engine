"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StartupWindow = void 0;
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
class StartupWindow {
    constructor(serviceManager) {
        this.window = null;
        this.serviceManager = serviceManager;
        this.setupIPC();
    }
    create() {
        // Select icon based on platform
        let iconPath;
        switch (process.platform) {
            case 'win32':
                iconPath = path_1.default.join(__dirname, '../assets/icons/icon.ico');
                break;
            case 'darwin':
                iconPath = path_1.default.join(__dirname, '../assets/icons/icon.icns');
                break;
            default:
                iconPath = path_1.default.join(__dirname, '../assets/icons/icon.png');
        }
        this.window = new electron_1.BrowserWindow({
            width: 800,
            height: 600,
            resizable: false,
            frame: false,
            alwaysOnTop: true,
            center: true,
            show: false,
            title: 'Orpheus Engine - Startup',
            icon: iconPath,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
                preload: path_1.default.join(__dirname, 'startup-preload.js')
            }
        });
        // Load the startup HTML
        this.window.loadFile(path_1.default.join(__dirname, '../startup.html'));
        // Set up service manager event listeners
        this.serviceManager.on('startup-begin', () => {
            this.sendToRenderer('startup-begin');
        });
        this.serviceManager.on('service-status-change', (status) => {
            this.sendToRenderer('service-status-change', status);
        });
        this.serviceManager.on('startup-complete', () => {
            this.sendToRenderer('startup-complete');
            // Wait a moment then close startup window
            setTimeout(() => {
                this.close();
            }, 2000);
        });
        this.window.once('ready-to-show', () => {
            this.window?.show();
        });
        return this.window;
    }
    setupIPC() {
        electron_1.ipcMain.handle('get-service-statuses', () => {
            return this.serviceManager.getAllStatuses();
        });
        electron_1.ipcMain.handle('start-services', async () => {
            try {
                await this.serviceManager.startAllServices();
                return { success: true };
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                return { success: false, error: errorMessage };
            }
        });
    }
    sendToRenderer(channel, data) {
        if (this.window && !this.window.isDestroyed()) {
            this.window.webContents.send(channel, data);
        }
    }
    close() {
        if (this.window && !this.window.isDestroyed()) {
            this.window.close();
            this.window = null;
        }
    }
    isOpen() {
        return this.window !== null && !this.window.isDestroyed();
    }
}
exports.StartupWindow = StartupWindow;
