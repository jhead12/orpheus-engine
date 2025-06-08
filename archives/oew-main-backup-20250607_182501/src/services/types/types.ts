// Re-export all types from consolidated-types.ts
export * from './consolidated-types';

// The following enum definitions are preserved for backward compatibility
export enum AudioAnalysisType {
  Spectral = "spectral",
  Waveform = "waveform",
  Features = "features"
}

export enum TrackType {
  Audio = "audio",
  MIDI = "midi",
  Bus = "bus"
}

export interface TimeSignature {
  beats: number;
  noteValue: number;
}

export interface TimelineSettings {
  tempo: number;
  timeSignature: TimeSignature;
  snap: boolean;
  snapUnit: 'beat' | 'bar' | 'sixteenth';
}

export interface Track {
  id: string;
  name: string;
  type: TrackType;
  clips: Clip[];
  mute: boolean;
  solo: boolean;
  volume: number;
  pan: number;
}

export interface AudioData {
  type: 'audio';
  buffer: AudioBuffer;
  waveform: number[];
}

export interface MIDIData {
  type: 'midi';
  notes: MIDINote[];
}

export interface MIDINote {
  pitch: number;
  velocity: number;
  start: TimelinePosition;
  duration: TimelinePosition;
}

export interface Clip {
  id: string;
  trackId: string;
  start: TimelinePosition;
  length: TimelinePosition;
  data: AudioData | MIDIData;
  fadeIn?: number;  // Fade in time in seconds
  fadeOut?: number; // Fade out time in seconds
  gain?: number;    // Volume multiplier
  effects?: Array<{ type: string, parameters: Record<string, any> }>;
  metadata?: Record<string, any>;
}

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

export enum AutomationLaneEnvelope {
  Volume = "volume",
  Pan = "pan",
  Send = "send",
  Filter = "filter"
}

export enum AutomationMode {
  Off = "off",
  Read = "read",
  Write = "write",
  Touch = "touch"
}

export enum SnapGridSizeOption {
  None = 0,
  Auto = 1,
  HundredTwentyEighthBeat = 2,
  SixtyFourthBeat = 3,
  ThirtySecondBeat = 4,
  SixteenthBeat = 5,
  EighthBeat = 6,
  QuarterBeat = 7,
  HalfBeat = 8,
  Beat = 9
}

export interface AutomationNode {
  id: string;
  pos: TimelinePosition;
  value: number;
  curve?: number; // For bezier curves
}

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

export interface Region {
  start: TimelinePosition;
  end: TimelinePosition;
}

export interface WindowAutoScrollThresholds {
  right: { slow: number; medium: number; fast: number };
  left: { slow: number; medium: number; fast: number };
}

export class TimelinePosition {
  static defaultSettings: TimelineSettings = {
    tempo: 120,
    timeSignature: { beats: 4, noteValue: 4 },
    snap: true,
    snapUnit: 'beat'
  };

  constructor(
    public bar: number = 0,
    public beat: number = 0,
    public tick: number = 0
  ) {}

  /**
   * Add an offset to this position and return a new position
   */
  add(bars: number, beats: number, ticks: number): TimelinePosition {
    let resultTick = this.tick + ticks;
    let resultBeat = this.beat + beats;
    let resultBar = this.bar + bars;
    
    // Handle tick overflow
    if (resultTick >= 480) { // Assuming 480 ticks per beat
      resultBeat += Math.floor(resultTick / 480);
      resultTick %= 480;
    }
    
    // Handle beat overflow
    if (resultBeat >= 4) { // Assuming 4 beats per bar
      resultBar += Math.floor(resultBeat / 4);
      resultBeat %= 4;
    }
    
    return new TimelinePosition(resultBar, resultBeat, resultTick);
  }

  /**
   * Create a copy of this position
   */
  copy(): TimelinePosition {
    return new TimelinePosition(this.bar, this.beat, this.tick);
  }

  /**
   * Compare this position to another
   * Returns -1 if this < other, 0 if equal, 1 if this > other
   */
  compareTo(other: TimelinePosition): number {
    if (this.bar !== other.bar) return this.bar - other.bar;
    if (this.beat !== other.beat) return this.beat - other.beat;
    return this.tick - other.tick;
  }

  /**
   * Check if two positions are equal
   */
  equals(other: TimelinePosition): boolean {
    return this.bar === other.bar && 
           this.beat === other.beat && 
           this.tick === other.tick;
  }

  /**
   * Convert position to total number of ticks
   */
  toTicks(): number {
    return (this.bar * 4 * 480) + (this.beat * 480) + this.tick;
  }

  /**
   * Convert position to seconds based on tempo
   */
  toSeconds(tempo: number = TimelinePosition.defaultSettings.tempo): number {
    const ticksPerSecond = (tempo * 480) / 60; // 480 ticks per beat
    return this.toTicks() / ticksPerSecond;
  }

  /**
   * Create a position from a number of seconds
   */
  static fromSeconds(seconds: number, tempo: number = TimelinePosition.defaultSettings.tempo): TimelinePosition {
    const ticksPerSecond = (tempo * 480) / 60;
    const totalTicks = Math.round(seconds * ticksPerSecond);
    
    const bars = Math.floor(totalTicks / (4 * 480));
    let remainingTicks = totalTicks % (4 * 480);
    
    const beats = Math.floor(remainingTicks / 480);
    remainingTicks = remainingTicks % 480;
    
    return new TimelinePosition(bars, beats, remainingTicks);
  }

  /**
   * Create a position from total number of ticks
   */
  static fromTicks(ticks: number): TimelinePosition {
    const bars = Math.floor(ticks / (4 * 480));
    let remainingTicks = ticks % (4 * 480);
    
    const beats = Math.floor(remainingTicks / 480);
    remainingTicks = remainingTicks % 480;
    
    return new TimelinePosition(bars, beats, remainingTicks);
  }

  /**
   * Add two positions together
   */
  static add(a: TimelinePosition, b: TimelinePosition): TimelinePosition {
    return a.add(b.bar, b.beat, b.tick);
  }

  /**
   * Subtract two positions
   */
  static subtract(a: TimelinePosition, b: TimelinePosition): TimelinePosition {
    const totalTicks = Math.max(0, a.toTicks() - b.toTicks());
    return TimelinePosition.fromTicks(totalTicks);
  }

  /**
   * Compare two positions
   */
  static compare(a: TimelinePosition, b: TimelinePosition): number {
    return a.compareTo(b);
  }
}
