import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import MenuBuilder from './menu';
import { setupAudioAnalysisHandlers } from './audioAnalysis';
import ContextMenuBuilder from './contextMenu';
import buildHandlers from './handlers';

// Disable GPU for better compatibility
app.commandLine.appendSwitch('disable-gpu');
app.commandLine.appendSwitch('disable-software-rasterizer');
app.commandLine.appendSwitch('disable-dev-shm-usage');

if (process.argv.includes('--headless')) {
  app.commandLine.appendSwitch('headless');
  process.env.ELECTRON_DISABLE_GPU = '1';
}

// Handle running as root (e.g., in CI environments)
if (process.getuid && process.getuid() === 0) {
  app.commandLine.appendSwitch('no-sandbox');
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      devTools: !app.isPackaged,
      offscreen: process.argv.includes('--headless'),
    },
    fullscreen: true
  });

  if (app.isPackaged) {
    console.log('Loading packaged app from file');
    mainWindow.loadFile(path.join(__dirname, '../workstation/frontend/OEW-main/dist/index.html'));
  } else {
    const viteUrl = "http://localhost:5174";
    console.log(`🎵 Loading Orpheus Engine DAW from: ${viteUrl}`);
    
    mainWindow.loadURL(viteUrl).then(() => {
      console.log('✅ DAW loaded successfully');
    }).catch((error) => {
      console.error('❌ Failed to load DAW:', error);
      
      try {
        const fallbackPath = path.join(__dirname, '../workstation/frontend/OEW-main/dist/index.html');
        console.log(`🔄 Attempting to load fallback from: ${fallbackPath}`);
        mainWindow.loadFile(fallbackPath);
      } catch (fallbackError) {
        console.error('❌ Failed to load fallback:', fallbackError);
      }
    });
    
    if (!process.argv.includes('--headless')) {
      mainWindow.webContents.openDevTools();
    }
    
    mainWindow.webContents.once('did-finish-load', () => {
      console.log('🚀 DAW interface is ready');
    });
    
    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
      console.error(`❌ Page failed to load: ${errorCode} - ${errorDescription}`);
    });
  }

  const menuBuilder = new MenuBuilder(mainWindow);
  const contextMenuBuilder = new ContextMenuBuilder(mainWindow);

  menuBuilder.buildMenu();
  contextMenuBuilder.buildContextMenus();
  buildHandlers(mainWindow);

  return mainWindow;
}

// Add IPC handlers for the preload script
ipcMain.handle('app:getVersion', () => {
  return app.getVersion();
});

ipcMain.handle('app:getUserDataPath', (_, subFolder) => {
  return path.join(app.getPath('userData'), subFolder);
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});