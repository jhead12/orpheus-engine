import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { Mixer } from '../Mixer';
import { WorkstationContext } from '@orpheus/contexts/WorkstationContext';
import { MixerContext } from '@orpheus/contexts/MixerContext';

// Simple mock for the contexts
const mockWorkstationContext = {
  tracks: [],
  masterTrack: { id: 'master', name: 'Master', type: 'Audio', volume: 0.8 },
  selectedTrackId: null,
  setSelectedTrackId: vi.fn(),
  getTrackCurrentValue: vi.fn().mockReturnValue({ value: 0, isAutomated: false }),
  setTrack: vi.fn(),
  automationMode: 'Off',
  setAutomationMode: vi.fn()
};

const mockMixerContext = {
  setTrackVolume: vi.fn(),
  setTrackPan: vi.fn(),
  setTrackMute: vi.fn(),
  setTrackSolo: vi.fn(),
  setTrackArmed: vi.fn()
};

// Mock the widgets package
vi.mock('@orpheus/widgets', () => ({
  Dialog: ({ children, ...rest }) => <div {...rest}>{children}</div>,
  SelectSpinBox: ({ title, value, onChange, ...rest }) => (
    <select title={title} value={value} onChange={(e) => onChange(e.target.value)} {...rest} />
  ),
  Knob: ({ value, onChange, ...rest }) => (
    <div data-testid="knob" {...rest}>
      <input type="range" value={value || 0} onChange={(e) => onChange(parseFloat(e.target.value))} />
    </div>
  ),
  Meter: ({ value, ...rest }) => <div data-testid="meter" {...rest}>{value}</div>,
  SortableList: ({ children, ...rest }) => <div data-testid="sortable-list" {...rest}>{children}</div>,
  SortableListItem: ({ children, index, ...rest }) => (
    <div data-testid={`sortable-item-${index}`} {...rest}>{children}</div>
  )
}));

// Mock the icons component
vi.mock('../../../components/icons/TrackIcon', () => ({
  default: ({ type }) => <div>Icon-{type}</div>
}));

// Mock the TrackVolumeSlider
vi.mock('../index', () => ({
  TrackVolumeSlider: ({ track }) => (
    <div data-testid={`mixer-volume-${track?.id}`}>{track?.volume?.value || 0}</div>
  ),
  FXComponent: () => <div>FX</div>
}));

describe('Simple Mixer Test', () => {
  it('should render without errors', () => {
    const { container } = render(
      <WorkstationContext.Provider value={mockWorkstationContext}>
        <MixerContext.Provider value={mockMixerContext}>
          <Mixer />
        </MixerContext.Provider>
      </WorkstationContext.Provider>
    );
    
    expect(container).toBeTruthy();
  });
});
