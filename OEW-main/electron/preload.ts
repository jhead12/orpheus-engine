import { contextBridge, ipcRenderer, app } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
    // Audio analysis
  analyzeAudio: (filePath: string) => ipcRenderer.invoke('audio:analyze', filePath),
  listAudioFiles: (directoryPath?: string) => ipcRenderer.invoke('audio:list-files', directoryPath),

  // Add OrpheusAPI configuration
contextBridge.exposeInMainWorld('orpheusAPI', {
  platform: process.platform,
  isElectron: true,
  version: app.getVersion(),
  
  audioAnalysis: {
    enabled: true,
    dataDirectory: app.getPath('userData') + '/audioData',
    supportedFormats: ['.mp3', '.wav', '.ogg', '.flac'],
    defaultVisualization: 'both'
  },
  
  capabilities: {
    audioProcessing: true,
    gpu: false, // GPU feature detection not available via process, set to false or implement another check
    maxChannels: 32, // default value, could be determined dynamically
    maxSampleRate: 192000 // default value, could be determined dynamically
  },
  //ipcRenderer 
  ipcRenderer: {
    invoke: async (channel: string, ...args: unknown[]) => {
      return ipcRenderer.invoke(channel, ...args);
    },
    on: (channel: string, func: (...args: unknown[]) => void) => {
      ipcRenderer.on(channel, (_event, ...args) => func(...args));
    },
    once: (channel: string, func: ((...args: unknown[]) => void)) => {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
    removeAllListeners: (channel: string) => {
      ipcRenderer.removeAllListeners(channel);
    },
    send: (channel: string, ...args: unknown[]) => {
      ipcRenderer.send(channel, ...args);
    }
  }
});
