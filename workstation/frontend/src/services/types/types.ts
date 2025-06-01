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
}

/**
 * Represents a position in the timeline using bars, beats, and ticks
 */
export class TimelinePosition {
<<<<<<< Updated upstream
  constructor(
    public bar: number = 1,
    public beat: number = 1,
    public sixteenth: number = 0
  ) {}

  constructor(bar: number = 0, beat: number = 0, tick: number = 0) {
    this.bar = bar;
    this.beat = beat;
    this.tick = tick;
  }

  /**
   * Add two timeline positions
   */
  static add(a: TimelinePosition, b: TimelinePosition): TimelinePosition {
    let resultTick = a.tick + b.tick;
    let resultBeat = a.beat + b.beat;
    let resultBar = a.bar + b.bar;
    
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
   * Subtract one timeline position from another
   */
  static subtract(a: TimelinePosition, b: TimelinePosition): TimelinePosition {
    // Convert to total ticks for easier calculation
    const aTicks = (a.bar * 4 * 480) + (a.beat * 480) + a.tick;
    const bTicks = (b.bar * 4 * 480) + (b.beat * 480) + b.tick;
    let diffTicks = aTicks - bTicks;
    
    // Ensure result is not negative
    if (diffTicks < 0) {
      diffTicks = 0;
    }
    
    // Convert back to bar, beat, tick
    const resultBar = Math.floor(diffTicks / (4 * 480));
    diffTicks -= resultBar * 4 * 480;
    
    const resultBeat = Math.floor(diffTicks / 480);
    diffTicks -= resultBeat * 480;
    
    const resultTick = diffTicks;
    
    return new TimelinePosition(resultBar, resultBeat, resultTick);
  }

  /**
   * Compare two timeline positions
   * Returns -1 if a < b, 0 if a === b, 1 if a > b
   */
  static compare(a: TimelinePosition, b: TimelinePosition): number {
    // Convert to total ticks for easier comparison
    const aTicks = (a.bar * 4 * 480) + (a.beat * 480) + a.tick;
    const bTicks = (b.bar * 4 * 480) + (b.beat * 480) + b.tick;
    
    if (aTicks < bTicks) return -1;
    if (aTicks > bTicks) return 1;
    return 0;
  }

  /**
   * Convert timeline position to seconds based on tempo
   */
  static toSeconds(position: TimelinePosition, tempo: number = 120): number {
    const beatsPerSecond = tempo / 60;
    const totalBeats = (position.bar * 4) + position.beat + (position.tick / 480);
    return totalBeats / beatsPerSecond;
  }

  /**
   * Convert seconds to timeline position based on tempo
   */
  static fromSeconds(seconds: number, tempo: number = 120): TimelinePosition {
    const beatsPerSecond = tempo / 60;
    const totalBeats = seconds * beatsPerSecond;
    
    const bar = Math.floor(totalBeats / 4);
    let remainingBeats = totalBeats - (bar * 4);
    
    const beat = Math.floor(remainingBeats);
    remainingBeats = remainingBeats - beat;
    
    const tick = Math.round(remainingBeats * 480);
    
    return new TimelinePosition(bar, beat, tick);
  }
}

/**
 * Audio clip data interface
 */
export interface AudioData {
  type: string;
  buffer: AudioBuffer;
  waveform: number[];
}

/**
 * Clip interface
 */
export interface Clip {
  id: string;
  trackId: string;
  start: TimelinePosition;
  length: TimelinePosition;
  data: AudioData;
  fadeIn?: number;  // Fade in time in seconds
  fadeOut?: number; // Fade out time in seconds
  gain?: number;    // Volume multiplier
  effects?: Array<{ type: string, parameters: Record<string, any> }>;
  metadata?: Record<string, any>;
}
=======
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
>>>>>>> Stashed changes
