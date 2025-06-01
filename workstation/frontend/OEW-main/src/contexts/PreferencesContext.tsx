import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface PreferencesData {
  theme: 'light' | 'dark' | 'system';
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
  }, [preferences.theme]);

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
