import { vi } from 'vitest';
import { Track, AutomationMode, TrackType } from '../../types/core';
import type { MixerContextType } from '../../contexts/MixerContext';

// Minimal mock tracks for mixer context
export const mockMixerTracks: Track[] = [
  {
    id: 'track-1',
    name: 'Vocals',
    type: TrackType.Audio,
    color: '#ff6b6b',
    mute: false,
    solo: false,
    armed: false,
    volume: { value: 0.8, isAutomated: false },
    pan: { value: 0, isAutomated: false },
    automation: false,
    automationMode: AutomationMode.Read,
    automationLanes: [],
    clips: [],
    effects: [],
    fx: {
      preset: null,
      effects: [],
      selectedEffectIndex: 0,
    },
  },
];

export const mockMixerContext: MixerContextType = {
  tracks: mockMixerTracks,
  masterVolume: 1,
  masterPan: 0,
  masterMute: false,
  mixerHeight: 300,
  setMasterVolume: vi.fn(),
  setMasterPan: vi.fn(),
  setMasterMute: vi.fn(),
  setMixerHeight: vi.fn(),
  setTrackVolume: vi.fn(),
  setTrackPan: vi.fn(),
  setTrackMute: vi.fn(),
  setTrackSolo: vi.fn(),
  setTrackArmed: vi.fn(),
  addEffect: vi.fn(),
  removeEffect: vi.fn(),
  updateEffect: vi.fn(),
  reorderEffects: vi.fn(),
  meters: {
    'track-1': { left: 0, right: 0, peak: 0 },
    master: { left: 0, right: 0, peak: 0 },
  },
  isVisible: true,
  setIsVisible: vi.fn(),
  soloedTracks: [],
  muteAllTracks: vi.fn(),
  unmuteAllTracks: vi.fn(),
  resetAllLevels: vi.fn(),
};
