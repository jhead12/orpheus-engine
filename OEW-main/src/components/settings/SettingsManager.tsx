import React, { useEffect, useState } from 'react';
import { 
  SettingsStore, 
  defaultSettings, 
  loadSettings, 
  saveSettings,
  SettingsContext
} from '../../services/settings';

interface SettingsProviderProps {
  children: React.ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<SettingsStore>(defaultSettings);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const storedSettings = loadSettings();
    setSettings(storedSettings);
    setInitialized(true);
  }, []);

  useEffect(() => {
    if (initialized) {
      saveSettings(settings);
    }
  }, [settings, initialized]);

  const updateSettings = <T extends keyof SettingsStore>(
    category: T,
    values: Partial<SettingsStore[T]>
  ) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        ...values
      }
    }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export default SettingsProvider;
