import { createContext, useContext } from 'react';

// Define setting categories
export interface AudioSettings {
  inputDevice: string;
  outputDevice: string;
  sampleRate: number;
  bufferSize: number;
  bitDepth: 16 | 24 | 32;
}

export interface UISettings {
  theme: 'light' | 'dark' | 'system';
  trackHeight: number;
  waveformResolution: number;
  showTooltips: boolean;
}

export interface ProjectSettings {
  autosaveInterval: number; // in minutes, 0 to disable
  backupCount: number;
  defaultProjectLocation: string;
}

export interface Settings {
  audio: AudioSettings;
  ui: UISettings;
  project: ProjectSettings;
  [key: string]: any;
}

// Define default settings
export const defaultSettings: Settings = {
  audio: {
    inputDevice: 'default',
    outputDevice: 'default',
    sampleRate: 44100,
    bufferSize: 1024,
    bitDepth: 24
  },
  ui: {
    theme: 'system',
    trackHeight: 100,
    waveformResolution: 128,
    showTooltips: true
  },
  project: {
    autosaveInterval: 5,
    backupCount: 5,
    defaultProjectLocation: ''
  }
};

// Create settings context
export interface SettingsContextType {
  settings: Settings;
  updateSettings: <T extends keyof Settings>(
    category: T,
    newSettings: Partial<Settings[T]>
  ) => void;
  resetSettings: (category?: keyof Settings) => void;
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
export const saveSettings = (settings: Settings) => {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  }
};

// Load settings from local storage
export const loadSettings = (): Settings => {
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
