import { vi, expect } from 'vitest';
import { screen } from '@testing-library/react';
import type { Track, AutomatableParameter } from '../../types/core';
import { TrackType, AutomationMode } from '../../types/core';
import { setupGlobalTestMocks } from './global-test-mocks';
import React, { ReactNode } from 'react';

// Custom type for automation nodes
interface AutomationNode {
  value: number;
  time: number;
}

// Custom type for automation lanes
interface AutomationLane {
  nodes: AutomationNode[];
  parameter: string;
  [key: string]: unknown;
}

// Common interfaces for mock components
interface DialogProps {
  children?: ReactNode;
  open?: boolean;
  title?: string;
  'data-testid'?: string;
  onClose?: () => void;
}

interface HueInputProps {
  value: number;
  onChange: (value: number) => void;
}

interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectSpinBoxProps {
  value: string | number;
  onChange: (value: string | number) => void;
  options?: SelectOption[];
  title?: string;
}

interface SortableListProps {
  children?: ReactNode;
  onSortEnd?: (oldIndex: number, newIndex: number) => void;
  onStart?: () => void;
  onEnd?: () => void;
}

interface SortableListItemProps {
  children?: ReactNode;
  index: number;
}

// Exported to make it available for other test files
export interface TrackLaneProps {
  track: Track;
  lane?: Record<string, unknown>;
}

/**
 * Shared test utilities for Workstation components
 * This file provides common mocks, fixtures, and utilities used across
 * workstation component tests to maintain consistency and reduce duplication.
 */

// Global test environment setup using centralized mocks
export const setupWorkstationTestEnvironment = () => {
  setupGlobalTestMocks();
};

// Common test track setup
export const createMockTrack = (overrides: Partial<Track> = {}): Track => ({
  id: 'track-1',
  name: 'Test Track',
  type: TrackType.Audio,
  gain: 0.5,
  volume: 1,
  pan: 0,
  solo: false,
  mute: false,
  record: false,
  color: '#ff0000',
  fx: {
    selectedEffectIndex: 0,
    effects: []
  },
  meters: {
    left: 0,
    right: 0,
    peak: 0,
    clipping: false,
  },
  automation: {
    mode: AutomationMode.Read,
    parameters: {},
  },
  ...overrides
});

interface PeakIndicatorProps {
  trackId: string;
  peak: number;
}

interface ClippingIndicatorProps {
  trackId: string;
  isClipping: boolean;
}

interface FXComponentProps {
  track: Track;
}

interface TrackVolumeSliderProps {
  track: Track & { volume?: { value: number } | number };
  'data-testid'?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement> | null, value: number) => void;
  [key: string]: unknown;
}

interface KnobComponentProps {
  value?: number;
  onChange?: (value: number) => void;
  'data-testid'?: string;
  [key: string]: unknown;
}

interface MeterComponentProps {
  'data-testid'?: string;
  percent: number;
  [key: string]: unknown;
}

// Create a mocked context for workstation
export const createMockMixerContext = () => ({
  tracks: [createMockTrack()],
  selectedTrackId: null,
  setSelectedTrackId: vi.fn(),
  updateTrack: vi.fn(),
  updateTrackProperty: vi.fn(),
  updateAutomation: vi.fn(),
  createTrack: vi.fn(),
  removeTrack: vi.fn(),
  moveTrack: vi.fn(),
  getTrackById: vi.fn((id: string) => createMockTrack({ id })),
});

// Create mocked timeline context
export const createMockTimelineContext = () => ({
  currentTime: 0,
  duration: 120,
  playing: false,
  recording: false,
  setCurrentTime: vi.fn(),
  setPlaying: vi.fn(),
  setRecording: vi.fn(),
  zoom: 1,
  setZoom: vi.fn(),
  verticalZoom: 1,
  setVerticalZoom: vi.fn(),
  loopStart: 0,
  loopEnd: 30,
  loopEnabled: false,
  setLoopStart: vi.fn(),
  setLoopEnd: vi.fn(),
  setLoopEnabled: vi.fn(),
  timelineRef: { current: null },
  snapToGrid: true,
  setSnapToGrid: vi.fn(),
  gridSize: 4,
  setGridSize: vi.fn(),
});

// Mocked UI context for consistent testing
export const createMockUIContext = () => ({
  darkMode: false,
  setDarkMode: vi.fn(),
  theme: { colors: { primary: '#0077cc', background: '#ffffff' } },
  menuOpen: false,
  setMenuOpen: vi.fn(),
  fullScreen: false,
  setFullScreen: vi.fn(),
  controlPanelVisible: true,
  setControlPanelVisible: vi.fn(),
});

// Create mock drag and drop utilities
export const createMockDragDrop = () => ({
  isDragging: false,
  setIsDragging: vi.fn(),
  draggedItem: null,
  setDraggedItem: vi.fn(),
  dropTarget: null,
  setDropTarget: vi.fn(),
  handleDragStart: vi.fn(),
  handleDragEnd: vi.fn(),
  handleDrop: vi.fn(),
  dragRef: { current: null },
});

// Mock mixer components for testing
export const createMockMixerComponents = () => ({
  TrackHeader: ({ track }: { track: Track }) => (
    <div data-testid={`mixer-track-header-${track.id}`}>
      <span data-testid={`mixer-track-name-${track.id}`}>{track.name}</span>
    </div>
  ),
  TrackControls: ({ track }: { track: Track }) => (
    <div data-testid={`mixer-track-controls-${track.id}`}>
      <button data-testid={`mixer-track-mute-${track.id}`} aria-pressed={track.mute}>Mute</button>
      <button data-testid={`mixer-track-solo-${track.id}`} aria-pressed={track.solo}>Solo</button>
    </div>
  ),
  AnnouncementRegion: () => (
    <div data-testid="mixer-announcement" aria-live="polite" style={{ position: 'absolute', left: '-9999px' }} />
  ),
  PeakIndicator: ({ trackId, peak }: PeakIndicatorProps) => (
    <div data-testid={`mixer-peak-track-${trackId}`} aria-label={`Peak: ${peak}`} data-peak={peak} />
  ),
  ClippingIndicator: ({ trackId, isClipping }: ClippingIndicatorProps) => (
    <div data-testid={`mixer-clipping-track-${trackId}`} className={isClipping ? 'clipping' : ''} />
  ),
});

export const createMockFXComponents = () => ({
  FXComponent: ({ track }: FXComponentProps) => {
    // Ensure track and fx exist to prevent "Cannot read properties of undefined" errors
    if (!track || !track.fx) {
      return <div data-testid={`fx-component-${track?.id || 'unknown'}`}>FX Component (No FX data)</div>;
    }
    // Access fx properties safely with default values
    const effectIndex = track.fx.selectedEffectIndex || 0;
    const effect = track.fx.effects?.[effectIndex] || { name: 'No Effect' };
    
    return (
      <div data-testid={`fx-component-${track.id}`}>
        <div data-testid={`fx-effect-name-${track.id}`}>{effect.name}</div>
        <div data-testid={`fx-effect-index-${track.id}`}>{effectIndex}</div>
      </div>
    );
  }
});

// UI Component mocks
export const createMockUIComponents = () => ({
  TrackVolumeSlider: ({ track, 'data-testid': testId, onChange, ...props }: TrackVolumeSliderProps) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseInt(e.target.value) / 1000;
      if (onChange) {
        onChange(null, value);
      }
    };
    
    return (
      <input 
        data-testid={testId}
        type="range" 
        min="0" 
        max="1000" 
        step="1"
        value={Math.round(((typeof track.volume === 'number' ? track.volume : track.volume?.value) || 0) * 1000)}
        onChange={handleChange}
        {...props} 
      />
    );
  },
  // Add pan knob mock
  Knob: ({ value, onChange, 'data-testid': dataTestId, ...props }: KnobComponentProps) => (
    <input 
      data-testid={dataTestId || "knob"} 
      type="range" 
      min="-100" 
      max="100" 
      value={value || 0} 
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange ? onChange(Number(e.target.value)) : undefined} 
      {...props} 
    />
  ),
  // Add meter mock
  Meter: ({ percent, ...props }: MeterComponentProps) => (
    <div data-testid="meter" aria-valuenow={percent} {...props} />
  ),
  Dialog: ({ children, open, title }: DialogProps) => 
    open ? <div data-testid="dialog"><div data-testid="dialog-title">{title}</div>{children}</div> : null,
  HueInput: ({ value, onChange }: HueInputProps) => 
    <input data-testid="hue-input" value={value} onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(Number(e.target.value))} />,
  SelectSpinBox: ({ value, onChange, options, title }: SelectSpinBoxProps) => 
    <select data-testid="select-spinbox" value={value} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onChange(e.target.value)} title={title}>
      {options?.map((opt: SelectOption) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
    </select>,
});

// Mock component generators
export const createMockSortableComponents = () => ({
  SortableList: ({ children, onSortEnd, onStart, onEnd }: SortableListProps) => {
    // This function mocks the functionality of SortableList
    const handleSort = () => {
      if (onSortEnd) onSortEnd(1, 2);
    };
    
    // Call the provided lifecycle methods for testing
    React.useEffect(() => {
      if (onStart) onStart();
      return () => {
        if (onEnd) onEnd();
      };
    }, [onStart, onEnd]);
    
    return (
      <div data-testid="sortable-list" onClick={handleSort}>
        {children}
      </div>
    );
  },
  SortableListItem: ({ children, index }: SortableListItemProps) => (
    <div data-testid={`sortable-item-${index}`} data-index={index}>
      {children}
    </div>
  ),
});

// Utility function mocks
export const createMockWorkstationUtils = () => ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  formatPanning: (value: number, _short?: boolean) => {
    if (value === 0) return 'C';
    return value > 0 ? `R${Math.abs(value * 100)}` : `L${Math.abs(value * 100)}`;
  },
  getVolumeGradient: vi.fn(() => '#00ff00'),
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  hslToHex: (_h: number, _s: number, _l: number) => '#ff0000',
  normalizedToVolume: (normalized: number) => Math.round(normalized * 100),
  volumeToNormalized: (volume: number) => Math.min(1, Math.max(0, volume)),
});

// Performance testing utilities
export const createManyTracks = (count: number): Track[] =>
  Array.from({ length: count }, (_, i) => createMockTrack({
    id: `track-${i + 1}`,
    name: `Track ${i + 1}`,
  }));

// Create an automation lane for testing
export const createMockAutomationLane = (parameter: AutomatableParameter): AutomationLane => ({
  nodes: [
    { time: 0, value: 0.5 },
    { time: 10, value: 0.75 },
    { time: 20, value: 0.25 },
  ],
  parameter,
  [parameter]: true,
});

// Helper to render and return mocked workstation elements
export const renderMockWorkstation = () => {
  const tracks = [createMockTrack({ id: 'track-1' }), createMockTrack({ id: 'track-2' })];
  
  return {
    tracks,
    mixerContext: createMockMixerContext(),
    timelineContext: createMockTimelineContext(),
    uiContext: createMockUIContext(),
    mockComponents: {
      ...createMockMixerComponents(),
      ...createMockUIComponents(),
      ...createMockFXComponents(),
      ...createMockSortableComponents(),
    },
    mockUtils: createMockWorkstationUtils(),
  };
};
