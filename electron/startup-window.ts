
import { BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { ServiceManager, ServiceStatus } from './service-manager';

export class StartupWindow {
    private window: BrowserWindow | null = null;
    private serviceManager: ServiceManager;

    constructor(serviceManager: ServiceManager) {
        this.serviceManager = serviceManager;
        this.setupIPC();
    }

    create(): BrowserWindow {
        this.window = new BrowserWindow({
            width: 800,
            height: 600,
            resizable: false,
            frame: false,
            alwaysOnTop: true,
            center: true,
            show: false,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
                preload: path.join(__dirname, 'startup-preload.js')
            }
        });

        // Load the startup HTML
        this.window.loadFile(path.join(__dirname, '../startup.html'));

        // Set up service manager event listeners
        this.serviceManager.on('startup-begin', () => {
            this.sendToRenderer('startup-begin');
        });

        this.serviceManager.on('service-status-change', (status: ServiceStatus) => {
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

    private setupIPC() {
        ipcMain.handle('get-service-statuses', () => {
            return this.serviceManager.getAllStatuses();
        });

        ipcMain.handle('start-services', async () => {
            try {
                await this.serviceManager.startAllServices();
                return { success: true };
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                return { success: false, error: errorMessage };
            }
        });
    }

    private sendToRenderer(channel: string, data?: any) {
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

    isOpen(): boolean {
        return this.window !== null && !this.window.isDestroyed();
    }
}
