import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface PreferencesData {
  theme: 'light' | 'dark' | 'system';
  colorScheme: 'default' | 'azure' | 'aqua' | 'crimson' | 'olive' | 'violet' | 'citrus' | 'mono';
  customColors: {
    primary: string;
    primaryMuted: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
  };
  colorAdjustments: {
    brightness: number; // -100 to 100
    contrast: number;   // -100 to 100
    saturation: number; // -100 to 100
    hue: number;        // -180 to 180
  };
  audioInputDevice: string;
  audioOutputDevice: string;
  sampleRate: number;
  bufferSize: number;
  autosaveInterval: number;
  snapToGrid: boolean;
  showWaveforms: boolean;
  showMIDINotes: boolean;
}

const defaultPreferences: PreferencesData = {
  theme: 'system',
  colorScheme: 'default',
  customColors: {
    primary: '#ff6db8',
    primaryMuted: '#ffecf6',
    accent: '#00b0ff',
    background: '#ffffff',
    surface: '#f5f5f5',
    text: '#2c2c2c',
  },
  colorAdjustments: {
    brightness: 0,
    contrast: 0,
    saturation: 0,
    hue: 0,
  },
  audioInputDevice: 'default',
  audioOutputDevice: 'default',
  sampleRate: 44100,
  bufferSize: 1024,
  autosaveInterval: 5,
  snapToGrid: true,
  showWaveforms: true,
  showMIDINotes: true,
};

interface PreferencesContextType {
  preferences: PreferencesData;
  updatePreference: <K extends keyof PreferencesData>(key: K, value: PreferencesData[K]) => void;
  resetPreferences: () => void;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export { PreferencesContext };

const STORAGE_KEY = 'orpheus-engine-preferences';

export const PreferencesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [preferences, setPreferences] = useState<PreferencesData>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? { ...defaultPreferences, ...JSON.parse(stored) } : defaultPreferences;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  }, [preferences]);

  useEffect(() => {
    // Apply theme
    const theme = preferences.theme === 'system' 
      ? window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      : preferences.theme;
    
    document.documentElement.setAttribute('data-theme', theme);
    
    // Apply color scheme
    document.documentElement.setAttribute('data-color', preferences.colorScheme);
    
    // Apply color adjustments as CSS variables
    const adjustments = preferences.colorAdjustments;
    const filter = `brightness(${100 + adjustments.brightness}%) contrast(${100 + adjustments.contrast}%) saturate(${100 + adjustments.saturation}%) hue-rotate(${adjustments.hue}deg)`;
    
    document.documentElement.style.setProperty('--color-filter', filter);
    
    // Apply custom colors
    const custom = preferences.customColors;
    document.documentElement.style.setProperty('--custom-primary', custom.primary);
    document.documentElement.style.setProperty('--custom-primary-muted', custom.primaryMuted);
    document.documentElement.style.setProperty('--custom-accent', custom.accent);
    document.documentElement.style.setProperty('--custom-background', custom.background);
    document.documentElement.style.setProperty('--custom-surface', custom.surface);
    document.documentElement.style.setProperty('--custom-text', custom.text);
    
  }, [preferences.theme, preferences.colorScheme, preferences.colorAdjustments, preferences.customColors]);

  const updatePreference = <K extends keyof PreferencesData>(
    key: K,
    value: PreferencesData[K]
  ) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const resetPreferences = () => {
    setPreferences(defaultPreferences);
  };

  const value: PreferencesContextType = {
    preferences,
    updatePreference,
    resetPreferences,
  };

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
};

export const usePreferences = () => {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
};

export default PreferencesProvider;
