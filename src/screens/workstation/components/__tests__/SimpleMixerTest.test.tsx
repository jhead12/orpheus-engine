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
      effects: [],
    },
  },
  selectedTrackId: null,
  setSelectedTrackId: vi.fn(),
  getTrackCurrentValue: vi
    .fn()
    .mockReturnValue({ value: 0, isAutomated: false }),
  setTrack: vi.fn(),
  automationMode: 'Off',
  setAutomationMode: vi.fn(),
  setAllowMenuAndShortcuts: vi.fn(),
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
};

// Mock the widgets package
vi.mock('@orpheus/widgets', () => ({
  Dialog: ({ children, ...rest }) => <div {...rest}>{children}</div>,
  SelectSpinBox: ({ title, value, onChange, ...rest }) => (
    <select
      title={title}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      {...rest}
    />
  ),
  Knob: ({ value, onChange, ...rest }: { value: number; onChange: (value: number) => void } & Record<string, any>) => (
    <div data-testid="knob" {...rest}>
      <input
        type="range"
        value={value || 0}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
    </div>
  ),
  Meter: ({ value, ...rest }) => (
    <div data-testid="meter" {...rest}>
      {value}
    </div>
  ),
  SortableList: ({ children, ...rest }) => (
    <div data-testid="sortable-list" {...rest}>
      {children}
    </div>
  ),
  SortableListItem: ({ children, index, ...rest }) => (
    <div data-testid={`sortable-item-${index}`} {...rest}>
      {children}
    </div>
  ),
  HueInput: ({ value, onChange, ...rest }) => (
    <input
      data-testid="hue-input"
      value={value || 0}
      onChange={(e) => onChange && onChange(parseFloat(e.target.value))}
      {...rest}
    />
  ),
}));

// Mock the icons component
vi.mock('../../../components/icons/TrackIcon', () => ({
  default: ({ type }) => <div>Icon-{type}</div>,
}));

// Mock the TrackVolumeSlider
vi.mock('../index', () => ({
  TrackVolumeSlider: ({ track }) => (
    <div data-testid={`mixer-volume-${track?.id}`}>
      {track?.volume?.value || 0}
    </div>
  ),
  FXComponent: () => <div>FX</div>,
}));

describe('Simple Mixer Test', () => {
  it('should render without errors', () => {
    const { container } = render(
      <WorkstationContext.Provider value={mockWorkstationContext as WorkstationContextType}>
        <MixerContext.Provider value={mockMixerContext as MixerContextType}>
          <Mixer />
        </MixerContext.Provider>
      </WorkstationContext.Provider>,
    );

    expect(container).toBeTruthy();
  });
});
