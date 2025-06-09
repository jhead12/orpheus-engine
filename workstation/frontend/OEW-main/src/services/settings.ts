import { createContext } from "react";

// Define all the settings types
export interface AudioSettings {
  sampleRate: number;
  bufferSize: number;
  inputDevice: string;
  outputDevice: string;
  defaultMixerHeight: number;
}

export interface ThemeSettings {
  theme: "light" | "dark" | "system";
  color:
    | "rose"
    | "violet"
    | "azure"
    | "aqua"
    | "olive"
    | "citrus"
    | "crimson"
    | "mono";
}

export interface WorkspaceSettings {
  autosaveInterval: number;
  showMixer: boolean;
  defaultNumMeasures: number;
  snapToGrid: boolean;
}

export interface SettingsStore {
  audio: AudioSettings;
  theme: ThemeSettings;
  workspace: WorkspaceSettings;
}

// Define default settings
export const defaultSettings: SettingsStore = {
  audio: {
    sampleRate: 44100,
    bufferSize: 1024,
    inputDevice: "default",
    outputDevice: "default",
    defaultMixerHeight: 200,
  },
  theme: {
    theme: "system",
    color: "rose",
  },
  workspace: {
    autosaveInterval: 5,
    showMixer: true,
    defaultNumMeasures: 4,
    snapToGrid: true,
  },
};

// Settings context type
export interface SettingsContextType {
  settings: SettingsStore;
  updateSettings: <T extends keyof SettingsStore>(
    category: T,
    values: Partial<SettingsStore[T]>
  ) => void;
  resetSettings: () => void;
}

// Create the context
export const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  updateSettings: () => {},
  resetSettings: () => {},
});

// Local storage key
const SETTINGS_STORAGE_KEY = "orpheus-engine-settings";

// Load settings from localStorage
export function loadSettings(): SettingsStore {
  try {
    const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Merge with default settings to ensure new settings are included
      return {
        ...defaultSettings,
        ...parsed,
        // Deep merge for nested objects
        audio: { ...defaultSettings.audio, ...parsed.audio },
        theme: { ...defaultSettings.theme, ...parsed.theme },
        workspace: { ...defaultSettings.workspace, ...parsed.workspace },
      };
    }
  } catch (error) {
    console.error("Failed to load settings:", error);
  }
  return defaultSettings;
}

// Save settings to localStorage
export function saveSettings(settings: SettingsStore): void {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error("Failed to save settings:", error);
  }
}

// Hook for accessing settings context
export function useSettings(): SettingsContextType {
  const context = createContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
