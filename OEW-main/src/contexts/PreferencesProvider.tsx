import React, { createContext, useContext, useState, type PropsWithChildren } from 'react';
import { Preferences, SnapGridSizeOption } from '../services/types/types';

// Use the interface from index.ts to match exactly what's expected
interface PreferencesContextType {
  darkMode: boolean;
  preferences: Preferences;
  savePreferences: () => void;
  savedPreferences: Preferences;
  setShowPreferences: (show: boolean) => void;
  showPreferences: boolean;
  theme: string; // Add this missing required property
  updatePreferences: (preferences: Preferences) => void;
}

// Create a local context that matches the interface
export const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export function usePreferences(): PreferencesContextType {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
}

export default function PreferencesProvider({ children }: PropsWithChildren<{}>) {
  // Initialize with the correct Preferences shape
  const [preferences, setPreferences] = useState<Preferences>({
    theme: 'dark',
    snapGridSize: SnapGridSizeOption.Measure
    // Remove the color property as it's not in the Preferences interface
  });
  
  const [savedPreferences, setSavedPreferences] = useState<Preferences>({
    theme: 'dark',
    snapGridSize: SnapGridSizeOption.Measure
    // Remove the color property as it's not in the Preferences interface
  });
  
  const [showPreferences, setShowPreferences] = useState(false);
  
  // Calculate dark mode based on theme
  const darkMode = preferences.theme === 'dark' || 
                  (preferences.theme === 'system' && 
                   window.matchMedia('(prefers-color-scheme: dark)').matches);
  
  const savePreferences = () => {
    setSavedPreferences({ ...preferences });
    // Save to localStorage or elsewhere
    try {
      localStorage.setItem('preferences', JSON.stringify(preferences));
    } catch (e) {
      console.error('Failed to save preferences to localStorage', e);
    }
  };
  
  const updatePreferences = (newPrefs: Preferences) => {
    setPreferences(newPrefs);
  };

  const contextValue = {
    darkMode,
    preferences,
    savePreferences,
    savedPreferences,
    setShowPreferences,
    showPreferences,
    theme: preferences.theme, // Add the required theme property
    updatePreferences
  };

  return React.createElement(
    PreferencesContext.Provider,
    { value: contextValue },
    children
  );
};