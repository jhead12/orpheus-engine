import React, { createContext, useContext, useState, useEffect } from 'react';

interface Preferences {
  theme: 'light' | 'dark' | 'system';
  autoSave: boolean;
  autoSaveInterval: number;
  showGridLines: boolean;
  defaultSnap: number;
  audioBufferSize: number;
  midiInputDevice: string;
  midiOutputDevice: string;
  audioInputDevice: string;
  audioOutputDevice: string;
  metronomeEnabled: boolean;
  countInEnabled: boolean;
}

const defaultPreferences: Preferences = {
  theme: 'system',
  autoSave: true,
  autoSaveInterval: 5,
  showGridLines: true,
  defaultSnap: 16,
  audioBufferSize: 1024,
  midiInputDevice: 'default',
  midiOutputDevice: 'default',
  audioInputDevice: 'default',
  audioOutputDevice: 'default',
  metronomeEnabled: true,
  countInEnabled: true
};

interface PreferencesContextType {
  preferences: Preferences;
  updatePreference: <K extends keyof Preferences>(key: K, value: Preferences[K]) => void;
  resetPreferences: () => void;
}

const PreferencesContext = createContext<PreferencesContextType | null>(null);

export const PreferencesProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [preferences, setPreferences] = useState<Preferences>(defaultPreferences);

  // Load preferences from localStorage on component mount
  useEffect(() => {
    const savedPreferences = localStorage.getItem('oew-preferences');
    if (savedPreferences) {
      try {
        setPreferences({ ...defaultPreferences, ...JSON.parse(savedPreferences) });
      } catch (e) {
        console.error('Failed to load preferences:', e);
      }
    }
  }, []);

  // Save preferences to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('oew-preferences', JSON.stringify(preferences));
  }, [preferences]);

  const updatePreference = <K extends keyof Preferences>(key: K, value: Preferences[K]) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const resetPreferences = () => {
    setPreferences(defaultPreferences);
  };

  return (
    <PreferencesContext.Provider value={{ preferences, updatePreference, resetPreferences }}>
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

export default PreferencesContext;
