import { contextBridge, ipcRenderer } from 'electron';

// Define audio analysis result type
interface AudioAnalysisResult {
  duration: number;
  sampleRate: number;
  channels: number;
  peaks: number[];
  waveform: number[][];
}

// Define valid channel types
type IncomingChannel = typeof validIncomingChannels[number];
type OutgoingChannel = typeof validOutgoingChannels[number];
type ChannelData = string | number | boolean | object | null;

// Define types for our APIs
interface ElectronAPI {
  analyzeAudio: (filePath: string) => Promise<AudioAnalysisResult>;
  listAudioFiles: (directoryPath: string) => Promise<string[]>;
  getAppVersion: () => Promise<string>;
  getPlatform: () => NodeJS.Platform;
  openFile: () => Promise<string>;
  openDirectory: () => Promise<string>;
  saveFile: (content: string) => Promise<void>;
  quitApp: () => void;
  on: (channel: IncomingChannel, callback: (...args: ChannelData[]) => void) => void;
  send: (channel: OutgoingChannel, data: ChannelData) => void;
}

interface OrpheusAPI {
  isElectron: boolean;
  audioAnalysis: {
    enabled: boolean;
    supportedFormats: string[];
    getDataDirectory: () => Promise<string>;
    defaultVisualization: string;
  };
  capabilities: {
    audioProcessing: boolean;
    gpu: boolean;
    maxChannels: number;
    maxSampleRate: number;
  };
  detectCapabilities: () => Promise<{
    gpu: boolean;
    maxChannels: number;
    maxSampleRate: number;
  }>;
}

// List of valid IPC channels for security
const validIncomingChannels = [
  'file-selected',
  'process-completed',
  'error-occurred',
] as const;

const validOutgoingChannels = [
  'start-process',
  'cancel-process',
  'request-data',
] as const;

// Expose APIs to renderer process safely through contextBridge
contextBridge.exposeInMainWorld('electronAPI', {
  // Audio analysis
  analyzeAudio: (filePath: string) => ipcRenderer.invoke('audio:analyze', filePath),
  listAudioFiles: (directoryPath: string) => ipcRenderer.invoke('audio:list-files', directoryPath),
  
  // System information
  getAppVersion: () => ipcRenderer.invoke('app:getVersion'),
  getPlatform: () => process.platform,
  
  // File system operations
  openFile: () => ipcRenderer.invoke('dialog:openFile'),
  openDirectory: () => ipcRenderer.invoke('dialog:openDirectory'),
  saveFile: (content: string) => ipcRenderer.invoke('dialog:saveFile', content),
  
  // App lifecycle
  quitApp: () => ipcRenderer.send('app:quit'),
  
  // IPC communication with security checks
  on: (channel: IncomingChannel, callback: (...args: ChannelData[]) => void) => {
    if (validIncomingChannels.includes(channel)) {
      // Strip event as it includes `sender` and other internal electron properties
      ipcRenderer.on(channel, (_event, ...args) => callback(...args));
    } else {
      console.warn(`Blocked attempt to listen on unauthorized channel: ${channel}`);
    }
  },
  
  send: (channel: OutgoingChannel, data: ChannelData) => {
    if (validOutgoingChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    } else {
      console.warn(`Blocked attempt to send on unauthorized channel: ${channel}`);
    }
  }
} as ElectronAPI);

// Add Orpheus-specific API with strong typing
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
  detectCapabilities: () => ipcRenderer.invoke('system:detect-capabilities')
} as OrpheusAPI);

// Add types to global Window interface
declare global {
  interface Window {
    electronAPI: ElectronAPI;
    orpheusAPI: OrpheusAPI;
  }
}

console.log('🔒 Preload script loaded with secure context isolation');
