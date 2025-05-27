import { PluginSettings } from '../types';

export const updatePluginSettings = (
  current: PluginSettings,
  updates: Partial<PluginSettings>
): PluginSettings => {
  return {
    ...current,
    ...updates
  };
};

export const pluginSettingsFields = [
  {
    id: 'pluginFolders',
    label: 'Plugin Folders',
    description: 'Folders where plugins are located',
    type: 'pathlist'
  },
  {
    id: 'scanOnStartup',
    label: 'Scan on Startup',
    description: 'Automatically scan for plugins when the application starts',
    type: 'boolean'
  },
  {
    id: 'preferredPluginFormats',
    label: 'Preferred Plugin Formats',
    description: 'Prioritize these plugin formats when multiple formats are available',
    type: 'multiselect',
    options: [
      { label: 'VST3', value: 'VST3' },
      { label: 'Audio Unit', value: 'AU' },
      { label: 'VST', value: 'VST' },
      { label: 'LV2', value: 'LV2' }
    ]
  }
];
