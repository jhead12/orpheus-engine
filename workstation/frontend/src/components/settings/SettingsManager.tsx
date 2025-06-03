import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { TimeSignature, TimelineSettings } from '../../services/types/types';

// Define the Settings interface
interface Settings {
  timeline: TimelineSettings;
  audio: {
    masterVolume: number;
    metronomeEnabled: boolean;
    countInEnabled: boolean;
    inputDevice: string;
    outputDevice: string;
    sampleRate: number;
    bufferSize: number;
    bitDepth: 16 | 24 | 32;
  };
  ui: {
    showMixer: boolean;
    showTimeline: boolean;
    verticalZoom: number;
    horizontalZoom: number;
    theme: 'light' | 'dark' | 'system';
    trackHeight: number;
    waveformResolution: number;
    showTooltips: boolean;
  };
  project: {
    autosaveInterval: number; // in minutes, 0 to disable
    backupCount: number;
    defaultProjectLocation: string;
  };
  mcp: {
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
  };
  audioLibrary: {
    defaultSortBy: 'name' | 'date' | 'duration' | 'type';
    defaultSortOrder: 'asc' | 'desc';
    showWaveforms: boolean;
    cacheSize: number; // in MB
    autoAnalyze: boolean;
    defaultLocation: string;
    maxRecentItems: number;
    fileTypes: string[]; // supported file extensions
  };
  plugins: {
    enabledPlugins: string[]; // list of enabled plugin IDs
    disabledPlugins: string[]; // list of disabled plugin IDs
    pluginConfigs: Record<string, any>; // plugin-specific configurations
    allowExternalPlugins: boolean;
    pluginSources: string[]; // URLs to fetch plugins from
    autoUpdate: boolean;
    developerMode: boolean; // enable additional developer features
  };
}

// Define default settings
const defaultSettings: Settings = {
  timeline: {
    tempo: 120,
    timeSignature: {
      beats: 4,
      noteValue: 4
    },
    snap: true,
    snapUnit: 'beat',
    horizontalScale: 1 // Added the horizontalScale property to fix the type error
  },
  audio: {
    masterVolume: 1,
    metronomeEnabled: true,
    countInEnabled: true,
    inputDevice: 'default',
    outputDevice: 'default',
    sampleRate: 44100,
    bufferSize: 1024,
    bitDepth: 24
  },
  ui: {
    showMixer: true,
    showTimeline: true,
    verticalZoom: 1,
    horizontalZoom: 1,
    theme: 'system',
    trackHeight: 100,
    waveformResolution: 128,
    showTooltips: true
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
    creativity: 0.8, // 0-1 scale
    styleLearning: true,
    autoSuggest: false
  },
  audioLibrary: {
    defaultSortBy: 'name',
    defaultSortOrder: 'asc',
    showWaveforms: true,
    cacheSize: 512, // 512 MB cache
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
  }
};

// Storage key for settings
const SETTINGS_STORAGE_KEY = 'orpheus-engine-settings';

// Define the context value interface
interface SettingsContextValue {
  settings: Settings;
  updateSettings: <K extends keyof Settings>(
    category: K,
    value: Partial<Settings[K]>
  ) => void;
  resetSettings: (category?: keyof Settings) => void;
  saveSettings: () => void;
  loadSettings: () => void;
}

// Create the settings context
const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

// Save settings to local storage
const saveSettingsToStorage = (settings: Settings) => {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  }
};

// Load settings from local storage
const loadSettingsFromStorage = (): Settings => {
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

// Settings provider component
export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [initialized, setInitialized] = useState(false);

  // Load settings on initial render
  useEffect(() => {
    const storedSettings = loadSettingsFromStorage();
    setSettings(storedSettings);
    setInitialized(true);
  }, []);

  // Save settings whenever they change
  useEffect(() => {
    if (initialized) {
      saveSettingsToStorage(settings);
    }
  }, [settings, initialized]);

  // Update settings by category
  const updateSettings = <K extends keyof Settings>(
    category: K,
    value: Partial<Settings[K]>
  ) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        ...value
      }
    }));
  };

  // Reset settings to default
  const resetSettings = (category?: keyof Settings) => {
    if (category) {
      setSettings(prev => ({
        ...prev,
        [category]: defaultSettings[category]
      }));
    } else {
      setSettings(defaultSettings);
    }
  };

  // Save settings manually
  const saveSettings = () => {
    saveSettingsToStorage(settings);
  };

  // Load settings manually
  const loadSettings = () => {
    const storedSettings = loadSettingsFromStorage();
    setSettings(storedSettings);
  };

  return (
    <SettingsContext.Provider value={{ 
      settings, 
      updateSettings, 
      resetSettings,
      saveSettings,
      loadSettings
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

// Custom hook to use settings
export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export default SettingsProvider;
