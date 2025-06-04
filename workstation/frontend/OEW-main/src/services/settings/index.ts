import { createContext, useContext } from 'react';

// Define setting categories
export interface AudioSettings {
  inputDevice: string;
  outputDevice: string;
  sampleRate: number;
  bufferSize: number;
  bitDepth: 16 | 24 | 32;
  masterVolume: number;
  metronomeEnabled: boolean;
  countInEnabled: boolean;
}

export interface UISettings {
  theme: 'light' | 'dark' | 'system';
  trackHeight: number;
  waveformResolution: number;
  showTooltips: boolean;
  showMixer: boolean;
  showTimeline: boolean;
  verticalZoom: number;
  horizontalZoom: number;
}

export interface ProjectSettings {
  autosaveInterval: number; // in minutes, 0 to disable
  backupCount: number;
  defaultProjectLocation: string;
}

export interface MCPSettings {
  endpoint: string;
  port: number;
  secure: boolean;
  capabilities: string[];
  enabled: boolean;
  analysisResolution: number;
  analysisWindowSize: number;
  responseTime: 'fast' | 'balanced' | 'detailed';
  creativity: number; // 0-1 scale
  styleLearning: boolean;
  autoSuggest: boolean;
}

export interface AudioLibrarySettings {
  defaultSortBy: 'name' | 'date' | 'duration' | 'type';
  defaultSortOrder: 'asc' | 'desc';
  showWaveforms: boolean;
  cacheSize: number; // in MB
  autoAnalyze: boolean;
  defaultLocation: string;
  maxRecentItems: number;
  fileTypes: string[]; // supported file extensions
}

export interface PluginSettings {
  enabledPlugins: string[]; // list of enabled plugin IDs
  disabledPlugins: string[]; // list of disabled plugin IDs
  pluginConfigs: Record<string, any>; // plugin-specific configurations
  allowExternalPlugins: boolean;
  pluginSources: string[]; // URLs to fetch plugins from
  autoUpdate: boolean;
  developerMode: boolean; // enable additional developer features
}

export interface TimelineSettings {
  tempo: number;
  timeSignature: {
    beats: number;
    noteValue: number;
  };
  snap: boolean;
  snapUnit: 'beat' | 'bar' | 'tick';
  horizontalScale: number;
}

export interface SettingsStore {
  audio: AudioSettings;
  ui: UISettings;
  project: ProjectSettings;
  mcp: MCPSettings;
  audioLibrary: AudioLibrarySettings;
  plugins: PluginSettings;
  timeline: TimelineSettings;
  [key: string]: any;
}

// Define default settings
export const defaultSettings: SettingsStore = {
  audio: {
    inputDevice: 'default',
    outputDevice: 'default',
    sampleRate: 44100,
    bufferSize: 1024,
    bitDepth: 24,
    masterVolume: 1,
    metronomeEnabled: true,
    countInEnabled: true
  },
  ui: {
    theme: 'system',
    trackHeight: 100,
    waveformResolution: 128,
    showTooltips: true,
    showMixer: true,
    showTimeline: true,
    verticalZoom: 1,
    horizontalZoom: 1
  },
  project: {
    autosaveInterval: 5,
    backupCount: 5,
    defaultProjectLocation: ''
  },
  mcp: {
    endpoint: 'localhost',
    port: 8001,
    secure: false,
    capabilities: [
      'audioAnalysis',
      'midiGeneration',
      'mixingAssistant',
      'arrangementSuggestions'
    ],
    enabled: true,
    analysisResolution: 1024,
    analysisWindowSize: 2048,
    responseTime: 'balanced',
    creativity: 0.8,
    styleLearning: true,
    autoSuggest: false
  },
  audioLibrary: {
    defaultSortBy: 'name',
    defaultSortOrder: 'asc',
    showWaveforms: true,
    cacheSize: 512,
    autoAnalyze: true,
    defaultLocation: '',
    maxRecentItems: 10,
    fileTypes: ['wav', 'mp3', 'ogg', 'flac', 'aiff', 'm4a']
  },
  plugins: {
    enabledPlugins: ['local-file-export', 'ipfs-export', 'react-export'],
    disabledPlugins: [],
    pluginConfigs: {},
    allowExternalPlugins: false,
    pluginSources: ['https://orpheus-engine.io/plugins'],
    autoUpdate: true,
    developerMode: false
  },
  timeline: {
    tempo: 120,
    timeSignature: {
      beats: 4,
      noteValue: 4
    },
    snap: true,
    snapUnit: 'beat',
    horizontalScale: 1
  }
};

// Create settings context
export interface SettingsContextType {
  settings: SettingsStore;
  updateSettings: <T extends keyof SettingsStore>(
    category: T,
    newSettings: Partial<SettingsStore[T]>
  ) => void;
  resetSettings: (category?: keyof SettingsStore) => void;
  saveSettings: () => void;
  loadSettings: () => void;
}

export const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  updateSettings: () => {},
  resetSettings: () => {},
  saveSettings: () => {},
  loadSettings: () => {}
});

// Storage key for settings
const SETTINGS_STORAGE_KEY = 'orpheus-engine-settings';

// Save settings to local storage
export const saveSettings = (settings: SettingsStore) => {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  }
};

// Load settings from local storage
export const loadSettings = (): SettingsStore => {
  try {
    if (typeof localStorage !== 'undefined') {
      const storedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (storedSettings) {
        return { ...defaultSettings, ...JSON.parse(storedSettings) };
      }
    }
  } catch (error) {
    console.error('Failed to load settings:', error);
  }
  return defaultSettings;
};

// Custom hook to use settings
export const useSettings = () => useContext(SettingsContext);
