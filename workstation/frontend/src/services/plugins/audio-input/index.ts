/**
 * Audio Input Plugin System
 * Entry point for all audio input functionality
 */

// Types
export * from './types';

// Plugin Manager
export { default as audioInputPluginManager, AudioInputPluginManagerImpl } from './AudioInputPluginManager';

// Built-in Plugins
export { default as NRFAudioInputPlugin } from './built-in/NRFAudioInputPlugin';
export { default as USBAudioInputPlugin } from './built-in/USBAudioInputPlugin';
export { default as MADIAudioInputPlugin } from './built-in/MADIAudioInputPlugin';

// Re-export main interfaces for convenience
export type {
  AudioInputPlugin,
  AudioInputPluginManager,
  AudioInputDevice,
  AudioInputConfiguration,
  AudioInputStream,
  AudioInputResult,
} from './types';
