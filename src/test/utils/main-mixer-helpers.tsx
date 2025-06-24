/**
 * Main Mixer Test Helpers
 * Helper functions and mock data for MainMixer tests
 */

import { vi } from 'vitest';
import * as React from 'react';
import { TrackType, AutomationMode } from './main-mixer-setup';

// Define interfaces for component props
interface DialogProps {
  children?: React.ReactNode;
  [key: string]: any;
}

interface SelectSpinBoxProps {
  title?: string;
  label?: string;
  value?: string | number;
  options?: Array<{ value: string | number; label: string }>;
  'data-testid'?: string;
  onChange?: (value: any) => void;
  [key: string]: any;
}

interface KnobProps {
  value?: number;
  onChange?: (value: number) => void;
  onDoubleClick?: (event: React.MouseEvent) => void;
  disabled?: boolean;
  title?: string;
  'data-testid'?: string;
  [key: string]: any;
}

interface MeterProps {
  value?: number;
  peak?: number;
  'data-testid'?: string;
  [key: string]: any;
}

interface SortableListProps {
  children?: React.ReactNode;
  'data-testid'?: string;
  [key: string]: any;
}

interface SortableListItemProps {
  children?: React.ReactNode;
  'data-testid'?: string;
  index?: number;
  [key: string]: any;
}

interface TrackProps {
  id?: string;
  name?: string;
  volume?: { value: number };
  [key: string]: any;
}

interface TrackVolumeSliderProps {
  track?: TrackProps;
  onVolumeChange?: (value: number) => void;
  'data-testid'?: string;
}

interface TrackIconProps {
  type: string;
  color: string;
}

// Helper to create automatable parameter
export const createAutomatableParam = (initialValue = 0) => ({
  value: initialValue,
  isAutomated: false,
  getValue: () => initialValue,
  setValue: vi.fn(),
  automate: vi.fn(),
});

// Create mock tracks with proper parameter types
export const createMockTracks = () => [
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

export const createMockMasterTrack = () => ({
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
});

// Mock widgets for testing
export const createMockWidgets = () => ({
  // Dialog mock
  Dialog: ({ children, ...rest }) => <div {...rest}>{children}</div>,

  // SelectSpinBox mock
  SelectSpinBox: ({
    title,
    label,
    value,
    options,
    'data-testid': testId,
    onChange,
    ...rest
  }) => (
    <select
      data-testid={testId || 'select-spinbox'}
      title={title}
      value={value}
      onChange={(e) => onChange && onChange(e.target.value)}
      {...rest}
    >
      {options &&
        options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
    </select>
  ),

  // Knob mock
  Knob: ({
    value,
    onChange,
    onDoubleClick,
    disabled,
    title,
    'data-testid': testId,
    ...rest
  }) => (
    <div
      data-testid={testId || 'knob'}
      title={title || `Pan: ${value || 0}`}
      className={disabled ? 'disabled' : ''}
      onDoubleClick={onDoubleClick}
      {...rest}
    >
      <input
        type="range"
        min="-1"
        max="1"
        step="0.01"
        value={value || 0}
        disabled={disabled}
        onChange={(e) => {
          const newValue = parseFloat(e.target.value);
          if (!isNaN(newValue) && onChange) {
            onChange(newValue);
          }
        }}
        data-testid={`${testId || 'knob'}-input`}
      />
    </div>
  ),

  // Meter mock
  Meter: ({ value, peak, 'data-testid': testId, ...rest }) => (
    <div data-testid={testId || 'meter'} className="meter-component" {...rest}>
      <div className="meter-value">{value || 0}</div>
      <div className="peak-display">{peak || '-∞'}</div>
    </div>
  ),

  // SortableList mocks
  SortableList: ({ children, 'data-testid': testId, ...rest }) => (
    <div
      data-testid={testId || 'sortable-list'}
      className="sortable-list"
      {...rest}
    >
      {children}
    </div>
  ),

  SortableListItem: ({ children, 'data-testid': testId, index, ...rest }) => (
    <div
      data-testid={testId || `sortable-item-${index}`}
      data-index={index}
      className="sortable-item"
      {...rest}
    >
      {children}
    </div>
  ),
});

// Mock components for testing
export const createMockComponents = () => ({
  // Mock TrackVolumeSlider
  TrackVolumeSlider: ({ track, onVolumeChange, 'data-testid': testId }) => (
    <div
      className="track-volume-slider"
      data-testid={testId || `mixer-volume-${track?.id || 'unknown'}`}
      aria-label={`${track?.name || 'Track'} volume`}
    >
      <input
        type="range"
        min="0"
        max="100"
        value={track?.volume?.value ? track.volume.value * 100 : 80}
        onChange={(e) =>
          onVolumeChange && onVolumeChange(parseInt(e.target.value, 10) / 100)
        }
        data-testid={`volume-slider-${track?.id || 'unknown'}`}
      />
      <div
        className="volume-display"
        data-testid={`mixer-volume-display-track-${track?.id || 'unknown'}`}
      >
        {Math.round((track?.volume?.value || 0.8) * 100)}%
      </div>
    </div>
  ),

  // Mock FXComponent
  FXComponent: vi
    .fn()
    .mockImplementation(({ track, 'data-testid': testId }) => {
      return (
        <div
          data-testid={
            testId || `mixer-effects-track-${track?.id || 'unknown'}`
          }
        >
          <div>Mock FX Component</div>
          {track?.fx?.preset?.name && track.fx.preset.name}
        </div>
      );
    }),
});

// Mock utils for testing
export const createMockUtils = () => ({
  getAudioLevel: vi.fn().mockReturnValue(0.5),
  getTrackLabel: vi.fn((track) => track?.name || 'Unknown Track'),
  getPanValue: vi.fn().mockReturnValue('C'),
  formatPanValue: vi.fn().mockImplementation((value) => {
    if (value === 0) return 'C';
    const side = value < 0 ? 'L' : 'R';
    const percent = Math.abs(Math.round(value * 100));
    return `${side}${percent}`;
  }),
});
