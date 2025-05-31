import React, { useState, useEffect } from 'react';
import { 
  SettingsContext, 
  Settings,
  defaultSettings,
  saveSettings as saveSettingsToStorage,
  loadSettings as loadSettingsFromStorage
} from './index.fixed';

// Settings provider component
export const SettingsProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  
  // Load settings on mount
  useEffect(() => {
    setSettings(loadSettingsFromStorage());
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
      saveSettingsToStorage(updatedSettings);
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
        saveSettingsToStorage(updatedSettings);
        return updatedSettings;
      });
    } else {
      setSettings(defaultSettings);
      saveSettingsToStorage(defaultSettings);
    }
  };
  
  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettings,
        resetSettings,
        saveSettings: () => saveSettingsToStorage(settings),
        loadSettings: () => setSettings(loadSettingsFromStorage())
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export default SettingsProvider;
