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
    mainWindow.loadFile(path.join(__dirname, '../src/index.html'));
  } else {
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools();
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