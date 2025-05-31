export interface TimelinePosition {
  measures: number;
  beats: number;
  fraction: number;
}

export interface Region {
  start: TimelinePosition;
  end: TimelinePosition;
}

export interface TimelineSettings {
  timeSigNumerator: number;
  timeSigDenominator: number;
  bpm: number;
}

export interface TimeSignature {
  numerator: number;
  denominator: number;
}

export enum TrackType {
  AUDIO = 'AUDIO',
  MIDI = 'MIDI',
  INSTRUMENT = 'INSTRUMENT',
  MASTER = 'MASTER',
  RETURN = 'RETURN',
  GROUP = 'GROUP'
}

export interface ClipAudio {
  id: string;
  buffer: AudioBuffer | null;
}

export interface Clip {
  id: string;
  name?: string;
  start: TimelinePosition;
  end: TimelinePosition;
  audioId?: string;
  muted?: boolean;
  color?: string;
}

export interface AutomationNode {
  id: string;
  position: TimelinePosition;
  value: number;
}

export interface AutomationLaneEnvelope {
  nodes: AutomationNode[];
}

export interface AutomationLane {
  id: string;
  name: string;
  parameter: string;
  envelope: AutomationLaneEnvelope;
}

export interface Track {
  id: string;
  name: string;
  type: TrackType;
  clips: Clip[];
  automationLanes?: AutomationLane[];
  muted?: boolean;
  solo?: boolean;
  volume?: number;
  pan?: number;
  color?: string;
}

export enum SnapGridSizeOption {
  MEASURE = 'MEASURE',
  BEAT = 'BEAT',
  EIGHTH = 'EIGHTH',
  SIXTEENTH = 'SIXTEENTH',
  THIRTYSECOND = 'THIRTYSECOND',
  SIXTYFOURTH = 'SIXTYFOURTH',
}

export interface FXChainPreset {
  id: string;
  name: string;
  effects: any[];
}

export interface WorkstationAudioInputFile {
  id: string;
  name: string;
  path: string;
  duration: number;
}

export enum ContextMenuType {
  NONE = 'NONE',
  TRACK = 'TRACK',
  CLIP = 'CLIP',
  TIMELINE = 'TIMELINE',
  AUTOMATION = 'AUTOMATION'
}
