// Core types for the workstation
export interface TimelineSettings {
  tempo: number;
  timeSignature: {
    beats: number;
    noteValue: number;
  };
  snap: boolean;
  snapUnit: string;
  horizontalScale: number;
}

export class TimelinePosition {
  measure: number = 0;
  beat: number = 0;
  fraction: number = 0;

  constructor(measure: number = 0, beat: number = 0, fraction: number = 0) {
    this.measure = measure;
    this.beat = beat;
    this.fraction = fraction;
  }

  static timelineSettings: TimelineSettings = {
    tempo: 120,
    timeSignature: { beats: 4, noteValue: 4 },
    snap: true,
    snapUnit: 'beat',
    horizontalScale: 1
  };

  copy(): TimelinePosition {
    return new TimelinePosition(this.measure, this.beat, this.fraction);
  }

  snap(snapSize: any, direction?: string): TimelinePosition {
    // Implementation for snapping
    return this;
  }

  add(measures: number, beats: number, fraction: number, normalize?: boolean): TimelinePosition {
    this.measure += measures;
    this.beat += beats;
    this.fraction += fraction;
    if (normalize !== false) this.normalize();
    return this;
  }

  subtract(measures: number, beats: number, fraction: number, normalize?: boolean): TimelinePosition {
    this.measure -= measures;
    this.beat -= beats;
    this.fraction -= fraction;
    if (normalize !== false) this.normalize();
    return this;
  }

  normalize(): void {
    // Normalize fractions and beats
  }

  toSeconds(): number {
    return 0; // Implementation needed
  }

  toTimeString(): string {
    return `${this.measure}:${this.beat}:${this.fraction}`;
  }

  toString(digits?: number): string {
    return `${this.measure}.${this.beat}.${this.fraction.toFixed(digits || 0)}`;
  }

  equals(other: TimelinePosition): boolean {
    return this.measure === other.measure && this.beat === other.beat && this.fraction === other.fraction;
  }

  compareTo(other: TimelinePosition): number {
    if (this.measure !== other.measure) return this.measure - other.measure;
    if (this.beat !== other.beat) return this.beat - other.beat;
    return this.fraction - other.fraction;
  }

  diff(other: TimelinePosition): TimelinePosition {
    return new TimelinePosition(
      this.measure - other.measure,
      this.beat - other.beat,
      this.fraction - other.fraction
    );
  }

  static start = new TimelinePosition(0, 0, 0);
  static min = (a: TimelinePosition, b: TimelinePosition) => a.compareTo(b) < 0 ? a : b;
  static max = (a: TimelinePosition, b: TimelinePosition) => a.compareTo(b) > 0 ? a : b;

  static parseFromString(str: string): TimelinePosition | null {
    // Implementation for parsing
    return null;
  }

  static fromSpan(span: any): TimelinePosition {
    return new TimelinePosition();
  }

  static durationToSpan(duration: number): { measures: number; beats: number; fraction: number } {
    return { measures: 0, beats: 0, fraction: 0 };
  }

  static fromMargin(margin: number): TimelinePosition {
    // Implementation for converting from margin
    return new TimelinePosition();
  }
}

export enum TrackType {
  Audio = 'audio',
  MIDI = 'midi',
  Midi = 'midi', // Add alias for compatibility
  Sequencer = 'sequencer'
}

export enum SnapGridSizeOption {
  None = 'none',
  Auto = 'auto',
  HundredTwentyEighthBeat = '1/128',
  SixtyFourthBeat = '1/64',
  ThirtySecondBeat = '1/32',
  SixteenthBeat = '1/16',
  EighthBeat = '1/8',
  Eighth = '1/8', // Add alias for compatibility
  QuarterBeat = '1/4',
  HalfBeat = '1/2',
  Beat = '1',
  Measure = 'measure',
  TwoMeasures = '2measures',
  FourMeasures = '4measures',
  EightMeasures = '8measures'
}

// Add missing types
export enum AudioAnalysisType {
  Spectral = 'spectral',
  Waveform = 'waveform',
  Features = 'features'
}

export enum ContextMenuType {
  Clip = 'clip',
  Track = 'track',
  Region = 'region'
}

export interface AutomationLane {
  id: string;
  envelope: string;
  points: Array<{ position: TimelinePosition; value: number }>;
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
  automationLanes: AutomationLane[];
}

export interface Clip {
  id: string;
  name: string;
  type: TrackType;
  start: TimelinePosition;
  end: TimelinePosition;
  audio?: {
    start: TimelinePosition;
    end: TimelinePosition;
    buffer?: AudioBuffer;
  };
  startLimit?: TimelinePosition;
  endLimit?: TimelinePosition;
  loopEnd?: TimelinePosition;
}

export interface Region {
  id: string;
  name: string;
  start: TimelinePosition;
  end: TimelinePosition;
}
