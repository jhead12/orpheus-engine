import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import MenuBuilder from './menu';
import { setupAudioAnalysisHandlers } from './audioAnalysis';
import ContextMenuBuilder from './contextMenu';
import buildHandlers from './handlers';

app.commandLine.appendSwitch('disable-gpu');
app.commandLine.appendSwitch('disable-software-rasterizer');
app.commandLine.appendSwitch('disable-dev-shm-usage');

if (process.argv.includes('--headless')) {
  app.commandLine.appendSwitch('headless');
  app.commandLine.appendSwitch('disable-gpu');
  app.commandLine.appendSwitch('disable-software-rasterizer');
  process.env.ELECTRON_DISABLE_GPU = '1';
}

function createWindow () {
  const mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      devTools: !app.isPackaged,
      offscreen: process.argv.includes('--headless'),
    },
    fullscreen: true
  });

  if (app.isPackaged) {
    console.log('Loading packaged app from file');
    mainWindow.loadFile(path.join(__dirname, '../src/index.html'));
  } else {
    const viteUrl = "http://localhost:5174";
    console.log(`🎵 Loading Orpheus Engine DAW from: ${viteUrl}`);
    
    // Add error handling for loading the URL
    mainWindow.loadURL(viteUrl).then(() => {
      console.log('✅ DAW loaded successfully');
    }).catch((error) => {
      console.error('❌ Failed to load DAW:', error);
    });
    
    mainWindow.webContents.openDevTools();
    
    // Add listener for when the page finishes loading
    mainWindow.webContents.once('did-finish-load', () => {
      console.log('🚀 DAW interface is ready');
    });
    
    // Add listener for any loading errors
    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
      console.error(`❌ Page failed to load: ${errorCode} - ${errorDescription}`);
    });
  }

  const menuBuilder = new MenuBuilder(mainWindow);
  const contextMenuBuilder = new ContextMenuBuilder(mainWindow);

  menuBuilder.buildMenu();
  contextMenuBuilder.buildContextMenus();
  buildHandlers(mainWindow);
}

// Add these handlers for the preload script
ipcMain.handle('app:getVersion', () => {
  return app.getVersion();
});

ipcMain.handle('app:getUserDataPath', (_, subFolder) => {
  return path.join(app.getPath('userData'), subFolder);
});

app.whenReady().then(() => {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      sandbox: false,
    },
  });

  if (process.getuid && process.getuid() === 0) {
    app.commandLine.appendSwitch('no-sandbox');
  }

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0)
      createWindow()
  })
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
});