import { BrowserWindow, app } from 'electron';
import * as path from 'path';

export class WindowManager {
  private mainWindow: BrowserWindow | null = null;
  private workstationWindow: BrowserWindow | null = null;

  createWorkstationWindow() {
    this.workstationWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      title: 'Orpheus Engine DAW',
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
      }
    });

    this.workstationWindow.loadURL(
      process.env.NODE_ENV === 'development'
        ? 'http://localhost:3000/workstation'
        : `file://${path.join(__dirname, '../build/index.html')}/workstation`
    );

    this.workstationWindow.on('closed', () => {
      this.workstationWindow = null;
    });
  }
}
