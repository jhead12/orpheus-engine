// Type definitions for Electron APIs exposed through preload script

interface ElectronAPI {
  // App info
  getAppVersion: () => Promise<string>;
  
  // Dialog methods
  showMessageBox: (options: Electron.MessageBoxOptions) => Promise<Electron.MessageBoxReturnValue>;
  showOpenDialog: (options: Electron.OpenDialogOptions) => Promise<Electron.OpenDialogReturnValue>;
  showSaveDialog: (options: Electron.SaveDialogOptions) => Promise<Electron.SaveDialogReturnValue>;
  
  // File operations
  readAudioFile: (filePath: string) => Promise<ArrayBuffer>;
  readAudioMetadata: (filePath: string) => Promise<AudioMetadata>;
  
  // Window controls
  onWindowMaximized: (callback: () => void) => void;
  onWindowUnmaximized: (callback: () => void) => void;
  
  // Menu events
  onMenuNewProject: (callback: () => void) => void;
  onMenuOpenProject: (callback: () => void) => void;
  onMenuStartRecording: (callback: () => void) => void;
  onMenuStopRecording: (callback: () => void) => void;
  
  // Audio analysis
  analyzeAudio: (filePath: string) => Promise<AudioAnalysisResult>;
  listAudioFiles: (directoryPath: string) => Promise<string[]>;
  
  // Remove listeners
  removeAllListeners: (channel: string) => void;
}

// Audio analysis types
interface AudioMetadata {
  duration: number;
  sampleRate: number;
  channels: number;
  format: string;
  bitrate?: number;
  codec?: string;
}

interface AudioAnalysisResult {
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
  timeSignature?: {
    numerator: number;
    denominator: number;
  };
}

interface OrpheusAPI {
  platform: string;
  isElectron: boolean;
  version: string;
  
  // Audio analysis configuration
  audioAnalysis: {
    enabled: boolean;
    dataDirectory: string;
    supportedFormats: string[];
    defaultVisualization: 'waveform' | 'spectrogram' | 'both';
  };
  
  // System capabilities
  capabilities: {
    audioProcessing: boolean;
    gpu: boolean;
    maxChannels: number;
    maxSampleRate: number;
  };
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
    orpheusAPI: OrpheusAPI;
  }
}

export {};