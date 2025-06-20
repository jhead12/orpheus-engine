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
export const createAutomatableParam = (initialValue = 0): AutomatableParameter => ({
  value: initialValue,
  isAutomated: false
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
    }
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
    }
  }
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
  }
};

// Create the mock workstation context with all required properties
export const mockWorkstationContext: WorkstationContextType = {
  tracks: mockTracks,
  masterTrack: mockMasterTrack,
  selectedTrackId: 'track-1',
  selectedClipId: null,
  allowMenuAndShortcuts: true,
  isPlaying: false,
  position: { bars: 1, beats: 1, sixteenths: 1, ticks: 0, totalBeats: 0 } as TimelinePosition,
  setAllowMenuAndShortcuts: vi.fn(),
  selectTrack: vi.fn(),
  selectClip: vi.fn(),
  updateTrack: vi.fn(),
  reorderTracks: vi.fn(),
  audioAnalysisResults: null,
  automationData: {},
  getTrackAutomationValue: vi.fn().mockReturnValue(0),
  
  // Additional properties
  snapGridSize: new TimelinePosition(1, 0, 0),
  snapGridSizeOption: "bar",
  autoGridSize: 16,
  stretchAudio: false,
  showMaster: true, 
  showTimeRuler: true,
  scrollToItem: null,
  songRegion: null, 
  trackRegion: null,
  canUndo: false,
  canRedo: false,

  // FX Chain preset support
  fxChainPresets: [],
  setFXChainPresets: vi.fn(),

  // Methods
  addTrack: vi.fn(),
  createAudioClip: vi.fn().mockResolvedValue(null),
  setTrack: vi.fn((updatedTrack) => {
    // Handle case where an event object is passed instead of a value
    if (updatedTrack && typeof updatedTrack.automationMode === 'object' && updatedTrack.automationMode.target) {
      const value = updatedTrack.automationMode.target.value;
      updatedTrack = { ...updatedTrack, automationMode: value };
    }
    
    // Update the mock track
    const index = mockTracks.findIndex(t => t.id === updatedTrack.id);
    if (index >= 0) {
      mockTracks[index] = { ...updatedTrack };
    }
    return;
  }),
  setTracks: vi.fn(),
  deleteTrack: vi.fn(),
  duplicateTrack: vi.fn(),
  splitClip: vi.fn(),
  toggleMuteClip: vi.fn(),
  consolidateClip: vi.fn(),
  createClip: vi.fn(),
  updateClip: vi.fn(),
  deleteClip: vi.fn(),
  duplicateClip: vi.fn(),
  createClipFromTrackRegion: vi.fn(),
  insertClips: vi.fn(),
  setPlayheadPos: vi.fn(),
  setPosition: vi.fn(),
  adjustNumMeasures: vi.fn(),
  setSongRegion: vi.fn(),
  setScrollToItem: vi.fn(),
  updateTimelineSettings: vi.fn(),
  setVerticalScale: vi.fn(),
  setSelectedTrackId: vi.fn(),
  setShowTimeRuler: vi.fn(),
  setSnapGridSizeOption: vi.fn(),
  setStretchAudio: vi.fn(),
  setTrackRegion: vi.fn(),
  deleteSelection: vi.fn(),
  pasteClip: vi.fn(),
  setTimeSignature: vi.fn(),
  undo: vi.fn(),
  redo: vi.fn(),
  setSelectedClipId: vi.fn(),
  stopRecording: vi.fn().mockResolvedValue(null),

  // Plugin system
  plugins: [],
  registerPlugin: vi.fn(),
  unregisterPlugin: vi.fn(),

  // Track value getter
  getTrackCurrentValue: vi.fn((track: Track, lane?: any) => {
    if (lane) {
      return { value: lane.nodes?.[0]?.value || 0, isAutomated: true };
    }
    return { value: track.pan?.value || 0, isAutomated: false };
  })
};

// Create MixerContext for testing
export const mockMixerContext = {
  tracks: mockTracks,
  masterVolume: 0.8,
  masterPan: 0,
  masterMute: false,
  mixerHeight: 400,
  setMasterVolume: vi.fn(),
  setMasterPan: vi.fn(),
  setMasterMute: vi.fn(),
  setMixerHeight: vi.fn(),
  setTrackVolume: vi.fn(),
  setTrackPan: vi.fn(),
  setTrackMute: vi.fn((trackId, muted) => {
    // Update the mock track's mute status
    mockWorkstationContext.setTrack({
      ...mockTracks.find(t => t.id === trackId),
      mute: muted
    });
    return Promise.resolve();
  }),
  setTrackSolo: vi.fn((trackId, soloed) => {
    // Update the mock track's solo status
    mockWorkstationContext.setTrack({
      ...mockTracks.find(t => t.id === trackId),
      solo: soloed
    });
    return Promise.resolve();
  }),
  setTrackArmed: vi.fn((trackId, armed) => {
    // Update the mock track's armed status
    mockWorkstationContext.setTrack({
      ...mockTracks.find(t => t.id === trackId),
      armed: armed
    });
    return Promise.resolve();
  }),
  addEffect: vi.fn(),
  removeEffect: vi.fn(),
  updateEffect: vi.fn(),
  reorderEffects: vi.fn(),
  meters: {
    'track-1': { left: 0.2, right: 0.3, peak: 0.5 },
    'track-2': { left: 0.1, right: 0.2, peak: 0.3 },
    'master': { left: 0.3, right: 0.4, peak: 0.6 }
  },
  isVisible: true,
  setIsVisible: vi.fn(),
  soloedTracks: [],
  muteAllTracks: vi.fn(),
  unmuteAllTracks: vi.fn(),
  resetAllLevels: vi.fn()
};
