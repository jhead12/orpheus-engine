// Consolidated types for the Orpheus Engine DAW

export enum AudioAnalysisType {
  Spectral = "spectral",
  Waveform = "waveform",
  Features = "features"
}

export enum TrackType {
  Audio = "audio",
  Midi = "midi", // Note: Ensure consistent naming - MIDI vs Midi
  Bus = "bus",
  Master = "master",
  Sequencer = "sequencer" // Added to match existing code
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
  horizontalScale: number; // Added from src/services/types/types.ts
}

export interface Track {
  id: string;
  name: string;
  type: string | TrackType;
  clips: Clip[];
  mute: boolean;
  solo: boolean;
  volume: number;
  pan: number;
  color?: string;
  automationLanes?: AutomationLane[];
  expanded?: boolean;
  effects?: Effect[];
  fx?: {
    preset: any;
    effects: any[];
    selectedEffectIndex: number;
  };
  armed?: boolean;
}

export interface AudioData {
  type: 'audio';
  buffer: AudioBuffer;
  waveform: number[];
  audioBuffer?: AudioBuffer; // Added to match existing code
  start?: TimelinePosition; // Used by Header.tsx
  end?: TimelinePosition; // Used by Header.tsx
}

// WorkstationAudioInputFile interface for file uploads
export interface WorkstationAudioInputFile {
  id: string;
  name: string;
  path: string;
  duration: number;
  buffer: ArrayBuffer;
  type: string;
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
  name?: string;
  type?: string | TrackType;
  start: TimelinePosition;
  end?: TimelinePosition;
  length: TimelinePosition;
  audio?: AudioData;
  data?: AudioData | MIDIData;
  fadeIn?: number;
  fadeOut?: number;
  gain?: number;
  effects?: Array<{ type: string, parameters: Record<string, any> }>;
  metadata?: Record<string, any>;
  
  // Additional properties used by Header.tsx
  loopEnd?: TimelinePosition;
  startLimit?: TimelinePosition;
  endLimit?: TimelinePosition;
}

export interface TimelinePosition {
  bar: number;
  beat: number;
  tick: number;
  // Add any other position properties here
}

// Effect-related types
export interface BaseEffect {
  id: string;
  name: string;
  type: string;
  enabled: boolean;
  bypass?: boolean;
}

export interface Effect extends BaseEffect {
  parameters: Record<string, any>;
}

export interface FXChainPreset {
  id: string;
  name: string;
  effects: Effect[];
}

// Context menu types
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

// Automation types
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
  // Values needed for backward compatibility with Header.tsx
  None = "none",
  Sixteenth = "sixteenth",
  Eighth = "eighth",
  Quarter = "quarter",
  Half = "half",
  Whole = "whole",
  Measure = "measure",
  TwoMeasures = "twoMeasures",
  FourMeasures = "fourMeasures",
  EightMeasures = "eightMeasures",
  
  // Additional values for new components
  Auto = "auto",
  HundredTwentyEighthBeat = "128n",
  SixtyFourthBeat = "64n",
  ThirtySecondBeat = "32n",
  SixteenthBeat = "16n",
  EighthBeat = "8n",
  QuarterBeat = "4n",
  HalfBeat = "2n",
  Beat = "1n"
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

// Region interface for defining time ranges
export interface Region {
  start: TimelinePosition;
  end: TimelinePosition;
}

// Window scroll threshold interface
export interface WindowAutoScrollThresholds {
  right: { slow: number; medium: number; fast: number };
  left: { slow: number; medium: number; fast: number };
  top?: { slow: number; medium: number; fast: number };
  bottom?: { slow: number; medium: number; fast: number };
}

// Base component props
export interface BaseClipComponentProps {
  clip: Clip;
  color?: string;
  onContextMenu?: (e: React.MouseEvent, clip: Clip) => void;
}

// WorkstationPlugin interface for plugins
export interface WorkstationPlugin {
  id: string;
  name: string;
  version: string;
  initialize?: (workstation: any) => void;
  cleanup?: () => void;
  metadata?: {
    id: string;
    name: string;
    author?: string;
    description?: string;
  };
  storageConnector?: any;
}

// WorkstationContextType for the context
export interface WorkstationContextType {
  // Plugin Management
  plugins: WorkstationPlugin[];
  registerPlugin: (plugin: WorkstationPlugin) => void;
  unregisterPlugin: (pluginId: string) => void;
  getPlugin: (pluginId: string) => WorkstationPlugin | undefined;
  hasPlugin: (pluginId: string) => boolean;
  getPlugins: () => WorkstationPlugin[];
  clearPlugins: () => void;

  // Timeline & Playback
  playheadPos: TimelinePosition;
  setPlayheadPos: (pos: TimelinePosition) => void;
  isPlaying: boolean;
  togglePlayback: () => void;
  timelineSettings: TimelineSettings;
  updateTimelineSettings: (settings: any) => void;
  
  // Tracks
  tracks: Track[];
  setTracks: (tracks: Track[]) => void;
  masterTrack?: Track;
  showMaster?: boolean;
  addTrack: (type: any) => void;
  selectedTrackId?: string;
  setSelectedTrackId: (id: string) => void;
  
  // Other properties
  maxPos: TimelinePosition;
  numMeasures: number;
  adjustNumMeasures: () => void;
  
  // Clips
  createAudioClip: (file: any, position: TimelinePosition) => Promise<Clip>;
  insertClips: (clips: Clip[], track: Track) => void;
  
  // UI State
  snapGridSize: number;
  verticalScale: number;
  setVerticalScale: (scale: number) => void;
  scrollToItem: any;
  setScrollToItem: (item: any) => void;
  setAllowMenuAndShortcuts: (allow: boolean) => void;
  
  // Additional properties
  createClipFromTrackRegion?: (track: Track) => void;
  pasteClip?: (clip: Clip, track: Track) => void;
  setTrack?: (track: Track) => void;
  setTrackRegion?: (region: any) => void;
  trackRegion?: any;
  songRegion?: any;
  setSongRegion?: (region: any) => void;
  
  // Any other properties used in the app
  [key: string]: any;
}

// Timeline Position class
export class TimelinePosition {
  static defaultSettings: TimelineSettings = {
    tempo: 120,
    timeSignature: { beats: 4, noteValue: 4 },
    snap: true,
    snapUnit: 'beat',
    horizontalScale: 1
  };

  // Add static start property  
  static start = new TimelinePosition(0, 0, 0);
  
  // Add static timelineSettings
  static timelineSettings: TimelineSettings = {
    tempo: 120,
    timeSignature: { beats: 4, noteValue: 4 },
    snap: true,
    snapUnit: 'beat',
    horizontalScale: 1
  };

  constructor(
    public bar: number = 0,
    public beat: number = 0,
    public tick: number = 0
  ) {}

  // Getter for measure (alias for bar) to support Header.tsx
  get measure(): number {
    return this.bar;
  }

  // Getter for fraction to support Header.tsx
  get fraction(): number {
    return this.tick / 480;
  }

  /**
   * Add an offset to this position and return a new position
   */
  add(measures: number, beats: number, fraction: number, normalize = true): TimelinePosition {
    const ticks = Math.round(fraction * 480);
    let resultTick = this.tick + ticks;
    let resultBeat = this.beat + beats;
    let resultBar = this.bar + measures;
    
    if (normalize) {
      // Handle tick overflow
      while (resultTick >= 480) {
        resultBeat++;
        resultTick -= 480;
      }

      // Handle beat overflow
      while (resultBeat >= 4) {  // Assuming 4/4 time signature
        resultBar++;
        resultBeat -= 4;
      }
    }
    
    return new TimelinePosition(resultBar, resultBeat, resultTick);
  }

  /**
   * Subtract an offset from this position and return a new position
   */
  subtract(bars: number, beats: number, ticks: number, normalize = true): TimelinePosition {
    let resultTick = this.tick - ticks;
    let resultBeat = this.beat - beats;
    let resultBar = this.bar - bars;
    
    if (normalize) {
      // Handle tick underflow
      while (resultTick < 0) {
        resultBeat--;
        resultTick += 480;
      }
      
      // Handle beat underflow
      while (resultBeat < 0) {
        resultBar--;
        resultBeat += 4;
      }
      
      // Ensure we don't go negative
      if (resultBar < 0) {
        resultBar = 0;
        resultBeat = 0;
        resultTick = 0;
      }
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
    return this.bar === other.bar && this.beat === other.beat && this.tick === other.tick;
  }
  
  /**
   * Convert position to total number of ticks
   */
  toTicks(): number {
    return (this.bar * 4 * 480) + (this.beat * 480) + this.tick;
  }
  
  /**
   * Convert to margin for timeline display
   */
  toMargin(): number {
    return this.toTicks();
  }

  /**
   * Calculate difference between two positions
   */
  diff(other: TimelinePosition): number {
    return this.toMargin() - other.toMargin();
  }
  
  /**
   * Calculate margin difference between two positions
   */
  diffInMargin(other: TimelinePosition): number {
    return Math.abs(this.toMargin() - other.toMargin());
  }

  /**
   * Normalize this position (adjust tick and beat overflow)
   */
  normalize(): TimelinePosition {
    let normalizedTick = this.tick;
    let normalizedBeat = this.beat;
    let normalizedBar = this.bar;
    
    // Handle tick overflow
    if (normalizedTick >= 480) {
      normalizedBeat += Math.floor(normalizedTick / 480);
      normalizedTick %= 480;
    }
    
    // Handle beat overflow
    if (normalizedBeat >= 4) {
      normalizedBar += Math.floor(normalizedBeat / 4);
      normalizedBeat %= 4;
    }
    
    this.tick = normalizedTick;
    this.beat = normalizedBeat;
    this.bar = normalizedBar;
    
    return this;
  }
  
  /**
   * Convert position to a formatted time string
   */
  toTimeString(): string {
    const seconds = this.toSeconds();
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toFixed(3).padStart(6, '0')}`;
  }

  /**
   * Convert to string with specified precision
   */
  toString(precision: number = 2): string {
    if (precision === 3) {
      return `${this.bar}.${this.beat}.${Math.round(this.fraction * 100)}`;
    } else if (precision === 2) {
      return `${this.bar}.${this.beat}`;
    } else {
      return `${this.bar}`;
    }
  }
  
  /**
   * Snap the position to the given grid size
   */
  snap(snapSize: any, direction: 'round' | 'floor' | 'ceil' = 'round'): TimelinePosition {
    if (!snapSize) return this.copy();
    
    // Handle span object
    if (typeof snapSize === 'object') {
      const spanInTicks = (snapSize.measures * 4 * 480) + (snapSize.beats * 480) + (snapSize.fraction * 480);
      return this.snapToTicks(spanInTicks, direction);
    }
    
    // Handle numeric snap size
    return this.snapToTicks(snapSize * 480, direction);
  }
  
  /**
   * Snap to the given tick size
   */
  private snapToTicks(tickSnap: number, direction: 'round' | 'floor' | 'ceil'): TimelinePosition {
    if (tickSnap <= 0) return this.copy();
    
    const ticks = this.toTicks();
    let snappedTicks: number;
    
    if (direction === 'round') {
      snappedTicks = Math.round(ticks / tickSnap) * tickSnap;
    } else if (direction === 'floor') {
      snappedTicks = Math.floor(ticks / tickSnap) * tickSnap;
    } else { // ceil
      snappedTicks = Math.ceil(ticks / tickSnap) * tickSnap;
    }
    
    return TimelinePosition.fromTicks(snappedTicks);
  }

  /**
   * Create a TimelinePosition from total ticks
   */
  static fromTicks(ticks: number): TimelinePosition {
    const bar = Math.floor(ticks / (4 * 480));
    const remainingTicks = ticks % (4 * 480);
    const beat = Math.floor(remainingTicks / 480);
    const tick = remainingTicks % 480;
    
    return new TimelinePosition(bar, beat, tick);
  }

  /**
   * Convert position to seconds based on tempo
   */
  toSeconds(): number {
    const { tempo, timeSignature } = TimelinePosition.timelineSettings || TimelinePosition.defaultSettings;
    const secondsPerBeat = 60 / tempo;
    const totalBeats = this.bar * timeSignature.beats + this.beat + (this.tick / 480);
    
    return totalBeats * secondsPerBeat;
  }

  // Missing static methods used by Header.tsx
  static parseFromString(str: string): TimelinePosition {
    const parts = str.split('.');
    const bar = parseInt(parts[0]) || 0;
    const beat = parseInt(parts[1]) || 0;
    const fraction = parseFloat('0.' + (parts[2] || '0')) || 0;
    const tick = Math.round(fraction * 480);
    
    return new TimelinePosition(bar, beat, tick);
  }

  static fromSpan(span: { measures: number; beats: number; fraction: number }): TimelinePosition {
    const tick = Math.round(span.fraction * 480);
    return new TimelinePosition(span.measures, span.beats, tick);
  }

  static durationToSpan(duration: number): { measures: number; beats: number; fraction: number } {
    const totalTicks = Math.round(duration);
    const measures = Math.floor(totalTicks / (4 * 480));
    const remainingTicks = totalTicks % (4 * 480);
    const beats = Math.floor(remainingTicks / 480);
    const fraction = (remainingTicks % 480) / 480;
    
    return { measures, beats, fraction };
  }

  static min(a: TimelinePosition, b: TimelinePosition): TimelinePosition {
    return a.compareTo(b) <= 0 ? a : b;
  }

  static max(a: TimelinePosition, b: TimelinePosition): TimelinePosition {
    return a.compareTo(b) >= 0 ? a : b;
  }
}

// Export everything from the original types file for backward compatibility
export * from './types';
