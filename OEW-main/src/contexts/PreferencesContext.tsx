import React, { createContext, useState, useContext } from 'react';
import { Preferences, SnapGridSizeOption } from '../services/types/types';

interface PreferencesContextType {
  darkMode: boolean;
  preferences: Preferences;
  savePreferences: () => void;
  savedPreferences: Preferences;
  setShowPreferences: (show: boolean) => void;
  showPreferences: boolean;
  updatePreferences: (preferences: Preferences) => void;
}

const defaultPreferences: Preferences = {
  theme: 'light',
  snapGridSize: SnapGridSizeOption.Auto,
};

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export const PreferencesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState<Preferences>(defaultPreferences);
  const [savedPreferences, setSavedPreferences] = useState<Preferences>(defaultPreferences);
  const [darkMode] = useState(false); // Remove setDarkMode since it's not used

  const savePreferences = () => {
    setSavedPreferences(preferences);
    localStorage.setItem('orpheus-preferences', JSON.stringify(preferences));
  };

  const updatePreferences = (newPreferences: Preferences) => {
    setPreferences(newPreferences);
  };

  const contextValue: PreferencesContextType = {
    darkMode,
    preferences,
    savePreferences,
    savedPreferences,
    setShowPreferences,
    showPreferences,
    updatePreferences,
  };

  return (
    <PreferencesContext.Provider value={contextValue}>
      {children}
    </PreferencesContext.Provider>
  );
};

export const usePreferences = () => {
  const context = useContext(PreferencesContext);
  if (context === undefined) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
};

// Also export the context for components that need direct access
export { PreferencesContext };
