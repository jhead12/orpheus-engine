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
  tempo: number;
  timeSignature: TimeSignature;
  snap: boolean;
  snapUnit: 'beat' | 'bar' | 'sixteenth';
}

export interface TimelineSpan {
  measures: number;
  beats: number;
  fraction: number;
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

export interface Clip {
  id: string;
  trackId: string;
  start: TimelinePosition;
  length: TimelinePosition;
  data: AudioData | MIDIData;
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

export enum TrackType {
  Audio = "audio",
  MIDI = "midi",
  Bus = "bus"
}

/**
 * Represents a position in the timeline using bars, beats, and ticks
 */
export class TimelinePosition {
  bar: number;
  beat: number;
  tick: number;

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
