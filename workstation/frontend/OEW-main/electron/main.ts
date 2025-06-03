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
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      sandbox: false
    },
    title: 'Orpheus Engine Workstation',
    show: false
  });

  if (app.isPackaged) {
    console.log('📦 Loading packaged Orpheus Engine Workstation');
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  } else {
    const viteUrl = "http://localhost:5174";
    console.log(`🎵 Loading Orpheus Engine Workstation from: ${viteUrl}`);
    
    mainWindow.loadURL(viteUrl).then(() => {
      console.log('✅ Workstation loaded successfully');
    }).catch((error) => {
      console.error('❌ Failed to load workstation:', error);
    });
    
    mainWindow.webContents.openDevTools();
  }

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    console.log('🚀 Orpheus Engine Workstation is ready');
  });

  // Initialize menu and context menus
  const menuBuilder = new MenuBuilder(mainWindow);
  const contextMenuBuilder = new ContextMenuBuilder(mainWindow);

  menuBuilder.buildMenu();
  contextMenuBuilder.buildContextMenus();
  buildHandlers(mainWindow);
  
  // Setup audio analysis handlers
  setupAudioAnalysisHandlers();

  return mainWindow;
}

// Add these handlers for the preload script
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
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
});