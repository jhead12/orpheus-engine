<<<<<<< HEAD
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
=======
import { Buffer } from "buffer";
import TimelinePosition from "./TimelinePosition";

export interface AutomationLane {
  enabled: boolean;
  envelope: string;
  expanded: boolean;
  id: string;
  label: string;
  maxValue: number;
  minValue: number;
  nodes: AutomationNode[];
  show: boolean;
>>>>>>> 987d300 (Fix: Resolve ipcRenderer error in WorkstationProvider)
}

export enum AutomationLaneEnvelope {
  Volume = "volume",
  Pan = "pan",
  Tempo = "tempo"
}

<<<<<<< HEAD
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
=======
export enum AutomationMode {
  Read = "Read", 
  Write = "Write", 
  Touch = "Touch", 
  Trim = "Trim", 
  Latch = "Latch"
};

export interface AutomationNode {
  id: string
  pos: TimelinePosition
  value: number
}

export interface BaseClipComponentProps {
  clip: Clip;
  height: number;
  onChangeLane: (clip: Clip, newTrack: Track) => void;
  onSetClip: (clip: Clip) => void;
  track: Track;
}

export interface Clip extends Region {
  audio?: ClipAudio;
  end: TimelinePosition;
  endLimit: TimelinePosition | null;
  id: string;
  loopEnd: TimelinePosition | null;
  muted: boolean;
  name: string;
  start: TimelinePosition;
  startLimit: TimelinePosition | null;
  type: TrackType;
}

export interface ClipAudio extends Region {
  audioBuffer: AudioBuffer | null;
  buffer: Buffer;
  sourceDuration: number;
  type: string;
}

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

export interface Effect {
  id : string
  name : string
  enabled : boolean
}

export interface FX {
  effects: Effect[];
  preset?: string | null;
  selectedEffectIndex: number;
}

export interface FXChainPreset {
  id: string;
  name: string;
  effects: Effect[];
}

export interface MidiClip extends Clip {
  notes: MidiNote[];
}

export interface MidiNote extends Region {
  note: MusicalNote;
  velocity: number;
}

enum MusicalNote {
  C0, Cs0, D0, Ds0, E0, F0, Fs0, G0, Gs0, A0, As0, B0,
  C1, Cs1, D1, Ds1, E1, F1, Fs1, G1, Gs1, A1, As1, B1,
  C2, Cs2, D2, Ds2, E2, F2, Fs2, G2, Gs2, A2, As2, B2,
  C3, Cs3, D3, Ds3, E3, F3, Fs3, G3, Gs3, A3, As3, B3,
  C4, Cs4, D4, Ds4, E4, F4, Fs4, G4, Gs4, A4, As4, B4, 
  C5, Cs5, D5, Ds5, E5, F5, Fs5, G5, Gs5, A5, As5, B5,
  C6, Cs6, D6, Ds6, E6, F6, Fs6, G6, Gs6, A6, As6, B6,
  C7, Cs7, D7, Ds7, E7, F7, Fs7, G7, Gs7, A7, As7, B7,
  C8, Cs8, D8, Ds8, E8, F8, Fs8, G8, Gs8, A8, As8, B8,
  C9, Cs9, D9, Ds9, E9, F9, Fs9, G9, Gs9, A9, As9, B9
}

export interface Preferences {
  color: string;
  theme: string;
}

export interface Region {
  start : TimelinePosition
  end : TimelinePosition
}

export enum SnapGridSizeOption {
  None,
  Auto,
  EightMeasures,
  FourMeasures,
  TwoMeasures,
  Measure,
  Beat,
  HalfBeat,
  QuarterBeat,
  EighthBeat,
  SixteenthBeat,
  ThirtySecondBeat,
  SixtyFourthBeat,
  HundredTwentyEighthBeat
}

export type { TimelineSettings, TimelineSpan } from "./TimelinePosition";

export { default as TimelinePosition } from "./TimelinePosition";

export interface TimeSignature {
  beats : number
  noteValue : number
}

export interface Track {
  armed: boolean;
  automation: boolean;
  automationLanes: AutomationLane[];
  automationMode: AutomationMode;
  clips: Clip[];
  color: string;
  fx: FX;
  id: string;
  mute: boolean;
  name: string;
  pan: number;
  solo: boolean;
  type: TrackType;
  volume : number;
};

export enum TrackType { 
  Audio = "Audio", 
  Midi = "MIDI", 
  Sequencer = "Step Sequencer", 
  Master = "Master" 
};

export interface ValidatedInput {
  value: string;
  valid: boolean;
}

export interface WorkstationAudioInputFile {
  buffer: Buffer; 
  name: string;
  type: string;
}
>>>>>>> 987d300 (Fix: Resolve ipcRenderer error in WorkstationProvider)
