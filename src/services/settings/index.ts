import React, { createContext, useContext, useEffect, useState } from 'react';

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
const defaultSettings: Settings = {
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
interface SettingsContextType {
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
  localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
};

// Load settings from local storage
export const loadSettings = (): Settings => {
  try {
    const storedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (storedSettings) {
      return { ...defaultSettings, ...JSON.parse(storedSettings) };
    }
  } catch (error) {
    console.error('Failed to load settings:', error);
  }
  return defaultSettings;
};

// Settings provider component
export const SettingsProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  
  // Load settings on mount
  useEffect(() => {
    setSettings(loadSettings());
  }, []);
  
  // Update settings in a specific category
  const updateSettings = <T extends keyof Settings>(
    category: T,
    newSettings: Partial<Settings[T]>
  ) => {
    setSettings(prev => {
      const updatedSettings = {
        ...prev,
        [category]: {
          ...prev[category],
          ...newSettings
        }
      };
      saveSettings(updatedSettings);
      return updatedSettings;
    });
  };
  
  // Reset all settings or a specific category
  const resetSettings = (category?: keyof Settings) => {
    if (category) {
      setSettings(prev => {
        const updatedSettings = {
          ...prev,
          [category]: defaultSettings[category]
        };
        saveSettings(updatedSettings);
        return updatedSettings;
      });
    } else {
      setSettings(defaultSettings);
      saveSettings(defaultSettings);
    }
  };
  
  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettings,
        resetSettings,
        saveSettings: () => saveSettings(settings),
        loadSettings: () => setSettings(loadSettings())
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

// Custom hook to use settings
export const useSettings = () => useContext(SettingsContext);
