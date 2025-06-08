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
   * Convert to margin for timeline display
   */
  toMargin(): number {
    return this.toTicks();
  }

  /**
   * Convert to sixteenths
   */
  toSixteenths(): number {
    return (this.bar * 4 * 4) + (this.beat * 4) + Math.floor(this.tick / 120);
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
   * Create position from margin
   */
  static fromMargin(margin: number): TimelinePosition {
    return TimelinePosition.fromTicks(margin);
  }

  /**
   * Create position from sixteenths
   */
  static fromSixteenths(sixteenths: number): TimelinePosition {
    const bars = Math.floor(sixteenths / 16);
    let remainingSixteenths = sixteenths % 16;
    
    const beats = Math.floor(remainingSixteenths / 4);
    remainingSixteenths = remainingSixteenths % 4;
    
    const ticks = remainingSixteenths * 120; // 120 ticks per sixteenth
    
    return new TimelinePosition(bars, beats, ticks);
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
   * Calculate measure margin from values
   */
  static measureMargin(value: number): { measures: number; beats: number; fraction: number } {
    const bars = Math.floor(value / (4 * 480));
    let remainingTicks = value % (4 * 480);
    
    const beats = Math.floor(remainingTicks / 480);
    remainingTicks = remainingTicks % 480;
    
    const fraction = Math.floor(remainingTicks / 120); // Convert to sixteenths
    
    return { measures: bars, beats, fraction };
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

  /**
   * Snap position to grid
   */
  snap(gridSize: number, direction: 'floor' | 'ceil' | 'round' = 'round'): TimelinePosition {
    if (gridSize <= 0) return this.copy();
    
    // Convert to total ticks
    const totalTicks = this.toTicks();
    
    // Calculate grid size in ticks (assuming gridSize is in beats)
    const gridTicks = gridSize * 480; // 480 ticks per beat
    
    // Snap to nearest grid based on direction
    let snappedTicks: number;
    
    switch(direction) {
      case 'floor':
        snappedTicks = Math.floor(totalTicks / gridTicks) * gridTicks;
        break;
      case 'ceil':
        snappedTicks = Math.ceil(totalTicks / gridTicks) * gridTicks;
        break;
      case 'round':
      default:
        snappedTicks = Math.round(totalTicks / gridTicks) * gridTicks;
    }
    
    return TimelinePosition.fromTicks(snappedTicks);
  }

  /**
   * Check if position is at start (0,0,0)
   */
  static get start(): TimelinePosition {
    return new TimelinePosition(0, 0, 0);
  }

  /**
   * Get maximum of two positions
   */
  static max(a: TimelinePosition, b: TimelinePosition): TimelinePosition {
    return a.compareTo(b) >= 0 ? a : b;
  }

  /**
   * Get minimum of two positions
   */
  static min(a: TimelinePosition, b: TimelinePosition): TimelinePosition {
    return a.compareTo(b) <= 0 ? a : b;
  }
  
  /**
   * Create a position from a span value (used for grid snapping)
   */
  static fromSpan(span: number): TimelinePosition {
    return TimelinePosition.fromTicks(span * 480); // Assuming span is in beats
  }
}

// Export everything from the original types file for backward compatibility
export * from './types';
