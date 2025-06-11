import { vi, expect } from 'vitest';
import { screen } from '@testing-library/react';
import type { Track, AutomatableParameter, Effect } from '../../types/core';
import { TrackType, AutomationMode } from '../../types/core';

/**
 * Common test utilities for Mixer components
 * This file provides shared mocks, fixtures, and utilities to reduce code duplication
 * across different mixer test files.
 */

// Mock global APIs
export const setupGlobalMocks = () => {
  // Mock AudioContext
  global.AudioContext = vi.fn().mockImplementation(() => ({
    createGain: vi.fn(() => ({
      gain: { value: 1 },
      connect: vi.fn(),
      disconnect: vi.fn(),
    })),
    createAnalyser: vi.fn(() => ({
      fftSize: 2048,
      frequencyBinCount: 1024,
      getByteFrequencyData: vi.fn(),
      connect: vi.fn(),
      disconnect: vi.fn(),
    })),
    destination: {},
    state: 'running',
  }));

  // Mock ResizeObserver
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));

  // Mock window.matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
};

// Common track fixtures
export const createMockTrack = (overrides: Partial<Track> = {}): Track => ({
  id: 'track-1',
  name: 'Test Track',
  type: TrackType.Audio,
  color: '#ff6b6b',
  mute: false,
  solo: false,
  armed: false,
  volume: { value: 0.8, isAutomated: false } as AutomatableParameter,
  pan: { value: 0, isAutomated: false } as AutomatableParameter,
  automation: false,
  automationMode: AutomationMode.Read,
  clips: [],
  effects: [],
  automationLanes: [],
  fx: {
    preset: null,
    effects: [],
    selectedEffectIndex: 0,
  },
  ...overrides,
});

export const createMockTracks = (count: number = 2): Track[] => [
  createMockTrack({
    id: 'track-1',
    name: 'Vocals',
    color: '#ff6b6b',
    pan: { value: 0.1, isAutomated: false } as AutomatableParameter,
    effects: [
      {
        id: 'reverb-1',
        name: 'Hall Reverb',
        type: 'native',
        enabled: true,
        parameters: { wetness: 0.3, roomSize: 0.7 },
      },
    ],
    fx: {
      preset: null,
      effects: [
        {
          id: 'reverb-1',
          name: 'Hall Reverb',
          type: 'native',
          enabled: true,
          parameters: { wetness: 0.3, roomSize: 0.7 },
        },
      ],
      selectedEffectIndex: 0,
    },
  }),
  createMockTrack({
    id: 'track-2',
    name: 'Guitar',
    color: '#4ecdc4',
    mute: true,
    armed: true,
    volume: { value: 0.6, isAutomated: false } as AutomatableParameter,
    pan: { value: -0.2, isAutomated: false } as AutomatableParameter,
    automationMode: AutomationMode.Write,
  }),
  ...Array.from({ length: Math.max(0, count - 2) }, (_, i) => 
    createMockTrack({
      id: `track-${i + 3}`,
      name: `Track ${i + 3}`,
    })
  ),
];

export const createMasterTrack = (): Track => createMockTrack({
  id: 'master',
  name: 'Master',
  color: '#444444',
});

// Common mock contexts
export const createMockMixerContext = (overrides = {}) => ({
  tracks: createMockTracks(),
  masterVolume: 0.8,
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
    master: { left: 0.5, right: 0.6, peak: 0.8 },
    'track-1': { left: 0.3, right: 0.4, peak: 0.5 },
    'track-2': { left: 0.0, right: 0.0, peak: 0.0 },
  },
  isVisible: true,
  setIsVisible: vi.fn(),
  soloedTracks: [],
  muteAllTracks: vi.fn(),
  unmuteAllTracks: vi.fn(),
  resetAllLevels: vi.fn(),
  ...overrides,
});

export const createMockWorkstationContext = (overrides = {}) => {
  const tracks = createMockTracks();
  const masterTrack = createMasterTrack();
  
  return {
    tracks,
    masterTrack,
    updateTrack: vi.fn(),
    removeTrack: vi.fn(),
    duplicateTrack: vi.fn(),
    selection: { tracks: [], clips: [], region: null },
    setSelection: vi.fn(),
    fxChainPresets: [
      {
        id: 'preset-1',
        name: 'Hall Reverb Preset',
        effects: [
          {
            id: 'reverb-preset-1',
            name: 'Hall Reverb',
            type: 'native',
            enabled: true,
            parameters: { wetness: 0.4, roomSize: 0.8 },
          },
        ],
      },
    ],
    setFXChainPresets: vi.fn(),
    setTrack: vi.fn(),
    setTracks: vi.fn(),
    setSelectedTrackId: vi.fn(),
    setAllowMenuAndShortcuts: vi.fn(),
    getTrackCurrentValue: vi.fn((_track: Track, lane?: any) => {
      if (lane) {
        return { value: 0.8, isAutomated: true };
      }
      return { value: 0.8, isAutomated: false };
    }),
    ...overrides,
  };
};

// Common utility functions
export const createTrackWithEffects = (effectCount: number): Track => {
  const effects: Effect[] = Array.from({ length: effectCount }, (_, i) => ({
    id: `effect-${i + 1}`,
    name: `Effect ${i + 1}`,
    type: 'native',
    enabled: true,
    parameters: { param1: 0.5, param2: 0.7 },
  }));

  return createMockTrack({
    effects,
    fx: {
      preset: null,
      effects,
      selectedEffectIndex: 0,
    },
  });
};

export const createManyTracks = (count: number): Track[] => 
  Array.from({ length: count }, (_, i) => createMockTrack({
    id: `track-${i + 1}`,
    name: `Track ${i + 1}`,
    color: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57'][i % 5],
  }));

// Common test helpers
export const waitForMixerToRender = async () => {
  // Wait for any async operations in mixer
  await new Promise(resolve => setTimeout(resolve, 50));
};

export const simulateVolumeChange = async (volumeFader: HTMLElement, value: string) => {
  const event = new Event('change', { bubbles: true });
  Object.defineProperty(event, 'target', {
    writable: false,
    value: { value },
  });
  volumeFader.dispatchEvent(event);
  await waitForMixerToRender();
};

export const simulatePanChange = async (panKnob: HTMLElement, value: string) => {
  const event = new Event('change', { bubbles: true });
  Object.defineProperty(event, 'target', {
    writable: false,
    value: { value },
  });
  panKnob.dispatchEvent(event);
  await waitForMixerToRender();
};

// Mock component factories
export const createMockWidgets = () => ({
  Dialog: ({ children, open, title }: any) => 
    open ? <div data-testid="dialog">{title}{children}</div> : null,
  HueInput: ({ value, onChange }: any) => 
    <input data-testid="hue-input" value={value} onChange={(e) => onChange(Number(e.target.value))} />,
  SelectSpinBox: ({ value, onChange, options }: any) => 
    <select data-testid="select-spinbox" value={value} onChange={(e) => onChange(e.target.value)}>
      {options?.map((opt: any) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
    </select>,
  Knob: ({ value, onChange, title, ...props }: any) => 
    <input data-testid="knob" type="range" value={value} onChange={(e) => onChange(Number(e.target.value))} title={title} {...props} />,
  Meter: ({ percent, ...props }: any) => 
    <div data-testid="meter" aria-valuenow={percent} {...props} />,
  SortableList: ({ children, onSortEnd, onStart, onEnd }: any) => {
    const handleSort = () => {
      if (onSortEnd) onSortEnd();
      if (onEnd) onEnd();
    };
    return <div data-testid="sortable-list" onMouseDown={onStart} onMouseUp={handleSort}>{children}</div>;
  },
  SortableListItem: ({ children, index }: any) => 
    <div data-testid={`sortable-item-${index}`}>{children}</div>,
});

export const createMockComponents = () => ({
  FXComponent: ({ track }: any) => 
    <div data-testid={`fx-component-${track.id}`}>FX for {track.name}</div>,
  TrackVolumeSlider: ({ track, ...props }: any) => 
    <input data-testid={`volume-slider-${track.id}`} type="range" value={track.volume?.value || track.volume || 0} {...props} />,
});

export const createMockUtils = () => ({
  formatPanning: (value: number, _short?: boolean) => {
    if (value === 0) return 'C';
    return value > 0 ? `R${Math.abs(value * 100)}` : `L${Math.abs(value * 100)}`;
  },
  getVolumeGradient: vi.fn(() => '#00ff00'),
  hslToHex: (_h: number, _s: number, _l: number) => '#ff0000',
  volumeToNormalized: (volume: number) => Math.min(1, Math.max(0, volume)),
});

// Test suite generators
export const createBasicRenderingTests = (renderFunction: () => void) => ({
  'should render all track channels': () => {
    renderFunction();
    
    expect(screen.getByTestId('mixer-channel-track-1')).toBeInTheDocument();
    expect(screen.getByTestId('mixer-channel-track-2')).toBeInTheDocument();
  },
  
  'should render master channel': () => {
    renderFunction();
    
    const masterChannel = screen.getByTestId('mixer-master-channel');
    expect(masterChannel).toBeInTheDocument();
  },
  
  'should show track colors': () => {
    renderFunction();
    
    const channel1 = screen.getByTestId('mixer-channel-track-1');
    const channel2 = screen.getByTestId('mixer-channel-track-2');
    
    expect(channel1).toHaveStyle({ borderTop: '2px solid #ff6b6b' });
    expect(channel2).toHaveStyle({ borderTop: '2px solid #4ecdc4' });
  },
});

// Common test assertions
export const assertVolumeControl = (trackId: string, expectedValue: string) => {
  const volumeFader = screen.getByTestId(`mixer-volume-${trackId}`);
  expect(volumeFader).toHaveValue(expectedValue);
};

export const assertPanControl = (trackId: string, expectedValue: string) => {
  const panKnob = screen.getByTestId(`mixer-pan-${trackId}`);
  expect(panKnob).toHaveValue(expectedValue);
};

export const assertButtonState = (buttonId: string, shouldBeActive: boolean) => {
  const button = screen.getByTestId(buttonId);
  if (shouldBeActive) {
    expect(button).toHaveClass('active');
  } else {
    expect(button).not.toHaveClass('active');
  }
};
