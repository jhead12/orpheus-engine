import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { Mixer } from '../Mixer';
import { WorkstationContext } from '@orpheus/contexts/WorkstationContext';
import { MixerContext } from '@orpheus/contexts/MixerContext';

import type { WorkstationContextType } from '@orpheus/contexts/WorkstationContext';
import type { MixerContextType } from '@orpheus/contexts/MixerContext';
import { TrackType, AutomationMode, TimelinePosition } from '@orpheus/types/core';

// Simple mock for the contexts
const mockWorkstationContext: Partial<WorkstationContextType> = {
  tracks: [],
  masterTrack: { 
    id: 'master', 
    name: 'Master', 
    type: TrackType.Audio, 
    color: '#444',
    volume: { value: 0.8, isAutomated: false },
    pan: { value: 0, isAutomated: false },
    mute: false,
    solo: false,
    armed: false,
    clips: [],
    effects: [],
    automationLanes: [],
    automation: false,
    automationMode: AutomationMode.Read,
    fx: {
      preset: null,
      selectedEffectIndex: 0,
      effects: []
    }
  },
  selectedTrackId: null,
  setSelectedTrackId: vi.fn(),
  getTrackCurrentValue: vi.fn().mockReturnValue({ value: 0, isAutomated: false }),
  setTrack: vi.fn(),
  setAllowMenuAndShortcuts: vi.fn(),
  playheadPos: new TimelinePosition(0, 0, 0),
  maxPos: new TimelinePosition(32, 0, 0),
  numMeasures: 32,
  isPlaying: false,
  verticalScale: 1,
  showMaster: true,
  snapGridSize: new TimelinePosition(0, 1, 0),
  trackRegion: null,
  timelineSettings: {
    tempo: 120,
    timeSignature: { beats: 4, noteValue: 4 },
    snap: true,
    snapUnit: 'beat' as const,
    horizontalScale: 1
  },
  setPlayheadPos: vi.fn(),
  setTracks: vi.fn(),
  setVerticalScale: vi.fn(),
  updateTimelineSettings: vi.fn(),
  adjustNumMeasures: vi.fn(),
  createAudioClip: vi.fn(),
  insertClips: vi.fn(),
  pasteNode: vi.fn(),
  setLane: vi.fn(),
  createClipFromTrackRegion: vi.fn()
};

const mockMixerContext: Partial<MixerContextType> = {
  tracks: [],
  masterVolume: 1,
  masterPan: 0,
  masterMute: false,
  mixerHeight: 200,
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
  meters: {},
  isVisible: true,
  setIsVisible: vi.fn(),
  soloedTracks: [],
  muteAllTracks: vi.fn(),
  unmuteAllTracks: vi.fn(),
  resetAllLevels: vi.fn()
};

// Mock the widgets package
vi.mock('@orpheus/widgets', () => ({
  Dialog: ({ children, ...rest }: { children: React.ReactNode } & Record<string, any>) => <div {...rest}>{children}</div>,
  SelectSpinBox: ({ title, value, onChange, ...rest }: { title: string; value: any; onChange: (value: any) => void } & Record<string, any>) => (
    <select title={title} value={value} onChange={(e) => onChange(e.target.value)} {...rest} />
  ),
  Knob: ({ value, onChange, ...rest }: { value: number; onChange: (value: number) => void } & Record<string, any>) => (
    <div data-testid="knob" {...rest}>
      <input type="range" value={value || 0} onChange={(e) => onChange(parseFloat(e.target.value))} />
    </div>
  ),
  Meter: ({ value, ...rest }: { value: number } & Record<string, any>) => <div data-testid="meter" {...rest}>{value}</div>,
  SortableList: ({ children, ...rest }: { children: React.ReactNode } & Record<string, any>) => <div data-testid="sortable-list" {...rest}>{children}</div>,
  SortableListItem: ({ children, index, ...rest }: { children: React.ReactNode; index: number } & Record<string, any>) => (
    <div data-testid={`sortable-item-${index}`} {...rest}>{children}</div>
  ),
  HueInput: ({ value, onChange, ...rest }: { value: number; onChange?: (value: number) => void } & Record<string, any>) => (
    <input data-testid="hue-input" value={value || 0} onChange={(e) => onChange && onChange(parseFloat(e.target.value))} {...rest} />
  )
}));

// Mock the icons component
vi.mock('../../../components/icons/TrackIcon', () => ({
  default: ({ type }: { type: string }) => <div>Icon-{type}</div>
}));

// Mock the TrackVolumeSlider
vi.mock('../index', () => ({
  TrackVolumeSlider: ({ track }: { track: any }) => (
    <div data-testid={`mixer-volume-${track?.id}`}>{track?.volume?.value || 0}</div>
  ),
  FXComponent: () => <div>FX</div>
}));

describe('Simple Mixer Test', () => {
  it('should render without errors', () => {
    const { container } = render(
      <WorkstationContext.Provider value={mockWorkstationContext as WorkstationContextType}>
        <MixerContext.Provider value={mockMixerContext as MixerContextType}>
          <Mixer />
        </MixerContext.Provider>
      </WorkstationContext.Provider>
    );
    
    expect(container).toBeTruthy();
  });
});
