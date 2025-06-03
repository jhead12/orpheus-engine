export interface ElectronAPI {
  // Audio analysis
  analyzeAudio: (filePath: string) => Promise<{
    filename: string;
    duration: number;
    sampleRate: number;
    channels: number;
    tempoBpm: number;
    loudnessLufs: number;
    peakDb: number;
    rmsDb: number;
    waveformImage?: string;
    spectrogramImage?: string;
    timeSignature: string;
  }>;
  listAudioFiles: (directoryPath?: string) => Promise<string[]>;
  
  // App utilities
  getVersion: () => Promise<string>;
  getUserDataPath: (subFolder: string) => Promise<string>;
  
  // IPC utilities
  ipcRenderer: {
    invoke: (channel: string, ...args: any[]) => Promise<any>;
    on: (channel: string, func: (...args: any[]) => void) => void;
    once: (channel: string, func: (...args: any[]) => void) => void;
    removeAllListeners: (channel: string) => void;
    send: (channel: string, ...args: any[]) => void;
  };
}

export interface OrpheusAPI {
  platform: string;
  isElectron: boolean;
  getVersion: () => Promise<string>;
  
  audioAnalysis: {
    enabled: boolean;
    getDataDirectory: () => Promise<string>;
    supportedFormats: string[];
    defaultVisualization: string;
  };
  
  capabilities: {
    audioProcessing: boolean;
    gpu: boolean;
    maxChannels: number;
    maxSampleRate: number;
  };
  
  ipcRenderer: ElectronAPI['ipcRenderer'];
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
    orpheusAPI: OrpheusAPI;
  }
}
