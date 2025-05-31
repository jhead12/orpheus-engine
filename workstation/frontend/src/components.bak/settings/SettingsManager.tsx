import React, { createContext, useContext, useState, ReactNode } from 'react';
import { TimeSignature, TimelineSettings } from '../../services/types/types';

interface Settings {
  timeline: TimelineSettings;
  audio: {
    masterVolume: number;
    metronomeEnabled: boolean;
    countInEnabled: boolean;
  };
  ui: {
    showMixer: boolean;
    showTimeline: boolean;
    verticalZoom: number;
    horizontalZoom: number;
  };
}

const defaultSettings: Settings = {
  timeline: {
    tempo: 120,
    timeSignature: {
      beats: 4,
      noteValue: 4
    },
    snap: true,
    snapUnit: 'beat'
  },
  audio: {
    masterVolume: 1,
    metronomeEnabled: true,
    countInEnabled: true
  },
  ui: {
    showMixer: true,
    showTimeline: true,
    verticalZoom: 1,
    horizontalZoom: 1
  }
};

interface SettingsContextValue {
  settings: Settings;
  updateSettings: <K extends keyof Settings>(
    category: K,
    value: Partial<Settings[K]>
  ) => void;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(defaultSettings);

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

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export default SettingsProvider;
