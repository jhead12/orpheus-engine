import { vi, expect } from 'vitest';
import { screen } from '@testing-library/react';
import type { Track, AutomatableParameter } from '../../types/core';
import { TrackType, AutomationMode } from '../../types/core';
import { setupGlobalTestMocks } from './global-test-mocks';

/**
 * Shared test utilities for Workstation components
 * This file provides common mocks, fixtures, and utilities used across
 * workstation component tests to maintain consistency and reduce duplication.
 */

// Global test environment setup using centralized mocks
export const setupWorkstationTestEnvironment = () => {
  // Use the centralized global mock setup
  setupGlobalTestMocks();
};

// Common track creation utilities
export const createMockTrack = (overrides: Partial<Track> = {}): Track => ({
  id: 'track-1',
  name: 'Vocals',
  type: TrackType.Audio,
  color: '#ff6b6b',
  mute: false,
  solo: false,
  armed: false,
  volume: { value: 0.8, isAutomated: false } as AutomatableParameter,
  pan: { value: 0, isAutomated: false } as AutomatableParameter,
  clips: [],
  effects: [
    {
      id: 'reverb-1',
      name: 'Hall Reverb',
      type: 'native',
      enabled: true,
      parameters: { wetness: 0.3, roomSize: 0.7 },
    },
  ],
  automationLanes: [],
  automationMode: AutomationMode.Read,
  ...overrides,
});

export const createWorkstationTracks = (count: number = 2): Track[] => [
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
].slice(0, count);

// Context mock generators
export const createMockWorkstationContext = () => ({
  tracks: createWorkstationTracks(),
  selectedTrackId: 'track-1',
  setSelectedTrackId: vi.fn(),
  addTrack: vi.fn(),
  removeTrack: vi.fn(),
  updateTrack: vi.fn(),
  setTrack: vi.fn(),
  duplicateTrack: vi.fn(),
  selection: { tracks: [], clips: [], region: null },
  setSelection: vi.fn(),
  zoom: 1,
  setZoom: vi.fn(),
  transportState: {
    isPlaying: false,
    isRecording: false,
    position: 0,
    tempo: 120,
  },
  setTransportState: vi.fn(),
});

export const createMockMixerContext = () => ({
  tracks: createWorkstationTracks(),
  masterVolume: 0.8,
  masterMute: false,
  meters: {
    'track-1': { left: 0.5, right: 0.6, peak: 0.8 },
    'track-2': { left: 0.3, right: 0.4, peak: 0.6 },
  },
  soloedTracks: [] as string[],
  setTrackVolume: vi.fn(),
  setTrackPan: vi.fn(),
  setTrackMute: vi.fn(),
  setTrackSolo: vi.fn(),
  setTrackArmed: vi.fn(),
  setMasterVolume: vi.fn(),
  setMasterMute: vi.fn(),
  addEffect: vi.fn(),
  removeEffect: vi.fn(),
  updateEffect: vi.fn(),
  reorderEffects: vi.fn(),
  isVisible: true,
  setIsVisible: vi.fn(),
  muteAllTracks: vi.fn(),
  unmuteAllTracks: vi.fn(),
  resetAllLevels: vi.fn(),
  getTrackCurrentValue: vi.fn((_track: Track, lane?: any) => {
    if (lane?.parameter === 'volume') return 0.8;
    if (lane?.parameter === 'pan') return 0;
    return 0;
  }),
});

// Mock widget components
export const createMockWidgets = () => ({
  Dialog: ({ children, open, title }: any) => 
    open ? <div data-testid="dialog"><div data-testid="dialog-title">{title}</div>{children}</div> : null,
  HueInput: ({ value, onChange }: any) => 
    <input data-testid="hue-input" value={value} onChange={(e) => onChange(Number(e.target.value))} />,
  SelectSpinBox: ({ value, onChange, options, title }: any) => 
    <select data-testid="select-spinbox" value={value} onChange={(e) => onChange(e.target.value)} title={title}>
      {options?.map((opt: any) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
    </select>,
  Knob: ({ value, onChange, title, ...props }: any) => 
    <input data-testid="knob" type="range" value={value} onChange={(e) => onChange(Number(e.target.value))} title={title} {...props} />,
  Meter: ({ percent, ...props }: any) =>
    <div data-testid="meter" aria-valuenow={percent} {...props} />,
});

// Mock component generators
export const createMockSortableComponents = () => ({
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

export const createMockFXComponents = () => ({
  FXComponent: ({ track }: any) => 
    <div data-testid={`fx-component-${track.id}`}>FX Component for {track.name}</div>,
  TrackVolumeSlider: ({ track, ...props }: any) => 
    <input data-testid={`volume-slider-${track.id}`} type="range" value={track.volume?.value || track.volume || 0} {...props} />,
});

// Utility function mocks
export const createMockWorkstationUtils = () => ({
  formatPanning: (value: number, _short?: boolean) => {
    if (value === 0) return 'C';
    return value > 0 ? `R${Math.abs(value * 100)}` : `L${Math.abs(value * 100)}`;
  },
  getVolumeGradient: vi.fn(() => '#00ff00'),
  hslToHex: (_h: number, _s: number, _l: number) => '#ff0000',
  normalizedToVolume: (normalized: number) => Math.round(normalized * 100),
  volumeToNormalized: (volume: number) => Math.min(1, Math.max(0, volume)),
});

// Performance testing utilities
export const createManyTracks = (count: number): Track[] =>
  Array.from({ length: count }, (_, i) => createMockTrack({
    id: `track-${i + 1}`,
    name: `Track ${i + 1}`,
    color: `hsl(${(i * 360) / count}, 70%, 60%)`,
  }));

// Test assertion helpers
export const assertTrackRenders = (trackId: string) => {
  expect(screen.getByTestId(`mixer-channel-${trackId}`)).toBeInTheDocument();
};

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

// Test suite generators for common test patterns
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

// Common test cleanup
export const cleanupWorkstationTest = () => {
  vi.clearAllMocks();
  vi.restoreAllMocks();
};
