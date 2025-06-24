/**
 * Mixer Test Types
 * Type definitions for use in mixer component tests
 */

import React from 'react';

// Widget component props interfaces
export interface SelectSpinBoxProps {
  title?: string;
  label?: string;
  value?: string | number;
  options?: Array<{ value: string | number; label: string }>;
  'data-testid'?: string;
  onChange?: (value: string | number) => void;
  [key: string]: any;
}

export interface KnobProps {
  value?: number;
  onChange?: (value: number) => void;
  onDoubleClick?: (event: React.MouseEvent) => void;
  disabled?: boolean;
  title?: string;
  'data-testid'?: string;
  [key: string]: any;
}

export interface MeterProps {
  value?: number;
  peak?: number;
  'data-testid'?: string;
  [key: string]: any;
}

export interface SortableListProps {
  children?: React.ReactNode;
  'data-testid'?: string;
  [key: string]: any;
}

export interface SortableListItemProps {
  children?: React.ReactNode;
  'data-testid'?: string;
  index?: number;
  [key: string]: any;
}

export interface TrackIconProps {
  type?: string;
  color?: string;
}

export interface TrackVolumeSliderProps {
  track?: any;
  onVolumeChange?: (value: number) => void;
  'data-testid'?: string;
}

export interface DialogProps {
  children?: React.ReactNode;
  [key: string]: any;
}

export interface HueInputProps {
  onChange?: (value: string) => void;
  value?: string;
}

// Test helper utility types
export interface MockTrack {
  id: string;
  name: string;
  type: string;
  mute: boolean;
  solo: boolean;
  armed: boolean;
  volume: { value: number; isAutomated: boolean };
  pan: { value: number; isAutomated: boolean };
  automation: boolean;
  automationMode: string;
  automationLanes: Array<{
    id: string;
    label: string;
    envelope: string;
    enabled: boolean;
    minValue: number;
    maxValue: number;
    nodes: Array<unknown>;
    show: boolean;
    expanded: boolean;
  }>;
  clips: Array<unknown>;
  color: string;
  height: number;
  collapsed: boolean;
  selected: boolean;
  effects: Array<unknown>;
  fx: {
    preset: null | unknown;
    effects: Array<unknown>;
    selectedEffectIndex: number;
  };
  inputs: Array<unknown>;
  outputs: Array<unknown>;
}
