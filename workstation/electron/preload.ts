import { contextBridge, ipcRenderer } from 'electron';

// Expose APIs to renderer process safely through contextBridge
contextBridge.exposeInMainWorld('electronAPI', {
  // Audio analysis
  analyzeAudio: (filePath: string) => ipcRenderer.invoke('audio:analyze', filePath),
  listAudioFiles: (directoryPath?: string) => ipcRenderer.invoke('audio:list-files', directoryPath),
  
  // System information
  getAppVersion: () => ipcRenderer.invoke('app:getVersion'),
  getPlatform: () => process.platform,
  
  // File system operations
  openFile: () => ipcRenderer.invoke('dialog:openFile'),
  openDirectory: () => ipcRenderer.invoke('dialog:openDirectory'),
  saveFile: (content: string) => ipcRenderer.invoke('dialog:saveFile', content),
  
  // App lifecycle
  quitApp: () => ipcRenderer.send('app:quit'),
  
  // IPC communication
  on: (channel: string, callback: (...args: any[]) => void) => {
    const validChannels = ['file-selected', 'process-completed', 'error-occurred'];
    if (validChannels.includes(channel)) {
      // Strip event as it includes `sender` and other internal electron properties
      ipcRenderer.on(channel, (_event, ...args) => callback(...args));
    }
  },
  
  send: (channel: string, data: any) => {
    const validChannels = ['start-process', 'cancel-process', 'request-data'];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  }
});

// Add orpheus-specific API
contextBridge.exposeInMainWorld('orpheusAPI', {
  isElectron: true,
  audioAnalysis: {
    enabled: true,
    supportedFormats: ['.mp3', '.wav', '.ogg', '.flac'],
    getDataDirectory: () => ipcRenderer.invoke('app:getUserDataPath', 'audioData'),
    defaultVisualization: 'waveform'
  },
  
  capabilities: {
    audioProcessing: true,
    gpu: false, // Default value - will be updated using system:detect-capabilities
    maxChannels: 32,
    maxSampleRate: 192000
  },
  
  // Add method to detect capabilities at runtime
  detectCapabilities: () => {
    return ipcRenderer.invoke('system:detect-capabilities');
  }
});

console.log('Preload script loaded successfully');