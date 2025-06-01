export enum AudioAnalysisType {
  Spectral = "spectral",
  Waveform = "waveform",
  Features = "features"
}

export interface TimeSignature {
  beats: number;
  noteValue: number;
}

export interface TimelineSettings {
  horizontalScale: number;
  timeSignature: {
    beats: number;
    noteValue: number;
  };
  tempo: number;
}

export interface TimelineSpan {
  measures: number;
  beats: number;
  fraction: number;
}

export interface DirectionalTimelineSpan extends TimelineSpan {
  sign: number;
}

export enum AutomationLaneEnvelope {
  Volume = "volume",
  Pan = "pan",
  Tempo = "tempo"
}

export class TimelinePosition {
  bar: number;
  beat: number;
  sixteenth: number;
  static start: TimelinePosition = new TimelinePosition();
  
  static max(a: TimelinePosition, b: TimelinePosition): TimelinePosition {
    return a.toMargin() > b.toMargin() ? a : b;
  }
  
  static min(a: TimelinePosition, b: TimelinePosition): TimelinePosition {
    return a.toMargin() < b.toMargin() ? a : b;
  }
  
  static fromMargin(_margin: number): TimelinePosition {
    // Implementation would depend on how margins relate to timeline positions
    return new TimelinePosition();
  }
  
  static fromSixteenths(_sixteenths: number): TimelinePosition {
    // Convert sixteenths to bar/beat/sixteenth position
    return new TimelinePosition();
  }
  
  static fromSpan(_span: number): TimelinePosition {
    // Convert span to TimelinePosition
    return new TimelinePosition();
  }
  
  static measureMargin(_width: number): { measures: number; beats: number; fraction: number } {
    // Implementation would calculate measures, beats, fraction from width
    return { measures: 0, beats: 0, fraction: 0 };
  }
  
  static fractionToSpan(_fraction: number): number {
    // Convert fraction to span
    return 0;
  }
  
  static durationToSpan(_duration: number): number {
    // Convert duration to span
    return 0;
  }
  
  constructor(bar?: number, beat?: number, sixteenth?: number) {
    this.bar = bar || 0;
    this.beat = beat || 0;
    this.sixteenth = sixteenth || 0;
  }
  
  copy(): TimelinePosition {
    return new TimelinePosition(this.bar, this.beat, this.sixteenth);
  }
  
  snap(_snapSize: number, _direction?: string): TimelinePosition {
    // Now accepts only one argument (snapSize) with an optional direction
    return this; 
  }
  
  toMargin(): number {
    return 0; // Implementation would depend on how positions relate to margins
  }
  
  compareTo(_other: TimelinePosition): number {
    // Implementation to compare positions
    return 0;
  }
  
  equals(_other: TimelinePosition): boolean {
    // Implementation to check equality
    return false;
  }
  
  translate(_delta: { measures: number; beats: number; fraction: number; sign?: number }, _round?: boolean): TimelinePosition {
    // Implementation to translate position by delta
    return this;
  }
  
  diff(_other: TimelinePosition): { measures: number; beats: number; fraction: number; sign: number } {
    // Implementation to calculate difference between positions
    return { measures: 0, beats: 0, fraction: 0, sign: 0 };
  }
  
  toSixteenths(): number {
    // Implementation to convert to sixteenths
    return 0;
  }
}

// Define the WindowAutoScrollThresholds interface
export interface WindowAutoScrollThresholds {
  top: {
    slow: number;
    medium: number;
    fast: number;
  };
  right: {
    slow: number;
    medium: number;
    fast: number;
  };
  bottom?: {
    slow: number;
    medium: number;
    fast: number;
  };
  left?: {
    slow: number;
    medium: number;
    fast: number;
  };
}

// Define the Track interface
export interface Track {
  id: string;
  name: string;
  automationLanes: AutomationLane[];
  clips: Clip[];
  color: string;
  effects: any[];
  expanded: boolean;
  pan: number;
  solo: boolean;
  muted: boolean;
  mute: boolean;
  type: TrackType;
  volume: number;
  fx: {
    preset: any;
    effects: any[];
    selectedEffectIndex: number;
  };
  armed: boolean;
  automation?: boolean;
  automationMode?: AutomationMode;
}

// Define the Clip interface
export interface Clip {
  id: string;
  name: string;
  start: TimelinePosition;
  end: TimelinePosition;
  type?: string;
  audio?: {
    audioBuffer: AudioBuffer;
    start: TimelinePosition;
    end: TimelinePosition;
    // Other audio properties as needed
  };
  muted?: boolean;
  loopEnd?: TimelinePosition;
  startLimit?: TimelinePosition;
  endLimit?: TimelinePosition;
}

// Define the TimelineSettings interface
export interface TimelineSettings {
  horizontalScale: number;
  timeSignature: {
    beats: number;
    noteValue: number;
  };
}

// Define the AutomationLane interface
export interface AutomationLane {
  id: string;
  label: string;
  envelope: AutomationLaneEnvelope;
  enabled: boolean;
  minValue: number;
  maxValue: number;
  nodes: AutomationNode[];
  show: boolean;
  expanded: boolean;
}

// Define the AutomationNode interface
export interface AutomationNode {
  id: string;
  value: number;
  pos: TimelinePosition;
}

// Define the ClipAudio interface
export interface ClipAudio {
  audioBuffer: AudioBuffer;
  start: TimelinePosition;
  end: TimelinePosition;
  buffer: ArrayBuffer | any; // Support both Node.js Buffer and browser ArrayBuffer
  sourceDuration: number;
  type: string;
  sourceUrl?: string;
  sourceFile?: string;
}

// Define Buffer interface for compatibility
export interface Buffer<T extends ArrayBufferLike = ArrayBufferLike> {
  [index: number]: number;
  readonly length: number;
  readonly buffer: T;
  subarray(begin?: number, end?: number): Buffer;
  slice(begin?: number, end?: number): Buffer;
  write(string: string, offset?: number, length?: number, encoding?: string): number;
  toJSON(): { type: 'Buffer'; data: number[] };
  equals(otherBuffer: Uint8Array): boolean;
  // We don't need to define all 99+ methods, just the ones used in the test
}

// Update existing enums and add new ones
export enum TrackType {
  Audio = "audio",
  Midi = "midi",
  Sequencer = "sequencer",
  Master = "master"
}

export enum AutomationMode {
  Read = "Read",
  Latch = "Latch",
  Touch = "Touch",
  Write = "Write"
}

// Add the ContextMenuType enum
export enum ContextMenuType {
  Clip = "clip",
  Region = "region",
  Track = "track",
  Lane = "lane",
  Node = "node",
  Text = "text",
  FXChainPreset = "fxChainPreset",
  AddAutomationLane = "addAutomationLane",
  Automation = "automation"
}

// Define the Region interface
export interface Region {
  start: TimelinePosition;
  end: TimelinePosition;
}

// Add other enums and types needed...
