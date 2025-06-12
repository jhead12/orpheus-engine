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
  // Add fx property with selectedEffectIndex and effects
  fx: {
    selectedEffectIndex: 0,
    effects: [
      {
        id: 'reverb-1',
        name: 'Hall Reverb',
        type: 'native',
        enabled: true,
        parameters: { wetness: 0.3, roomSize: 0.7 },
      }
    ],
    preset: null,
  },
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
    fx: {
      selectedEffectIndex: 0,
      effects: [
        {
          id: 'reverb-track-1',
          name: 'Hall Reverb',
          type: 'native',
          enabled: true,
          parameters: { wetness: 0.3, roomSize: 0.7 },
        }
      ],
      preset: null,
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
    fx: {
      selectedEffectIndex: 0,
      effects: [
        {
          id: 'reverb-track-2',
          name: 'Hall Reverb',
          type: 'native',
          enabled: true,
          parameters: { wetness: 0.3, roomSize: 0.7 },
        },
        {
          id: 'compressor-track-2',
          name: 'Compressor',
          type: 'native',
          enabled: true,
          parameters: { threshold: 0.8, ratio: 4, attack: 0.01, release: 0.1 },
        }
      ],
      preset: null,
    },
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
  setTracks: vi.fn(),
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
  // Add required properties for FXComponent
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
          parameters: { wetness: 0.3, roomSize: 0.7 },
        }
      ]
    }
  ],
  setFXChainPresets: vi.fn(),
  masterTrack: {
    id: 'master',
    name: 'Master',
    type: 'audio',
    color: '#ffffff',
    volume: { value: 1.0, isAutomated: false },
    pan: { value: 0, isAutomated: false },
    mute: false,
    fx: {
      selectedEffectIndex: 0,
      effects: [],
      preset: null
    }
  },
  // For automation lanes, volume/pan handling
  getTrackCurrentValue: vi.fn((track: any, lane?: any) => {
    if (lane) {
      // For automation lanes, return the lane's value
      return { value: lane.nodes?.[0]?.value || 0, isAutomated: true };
    }
    // For track properties (volume/pan), return track values
    return { value: track.pan?.value || track.pan || 0, isAutomated: false };
  }),
  // UI controls - required by Mixer component
  setAllowMenuAndShortcuts: vi.fn(),
});

export const createMockMixerContext = () => ({
  tracks: createWorkstationTracks(),
  masterVolume: 0.8,
  masterMute: false,
  masterPan: 0,
  mixerHeight: 400,
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
  setMasterPan: vi.fn(),
  setMixerHeight: vi.fn(),
  addEffect: vi.fn(),
  removeEffect: vi.fn(),
  updateEffect: vi.fn(),
  reorderEffects: vi.fn(),
  isVisible: true,
  setIsVisible: vi.fn(),
  muteAllTracks: vi.fn(),
  unmuteAllTracks: vi.fn(),
  resetAllLevels: vi.fn(),
  getTrackCurrentValue: vi.fn((track: Track, lane?: any) => {
    if (lane) {
      // For automation lanes, return the lane's value
      return { value: lane.nodes?.[0]?.value || 0, isAutomated: true };
    }
    // For track properties without automation, return track values
    // Default to track.pan if no specific handling needed
    return track.pan || { value: 0, isAutomated: false };
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
  Knob: ({ value, onChange, title, 'data-testid': testId, ...props }: any) => 
    <input 
      data-testid={testId || "knob"} 
      type="range" 
      min="-100" 
      max="100" 
      value={value || 0} 
      onChange={(e) => onChange ? onChange(Number(e.target.value)) : undefined} 
      title={title} 
      {...props} 
    />,
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

export const createMockComponents = () => ({
  ...createMockSortableComponents(),
  EffectDropdown: ({ trackId, onAdd }: any) => (
    <div data-testid={`mixer-add-effect-track-${trackId}`}>
      <button onClick={() => onAdd && onAdd('compressor')}>Add Effect</button>
      <div style={{ display: 'none' }}>
        <div onClick={() => onAdd && onAdd('compressor')}>Compressor</div>
        <div onClick={() => onAdd && onAdd('reverb')}>Reverb</div>
      </div>
    </div>
  ),
  EffectButton: ({ effect, trackId, onBypass, onClick }: any) => (
    <div>
      <div data-testid={`effect-${effect.name.toLowerCase()}-${trackId}`} onClick={onClick}>
        {effect.name}
      </div>
      <button 
        data-testid={`effect-bypass-${effect.name.toLowerCase()}-${trackId}`}
        onClick={() => onBypass && onBypass(!effect.enabled)}
      >
        {effect.enabled ? 'Bypass' : 'Enable'}
      </button>
    </div>
  ),
  EffectEditor: ({ effect, trackId }: any) => (
    <div data-testid={`effect-editor-${effect.name.toLowerCase()}-${trackId}`}>
      <h3>{effect.name} Editor</h3>
      <div>Effect parameters here</div>
    </div>
  ),
  AnnouncementRegion: () => (
    <div data-testid="mixer-announcement" aria-live="polite" style={{ position: 'absolute', left: '-9999px' }} />
  ),
  PeakIndicator: ({ trackId, peak }: any) => (
    <div data-testid={`mixer-peak-track-${trackId}`} aria-label={`Peak: ${peak}`} data-peak={peak} />
  ),
  ClippingIndicator: ({ trackId, isClipping }: any) => (
    <div data-testid={`mixer-clipping-track-${trackId}`} className={isClipping ? 'clipping' : ''} />
  ),
});

export const createMockFXComponents = () => ({
  FXComponent: ({ track }: any) => {
    // Ensure track and fx exist to prevent "Cannot read properties of undefined" errors
    if (!track || !track.fx) {
      return <div data-testid={`fx-component-${track?.id || 'unknown'}`}>FX Component (No FX data)</div>;
    }
    // Access fx properties safely with default values
    const effectIndex = track.fx.selectedEffectIndex || 0;
    const effect = track.fx.effects?.[effectIndex] || { name: 'No Effect' };
    
    return (
      <div data-testid={`fx-component-${track.id}`}>
        FX Component for {track.name} - Effect: {effect.name}
      </div>
    );
  },
  TrackVolumeSlider: ({ track, 'data-testid': dataTestId, ...props }: any) => {
    const testId = dataTestId || `volume-slider-${track.id}`;
    return (
      <input 
        data-testid={testId}
        type="range" 
        min="0" 
        max="1000" 
        step="1"
        value={Math.round((track.volume?.value || track.volume || 0) * 1000)}
        onChange={(e) => {
          // Simulate the actual component's behavior
          const value = parseInt(e.target.value) / 1000;
          if (props.onChange) {
            props.onChange(null, value);
          }
        }}
        {...props} 
      />
    );
  },
  // Add pan knob mock
  Knob: ({ value, onChange, 'data-testid': dataTestId, ...props }: any) => (
    <input 
      data-testid={dataTestId}
      type="range" 
      min="-100" 
      max="100" 
      step="1"
      value={value || 0}
      onChange={(e) => {
        const newValue = parseFloat(e.target.value) / 100;
        if (onChange) {
          onChange(newValue);
        }
      }}
      {...props} 
    />
  ),
  // Add Meter mock with peak indicators
  Meter: ({ 'data-testid': dataTestId }: any) => (
    <div data-testid={dataTestId} style={{ width: '100%', height: '100%' }}>
      {/* Main meter */}
      <div style={{ width: '100%', height: '100%', position: 'relative', display: 'flex', flexDirection: 'row', justifyContent: 'flex-start' }}>
        <div style={{ width: '100%', height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'row', justifyContent: 'flex-start' }}>
          <div style={{ width: '100%', height: '100%', flexShrink: 0 }} />
        </div>
      </div>
    </div>
  ),
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
    // Each track needs consistent fx properties
    fx: {
      selectedEffectIndex: 0,
      effects: [
        {
          id: `effect-${i + 1}`,
          name: `Effect ${i + 1}`,
          type: 'native',
          enabled: true,
          parameters: { param1: 0.5, param2: 0.5 },
        }
      ],
      preset: null,
    },
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

// Alias exports for compatibility with existing tests
export { createWorkstationTracks as createMockTracks };
export { createMockWorkstationUtils as createMockUtils };

// Common test cleanup
export const cleanupWorkstationTest = () => {
  vi.clearAllMocks();
  vi.restoreAllMocks();
};
