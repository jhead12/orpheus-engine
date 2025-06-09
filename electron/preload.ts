import { contextBridge, ipcRenderer } from 'electron';

// Expose the electronAPI for audio analysis functionality
contextBridge.exposeInMainWorld('electronAPI', {
  // Audio analysis
  analyzeAudio: (filePath: string) => ipcRenderer.invoke('audio:analyze', filePath),
  listAudioFiles: (directoryPath?: string) => ipcRenderer.invoke('audio:list-files', directoryPath),
});

// Add OrpheusAPI configuration as a separate exposed API
contextBridge.exposeInMainWorld('orpheusAPI', {
  platform: process.platform,
  isElectron: true,
  // Use IPC to get version instead of direct app access
  getVersion: () => ipcRenderer.invoke('app:getVersion'),
  
  audioAnalysis: {
    enabled: true,
    // Use IPC to get user data path
    getDataDirectory: () => ipcRenderer.invoke('app:getUserDataPath', 'audioData'),
    supportedFormats: ['.mp3', '.wav', '.ogg', '.flac'],
    defaultVisualization: 'both'
  },
  
  capabilities: {
    audioProcessing: true,
    gpu: false,
    maxChannels: 32,
    maxSampleRate: 192000
  },
  
  ipcRenderer: {
    invoke: async (channel: string, ...args: any[]) => {
      return ipcRenderer.invoke(channel, ...args);
    },
    on: (channel: string, func: (...args: any[]) => void) => {
      ipcRenderer.on(channel, (_event: any, ...args: any[]) => func(...args));
    },
    once: (channel: string, func: ((...args: any[]) => void)) => {
      ipcRenderer.once(channel, (_event: any, ...args: any[]) => func(...args));
    },
    removeAllListeners: (channel: string) => {
      ipcRenderer.removeAllListeners(channel);
    },
    send: (channel: string, ...args: any[]) => {
      ipcRenderer.send(channel, ...args);
    }
  }
});
