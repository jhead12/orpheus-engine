// Type definitions for component props
import { CSSProperties } from "react";
import { Track, Clip } from "./core";

// Base clip component props
export interface BaseClipComponentProps {
  clip: Clip;
  height: number;
  onChangeLane: (clip: Clip, track: Track) => void;
  onSetClip: (clip: Clip) => void;
  track: Track;
}

// DNR (Drag and Resize) Types
export interface Coords {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

export interface DNRData {
  coords: Coords;
  delta: {
    x: number;
    y: number;
  };
}

export interface ResizeEdge {
  x?: "left" | "right";
  y?: "top" | "bottom";
}

export interface ResizeDNRData extends DNRData {
  edge: ResizeEdge;
  width: number;
  height: number;
}

export interface Edges<T> {
  top?: T;
  right?: T;
  bottom?: T;
  left?: T;
}

// Lane Component Types
export interface LaneComponentProps {
  className?: string;
  dragDataTarget: { track: Track | null; incompatible?: boolean } | null;
  style?: CSSProperties;
  track: Track;
  onClipContextMenu?: (e: React.MouseEvent, clip: Clip) => void;
}

// FX Component Types
export interface FXElements<T> {
  add?: { button?: T; icon?: T };
  bottom?: T;
  container?: T;
  effect?: { actionsContainer?: T; container?: T; text?: T };
  enableIcon?: T;
  icon?: T;
  next?: { button?: T; icon?: T };
  preset?: { container?: T; text?: T; optionsList?: T };
  presetButtons?: T;
  presetNameFormButtons?: T;
  prev?: { button?: T; icon?: T };
  removeIcon?: T;
  spinButtons?: T;
  text?: T;
  toggle?: { button?: T; icon?: T };
  top?: T;
}

// Knob Component Types
export interface KnobScale {
  toNormalized: (value: number) => number;
  toScale: (value: number) => number;
}

export interface MeterStyle {
  backgroundColor?: string;
  borderColor?: string;
  color?: string;
  overflow?: string;
}

export interface KnobStyle {
  knob?: CSSProperties;
  indicator?: CSSProperties;
  meter?: MeterStyle;
}

export interface KnobProps {
  classes?: {
    knob?: string;
    indicator?: string;
    meter?: string;
  };
  disabled?: boolean;
  max?: number;
  min?: number;
  onChange?: (value: number) => void;
  origin?: number;
  scale?: KnobScale;
  showMeter?: boolean;
  size?: number;
  style?: KnobStyle;
  title?: string;
  value?: number;
}

// Editor Drag Types
export interface EditorDragData {
  id: string;
  type: string;
  data: any;
}

// Track Volume Slider Types
export interface TrackVolumeSliderProps {
  automation?: boolean;
  classes?: {
    container?: string;
    slider?: string;
  };
  disabled?: boolean;
  onChangeValue?: (value: number) => void;
  style?: {
    container?: CSSProperties;
    slider?: CSSProperties;
  };
  value?: number;
}
