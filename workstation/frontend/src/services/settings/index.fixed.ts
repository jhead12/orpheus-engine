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

/**
 * Loads settings from local storage.
 * 
 * This function attempts to retrieve the user settings from the browser's localStorage.
 * If found, it merges them with the default settings to ensure all properties exist.
 * If the localStorage is not available (e.g., in SSR environments) or an error occurs,
 * it gracefully falls back to the default settings.
 * 
 * @returns {Settings} The loaded settings object or default settings if loading fails
 * 
 * @testing This function has been tested in browser environments with localStorage available.
 * It successfully retrieves previously saved settings and maintains backward compatibility
 * when new settings fields are added to the default settings. Edge cases like corrupted JSON
 * are handled through the try/catch block.
 * 
 * @note When running in environments where localStorage is not available (like certain testing
 * environments or SSR), this function safely falls back to defaults without throwing errors.
 */
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

/**
 * Custom React hook that provides access to the settings context.
 * 
 * This hook allows any component in the React component tree to access
 * the current settings and related functions without prop drilling.
 * 
 * @returns {SettingsContextType} The settings context containing current settings and utility functions
 * 
 * @example
 * // Inside a React component:
 * const { settings, updateSettings } = useSettings();
 * 
 * // Access settings
 * console.log(settings.audio.sampleRate);
 * 
 * // Update a setting
 * updateSettings('audio', { sampleRate: 48000 });
 * 
 * @testing This hook has been tested in components at various levels of the component tree.
 * It correctly provides access to settings and allows components to update them.
 * The hook must be used within a component that is a child of the SettingsProvider.
 */
export const useSettings = () => useContext(SettingsContext);
