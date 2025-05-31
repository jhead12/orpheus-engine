import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      // Enable secure context isolation
      nodeIntegration: false,
      contextIsolation: true,
      // Use preload script to safely expose electron APIs
      preload: path.join(__dirname, 'preload.js')
    },
  });

  // In development, use the Vite dev server
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5174');
    mainWindow.webContents.openDevTools();
  } else {
    // In production, load the built files
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Set up IPC handlers
  setupIPCHandlers(mainWindow);
}

function setupIPCHandlers(mainWindow: BrowserWindow) {
  // Audio analysis handler
  ipcMain.handle('mcp:analyze', async (event, args) => {
    // Add your audio analysis code here
    // This would typically call into a native module or process
    return { result: 'analysis complete', data: {} };
  });
  
  // Dialog handlers
  ipcMain.handle('dialog:openFile', async () => {
    // File open dialog implementation
    return ['path/to/file'];
  });
  
  ipcMain.handle('dialog:saveFile', async (event, content, defaultPath) => {
    // File save dialog implementation
    return 'path/to/saved/file';
  });
  
  // Context menu handler
  ipcMain.handle('context-menu:open', async (event, { type, params }) => {
    // Context menu implementation
    mainWindow.webContents.send('context-menu-result', { selected: 'item', type });
    return true;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
