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

export class TimelinePosition {
  constructor(
    public bar: number = 1,
    public beat: number = 1,
    public sixteenth: number = 0
  ) {}

  static start: TimelinePosition = new TimelinePosition();
  
  static max(a: TimelinePosition, b: TimelinePosition): TimelinePosition {
    return a.toTicks() > b.toTicks() ? a : b;
  }
  
  static min(a: TimelinePosition, b: TimelinePosition): TimelinePosition {
    return a.toTicks() < b.toTicks() ? a : b;
  }
  
  toTicks(): number {
    return ((this.bar - 1) * 16) + ((this.beat - 1) * 4) + this.sixteenth;
  }
  
  static fromTicks(ticks: number): TimelinePosition {
    const bar = Math.floor(ticks / 16) + 1;
    const beat = Math.floor((ticks % 16) / 4) + 1;
    const sixteenth = ticks % 4;
    return new TimelinePosition(bar, beat, sixteenth);
  }
  
  clone(): TimelinePosition {
    return new TimelinePosition(this.bar, this.beat, this.sixteenth);
  }
}

export interface Region {
  id: string;
  start: TimelinePosition;
  end: TimelinePosition;
  color?: string;
  label?: string;
}
