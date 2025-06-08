import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Preferences } from '../types/settings';

// Default preferences
const defaultPreferences: Preferences = {
  theme: 'system',
  color: 'rose',
  audio: {
    inputDevice: 'default',
    outputDevice: 'default',
    sampleRate: 44100,
    bufferSize: 1024,
    bitDepth: 24,
    monitorInput: false,
  },
  midi: {
    inputDevice: 'default',
    outputDevice: 'default',
    clockSync: false,
    midiThru: false,
  },
  interface: {
    timeDisplayFormat: 'measures',
    showMasterTrack: true,
    showAutomationLanes: true,
    snapToGrid: true,
    autoScroll: true,
  },
  recording: {
    countIn: false,
    countInBars: 2,
    preRoll: false,
    preRollTime: 1000,
    autoArm: false,
  },
  plugins: {
    vstPath: '',
    auPath: '',
    scanOnStartup: true,
    enableBridging: true,
  },
};

// Context type
interface PreferencesContextType {
  preferences: Preferences;
  savedPreferences: Preferences;
  showPreferences: boolean;
  setShowPreferences: (show: boolean) => void;
  updatePreferences: (preferences: Preferences) => void;
  savePreferences: () => void;
}

// Create context
const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

// Storage key
const PREFERENCES_STORAGE_KEY = 'orpheus-engine-preferences';

// Provider component
interface PreferencesProviderProps {
  children: ReactNode;
}

export const PreferencesProvider: React.FC<PreferencesProviderProps> = ({ children }) => {
  const [preferences, setPreferences] = useState<Preferences>(defaultPreferences);
  const [savedPreferences, setSavedPreferences] = useState<Preferences>(defaultPreferences);
  const [showPreferences, setShowPreferences] = useState(false);

  // Load preferences from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(PREFERENCES_STORAGE_KEY);
      if (stored) {
        const parsedPreferences = { ...defaultPreferences, ...JSON.parse(stored) };
        setPreferences(parsedPreferences);
        setSavedPreferences(parsedPreferences);
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
    }
  }, []);

  const updatePreferences = (newPreferences: Preferences) => {
    setPreferences(newPreferences);
  };

  const savePreferences = () => {
    try {
      localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(preferences));
      setSavedPreferences(preferences);
    } catch (error) {
      console.error('Failed to save preferences:', error);
    }
  };

  const value: PreferencesContextType = {
    preferences,
    savedPreferences,
    showPreferences,
    setShowPreferences,
    updatePreferences,
    savePreferences,
  };

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
};

// Hook to use preferences
export const usePreferences = () => {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
};

export default PreferencesProvider;