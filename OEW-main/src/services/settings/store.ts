import { createContext } from 'react';
import { 
  SettingsStore, 
  AudioSettings, 
  MIDISettings, 
  ThemeSettings,
  GeneralSettings,
  PluginSettings
} from './types';

/**
 * Default settings values
 */
export const defaultSettings: SettingsStore = {
  audio: {
    inputDevice: 'default',
    outputDevice: 'default',
    sampleRate: 48000,
    bufferSize: 512
  },
  midi: {
    inputDevices: [],
    outputDevices: [],
    enableMPE: false
  },
  theme: {
    colorScheme: 'dark',
    accentColor: '#1e88e5'
  },
  general: {
    autoSaveEnabled: true,
    autoSaveInterval: 5,
    createBackups: true,
    defaultProjectLocation: ''
  },
  plugins: {
    pluginFolders: [],
    scanOnStartup: true,
    preferredPluginFormats: ['VST3', 'AU', 'VST']
  }
};

/**
 * Load settings from storage
 */
export const loadSettings = (): SettingsStore => {
  try {
    const storedSettings = localStorage.getItem('orpheus-settings');
    if (storedSettings) {
      return JSON.parse(storedSettings);
    }
  } catch (error) {
    console.error('Failed to load settings:', error);
  }
  return defaultSettings;
};

/**
 * Save settings to storage
 */
export const saveSettings = (settings: SettingsStore): void => {
  try {
    localStorage.setItem('orpheus-settings', JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save settings:', error);
  }
};

/**
 * Settings context for React components
 */
export interface SettingsContextValue {
  settings: SettingsStore;
  updateSettings: <T extends keyof SettingsStore>(
    category: T,
    values: Partial<SettingsStore[T]>
  ) => void;
  resetSettings: () => void;
}

export const SettingsContext = createContext<SettingsContextValue | null>(null);
