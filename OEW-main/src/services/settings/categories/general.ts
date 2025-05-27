import { GeneralSettings } from '../types';

export const updateGeneralSettings = (
  current: GeneralSettings,
  updates: Partial<GeneralSettings>
): GeneralSettings => {
  return {
    ...current,
    ...updates
  };
};

export const generalSettingsFields = [
  {
    id: 'autoSaveEnabled',
    label: 'Enable Auto Save',
    description: 'Automatically save your project at regular intervals',
    type: 'boolean'
  },
  {
    id: 'autoSaveInterval',
    label: 'Auto Save Interval',
    description: 'How often to save your project (in minutes)',
    type: 'number',
    min: 1,
    max: 60,
    step: 1,
    dependsOn: 'autoSaveEnabled'
  },
  {
    id: 'createBackups',
    label: 'Create Backups',
    description: 'Create backup copies when saving projects',
    type: 'boolean'
  },
  {
    id: 'defaultProjectLocation',
    label: 'Default Project Location',
    description: 'Where to save new projects by default',
    type: 'path'
  }
];
