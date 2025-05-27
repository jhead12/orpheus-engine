import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import MenuBuilder from './menu';
import { setupAudioAnalysisHandlers } from './audioAnalysis';
import ContextMenuBuilder from './contextMenu';
import buildHandlers from './handlers';

function createWindow () {
  const mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      devTools: !app.isPackaged
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
  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0)
      createWindow()
  })
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
});