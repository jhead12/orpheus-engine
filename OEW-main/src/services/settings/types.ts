/**
 * Core types for the settings system
 */

export interface SettingsCategory {
  id: string;
  label: string;
  icon?: string;
}

export interface Setting<T = any> {
  id: string;
  label: string;
  description?: string;
  category: string;
  defaultValue: T;
  value: T;
  type: 'string' | 'number' | 'boolean' | 'select' | 'color' | 'path';
  options?: Array<{ label: string; value: any }>;
  min?: number;
  max?: number;
  step?: number;
  hidden?: boolean;
}

export interface SettingsState {
  categories: SettingsCategory[];
  settings: Record<string, Setting>;
  loaded: boolean;
}

export interface AudioSettings {
  inputDevice: string;
  outputDevice: string;
  sampleRate: number;
  bufferSize: number;
}

export interface MIDISettings {
  inputDevices: string[];
  outputDevices: string[];
  enableMPE: boolean;
}

export interface ThemeSettings {
  colorScheme: 'light' | 'dark' | 'system';
  accentColor: string;
  customTheme?: Record<string, string>;
}

export interface GeneralSettings {
  autoSaveEnabled: boolean;
  autoSaveInterval: number;
  createBackups: boolean;
  defaultProjectLocation: string;
}

export interface PluginSettings {
  pluginFolders: string[];
  scanOnStartup: boolean;
  preferredPluginFormats: string[];
}

export interface SettingsStore {
  audio: AudioSettings;
  midi: MIDISettings;
  theme: ThemeSettings;
  general: GeneralSettings;
  plugins: PluginSettings;
}
