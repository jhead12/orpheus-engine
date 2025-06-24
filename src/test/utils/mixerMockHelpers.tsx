import { vi } from 'vitest';
import {
  Track,
  TrackType,
  AutomationMode,
  AutomatableParameter,
  TimelinePosition,
} from '../../types/core';
import { WorkstationContextType } from '../../contexts/WorkstationContext';

// Create reusable mock for AutomatableParameter
export const createAutomatableParam = (
  initialValue = 0
): AutomatableParameter => ({
  value: initialValue,
  isAutomated: false,
});

// Create mock tracks with proper parameter types
export const mockTracks: Track[] = [
  {
    id: 'track-1',
    name: 'Vocals',
    type: TrackType.Audio,
    color: '#ff6b6b',
    mute: false,
    solo: false,
    armed: false,
    volume: createAutomatableParam(0.8),
    pan: createAutomatableParam(0.1),
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
  {
    id: 'track-2',
    name: 'Guitar',
    type: TrackType.Audio,
    color: '#4ecdc4',
    mute: true,
    solo: false,
    armed: true,
    volume: createAutomatableParam(0.6),
    pan: createAutomatableParam(-0.2),
    automation: false,
    automationMode: AutomationMode.Write,
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

export const mockMasterTrack: Track = {
  id: 'master',
  name: 'Master',
  type: TrackType.Audio,
  color: '#444444',
  mute: false,
  solo: false,
  armed: false,
  volume: createAutomatableParam(0.8),
  pan: createAutomatableParam(0),
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
};

// Create the mock workstation context with all required properties
export const mockWorkstationContext: WorkstationContextType = {
  tracks: mockTracks,
  masterTrack: mockMasterTrack,
  selectedTrackId: 'track-1',
  selectedClipId: null,
  allowMenuAndShortcuts: true,
  isPlaying: false,
  playheadPos: new TimelinePosition(1, 1, 0),
  maxPos: new TimelinePosition(4, 1, 0),
  numMeasures: 4,
  setAllowMenuAndShortcuts: vi.fn(),
  setSelectedTrackId: vi.fn(),
  setSelectedClipId: vi.fn(),
  snapGridSize: new TimelinePosition(1, 0, 0),
  snapGridSizeOption: 'bar',
  stretchAudio: false,
  showMaster: true,
  showTimeRuler: true,
  scrollToItem: null,
  songRegion: null,
  trackRegion: null,
  setTracks: vi.fn(),
  deleteTrack: vi.fn(),
  duplicateTrack: vi.fn(),
  splitClip: vi.fn(),
  toggleMuteClip: vi.fn(),
  consolidateClip: vi.fn(),
  deleteClip: vi.fn(),
  duplicateClip: vi.fn(),
  createClipFromTrackRegion: vi.fn(),
  insertClips: vi.fn(),
  setPlayheadPos: vi.fn(),
  adjustNumMeasures: vi.fn(),
  setSongRegion: vi.fn(),
  setScrollToItem: vi.fn(),
  updateTimelineSettings: vi.fn(),
  setVerticalScale: vi.fn(),
  setShowTimeRuler: vi.fn(),
  setSnapGridSizeOption: vi.fn(),
  setStretchAudio: vi.fn(),
  setTrackRegion: vi.fn(),
  pasteClip: vi.fn(),
  setTimeSignature: vi.fn(),
  getTrackCurrentValue: vi.fn((track: Track, lane?: any) => {
    if (lane) {
      return { value: lane.nodes?.[0]?.value || 0, isAutomated: true };
    }
    return { value: track.pan?.value || 0, isAutomated: false };
  }),
  // Required methods from WorkstationContextType
  addNode: vi.fn(),
  addTrack: vi.fn(),
  createAudioClip: vi.fn(),
  pasteNode: vi.fn(),
  setLane: vi.fn(),
  setMetronome: vi.fn(),
  skipToEnd: vi.fn(),
  skipToStart: vi.fn(),
  setTrack: vi.fn(),
  timelineSettings: {
    tempo: 120,
    timeSignature: { beats: 4, noteValue: 4 },
    snap: true,
    snapUnit: 'beat',
    horizontalScale: 1,
  },
  verticalScale: 1,
};

// Add export for mockMixerContext
export * from './mockMixerContext';
