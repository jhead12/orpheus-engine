export enum AudioAnalysisType {
  Spectral = 'spectral',  
  Waveform = 'waveform',
  Features = 'features'
}

export interface TimeSignature {
  beats: number;
  noteValue: number;
}

export interface TimelineSettings {
  horizontalScale: number;
  timeSignature: TimeSignature;
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
 diff(other: TimelinePosition): { measures: number; beats: number; fraction: number; sign: number } {
   const diffInSixteenths = this.toSixteenths() - other.toSixteenths();
   const sign = Math.sign(diffInSixteenths);
   const absDiff = Math.abs(diffInSixteenths);
   const measures = Math.floor(absDiff / (4 * 4 * 4));
   const beats = Math.floor((absDiff % (4 * 4 * 4)) / (4 * 4));
   const fraction = absDiff % (4 * 4);
   return { measures, beats, fraction, sign };
 }
 translate(span: { measures: number; beats: number; fraction: number; sign: number }): TimelinePosition {
   const sixteenths = span.measures * 4 * 4 * 4 + span.beats * 4 * 4 + span.fraction;
   const newSixteenths = this.toSixteenths() + sixteenths * span.sign;
   const newPos = TimelinePosition.fromSixteenths(newSixteenths);
   return newPos;
 }
 copy(): TimelinePosition {
   return new TimelinePosition(this.bar, this.beat, this.sixteenth, this.tick);
 }
 equals(other: TimelinePosition): boolean {
   return this.bar === other.bar && this.beat === other.beat && this.sixteenth === other.sixteenth && this.tick === other.tick;
 }
 toSixteenths(): number {
   return this.bar * 4 * 4 * 4 + this.beat * 4 * 4 + this.sixteenth;
 }
 static fromSixteenths(sixteenths: number): TimelinePosition {
   const bar = Math.floor(sixteenths / (4 * 4 * 4));
   const beat = Math.floor((sixteenths % (4 * 4 * 4)) / (4 * 4));
   const sixteenth = sixteenths % (4 * 4);
   return new TimelinePosition(bar, beat, sixteenth);
 }
 static measureMargin(margin: number): { measures: number; beats: number; fraction: number } {
   const measures = Math.floor(margin / (4 * 4 * 4));
   const beats = Math.floor((margin % (4 * 4 * 4)) / (4 * 4));
   const fraction = margin % (4 * 4);
   return { measures, beats, fraction };
 }
  constructor(
    public bar: number = 0,
    public beat: number = 0,
    public sixteenth: number = 0,
    public tick: number = 0
  ) {}

  static fromMargin(margin: number): TimelinePosition {
    // Basic implementation - you'll need to adjust based on your needs
    const bar = Math.floor(margin / 100);
    return new TimelinePosition(bar);
  }

  compareTo(other: TimelinePosition): number {
    if (this.bar !== other.bar) return this.bar - other.bar;
    if (this.beat !== other.beat) return this.beat - other.beat;
    if (this.sixteenth !== other.sixteenth) return this.sixteenth - other.sixteenth;
    return this.tick - other.tick;
  }

  snap(gridSize: number): TimelinePosition {
    // Basic implementation - you'll need to adjust based on your needs
    this.tick = Math.round(this.tick / gridSize) * gridSize;
    return this;
  }

  toMargin(): number {
    // Basic implementation - you'll need to adjust based on your needs
    return this.bar * 100 + this.beat * 25 + this.sixteenth * 6.25 + this.tick * 0.1;
  }
}

export interface AutomationNode {
  id: string;
  pos: TimelinePosition;
  value: number;
}

export interface AutomationLane {
  enabled: boolean;
  envelope: AutomationLaneEnvelope;
  expanded: boolean;
  id: string;
  label: string;
  maxValue: number;
  minValue: number;
  nodes: AutomationNode[];
  show: boolean;
}

export interface Region {
  start: TimelinePosition;
  end: TimelinePosition;
}

export interface ClipAudio {
 start: TimelinePosition;
 end: TimelinePosition;
  audioBuffer: AudioBuffer | null;
  buffer: Buffer; // Changed from NodeJS.Buffer to use the global Buffer type
  sourceDuration: number;
  type: string;
}

export interface Clip extends Region {
  id: string;
  name: string;
  type: TrackType;
  color?: string;
  muted: boolean;
  startLimit?: TimelinePosition | null;
  endLimit?: TimelinePosition | null;
  loopEnd: TimelinePosition | null;
  // Only present for audio clips
  audio?: ClipAudio;
}

export interface Track {
  id: string;
  name: string;
  type: TrackType;
  color: string;
  clips: Clip[];
  fx: {
    preset: string | null;
    effects: BaseEffect[];
    selectedEffectIndex: number;
  };
  automationLanes: AutomationLane[];
  mute: boolean;
  solo: boolean;
  armed: boolean;
  volume: number;
  pan: number;
  automation: boolean;
  automationMode: AutomationMode;
  expanded?: boolean;
}

export enum TrackType {
  Audio = "Audio",
  Midi = "MIDI",
  Sequencer = "Step Sequencer",
  Master = "Master"
}

export enum AutomationMode {
  Read = "read",
  Write = "write",
  Touch = "touch",
  Trim = "trim",
  Latch = "latch"
}

// Core interfaces for effects
export interface BaseEffect {
  id: string;
  name: string;
  enabled: boolean;
  type: "native" | "juce" | "python";
  source?: string;
}

export interface Effect extends BaseEffect {
  parameters?: Record<string, any>;
}

export interface FXChainPreset {
  id: string;
  name: string;
  effects: BaseEffect[];
}

// Grid snap options
export enum SnapGridSizeOption {
  None = 'none',
  Auto = 'auto', 
  EightMeasures = '8m',
  FourMeasures = '4m',
  TwoMeasures = '2m',
  Measure = '1m',
  Beat = '1b',
  HalfBeat = '1/2',
  QuarterBeat = '1/4',
  EighthBeat = '1/8',
  SixteenthBeat = '1/16',
  ThirtySecondBeat = '1/32',
  SixtyFourthBeat = '1/64',
  HundredTwentyEighthBeat = '1/128'
 }

/**
 * Represents an audio file in the workstation
 */
export interface WorkstationAudioInputFile {
  id: string;
  name: string;
  path: string;
  duration: number;
  buffer: Buffer; // Changed from NodeJS.Buffer to use the global Buffer type
  type: string;
}

/**
 * Context menu types for different parts of the UI
 */
export enum ContextMenuType {
  AddAutomationLane,
  Automation,
  AutomationMode,
  Clip,
  FXChainPreset,
  Lane,
  Node,
  Region,
  Text,
  Track
}

/**
 * Interface defining thresholds for automatic scrolling near window edges
 */
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
