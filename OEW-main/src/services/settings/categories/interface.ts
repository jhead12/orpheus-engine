import { ThemeSettings } from '../types';

export const updateInterfaceSettings = (
  current: ThemeSettings,
  updates: Partial<ThemeSettings>
): ThemeSettings => {
  return {
    ...current,
    ...updates
  };
};

export const interfaceSettingsFields = [
  {
    id: 'colorScheme',
    label: 'Color Scheme',
    description: 'Choose the UI theme',
    type: 'select',
    options: [
      { label: 'Light', value: 'light' },
      { label: 'Dark', value: 'dark' },
      { label: 'Use System Setting', value: 'system' }
    ]
  },
  {
    id: 'accentColor',
    label: 'Accent Color',
    description: 'Primary UI highlight color',
    type: 'color',
    presets: [
      { label: 'Blue', value: '#1e88e5' },
      { label: 'Green', value: '#4caf50' },
      { label: 'Purple', value: '#9c27b0' },
      { label: 'Orange', value: '#ff9800' },
      { label: 'Red', value: '#f44336' }
    ]
  }
];
