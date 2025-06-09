// Type definitions for preferences and settings

// Preference Types
export interface Preferences {
  theme: "light" | "dark" | "system";
  color:
    | "rose"
    | "violet"
    | "azure"
    | "aqua"
    | "olive"
    | "citrus"
    | "crimson"
    | "mono";
  audio: AudioPreferences;
  midi: MIDIPreferences;
  interface: InterfacePreferences;
  recording: RecordingPreferences;
  plugins: PluginPreferences;
}

export interface AudioPreferences {
  inputDevice: string;
  outputDevice: string;
  sampleRate: number;
  bufferSize: number;
  bitDepth: 16 | 24 | 32;
  monitorInput: boolean;
}

export interface MIDIPreferences {
  inputDevice: string;
  outputDevice: string;
  clockSync: boolean;
  midiThru: boolean;
}

export interface InterfacePreferences {
  timeDisplayFormat: "measures" | "time" | "frames";
  showMasterTrack: boolean;
  showAutomationLanes: boolean;
  snapToGrid: boolean;
  autoScroll: boolean;
}

export interface RecordingPreferences {
  countIn: boolean;
  countInBars: number;
  preRoll: boolean;
  preRollTime: number;
  autoArm: boolean;
}

export interface PluginPreferences {
  vstPath: string;
  auPath: string;
  scanOnStartup: boolean;
  enableBridging: boolean;
}

// Audio Analysis Types
export enum AudioAnalysisType {
  Waveform = "waveform",
  Spectrum = "spectrum",
  Spectrogram = "spectrogram",
  MFCC = "mfcc",
  ChromaFeatures = "chroma",
}

export interface AnalysisResults {
  spectral?: {
    spectralData: number[][];
    frequencies: number[];
    times: number[];
  };
  waveform?: {
    data: number[];
    duration: number;
    sampleRate: number;
  };
  features?: {
    mfcc?: number[][];
    spectralContrast?: number[];
    chromagram?: number[][];
  };
}

export interface AudioSettings {
  sampleRate: number;
  channelCount: number;
  bitDepth: number;
  bufferSize: number;
  deviceId: string;
}
