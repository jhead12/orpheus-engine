export enum AudioAnalysisType {
  Spectral = "spectral",
  Waveform = "waveform",
  Features = "features"
}

export enum SnapGridSizeOption {
  Auto = "auto",
  Beat = "beat",
  HalfBeat = "half-beat",
  QuarterBeat = "quarter-beat",
  EighthBeat = "eighth-beat",
  SixteenthBeat = "sixteenth-beat",
  ThirtySecondBeat = "thirty-second-beat",
  Bar = "bar",
  HalfBar = "half-bar"
}

export enum TrackType {
  Audio = "audio",
  MIDI = "midi",
  Bus = "bus",
  Master = "master"
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
  horizontalScale: number;
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

// Legacy audio interface for backward compatibility
export interface LegacyAudioData {
  audioBuffer?: AudioBuffer;
  buffer?: ArrayBuffer | Uint8Array;
  type?: string;
  sourceDuration?: number;
  start: TimelinePosition;
  end: TimelinePosition;
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
  mute?: boolean;   // Whether the clip is muted
  effects?: Array<{ type: string, parameters: Record<string, any> }>;
  metadata?: Record<string, any>;
  // Legacy properties for compatibility
  name?: string;
  end?: TimelinePosition;
  loopEnd?: TimelinePosition;
  startLimit?: TimelinePosition;
  endLimit?: TimelinePosition;
  type?: TrackType;
  audio?: LegacyAudioData;
}

export class TimelinePosition {
  static defaultSettings: TimelineSettings = {
    tempo: 120,
    timeSignature: { beats: 4, noteValue: 4 },
    snap: true,
    snapUnit: 'beat',
    horizontalScale: 1
  };

  // Static method to convert margin to measures, beats, and fraction
  static measureMargin(margin: number, settings?: TimelineSettings): { measures: number; beats: number; fraction: number } {
    const timelineSettings = settings || TimelinePosition.defaultSettings;
    const { timeSignature, horizontalScale } = timelineSettings;
    
    // Calculate how many beats fit in the margin based on horizontal scale
    const beatsPerMeasure = timeSignature.beats;
    const beatWidth = 48 * horizontalScale; // Assuming base beat width of 48 pixels
    
    const totalBeats = margin / beatWidth;
    const measures = Math.floor(totalBeats / beatsPerMeasure);
    const remainingBeats = totalBeats % beatsPerMeasure;
    const beats = Math.floor(remainingBeats);
    const fraction = remainingBeats - beats;
    
    return { measures, beats, fraction };
  }

  constructor(
    public bar: number = 0,
    public beat: number = 0,
    public tick: number = 0
  ) {}

  // Legacy property for compatibility
  get sixteenth(): number {
    return Math.floor(this.tick / 120); // 120 ticks per sixteenth
  }

  set sixteenth(value: number) {
    this.tick = value * 120; // 120 ticks per sixteenth
  }

  // Legacy property for compatibility
  get fraction(): number {
    return this.sixteenth;
  }

  // Legacy property for compatibility (measures = bar)
  get measure(): number {
    return this.bar;
  }

  /**
   * Convert position to fraction (for grid calculations)
   */
  toFraction(): number {
    return this.toSixteenths();
  }

  /**
   * Add an offset to this position and return a new position
   */
  add(bars: number, beats: number, ticks: number): TimelinePosition {
    let resultTick = this.tick + ticks;
    let resultBeat = this.beat + beats;
    let resultBar = this.bar + bars;
    
    // Handle tick overflow
    if (resultTick >= 480) { // Assuming 480 ticks per sixteenth
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
   * Calculate margin difference between two positions
   */
  diffInMargin(other: TimelinePosition): number {
    return this.toMargin() - other.toMargin();
  }

  /**
   * Convert to sixteenths
   */
  toSixteenths(): number {
    return (this.bar * 4 * 4) + (this.beat * 4) + Math.floor(this.tick / 120);
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
   * Create position from span (diff result)
   */
  static fromSpan(span: { measures: number; beats: number; fraction: number }): TimelinePosition;
  static fromSpan(span: number): TimelinePosition;
  static fromSpan(span: { measures: number; beats: number; fraction: number } | number): TimelinePosition {
    if (typeof span === 'number') {
      // Convert span value to position (assuming span is in beats)
      return TimelinePosition.fromTicks(span * 480);
    } else {
      // Convert span object to position
      return new TimelinePosition(span.measures, span.beats, span.fraction * 120); // Convert fraction to ticks
    }
  }

  /**
   * Convert fraction to span (for grid calculations)
   */
  static fractionToSpan(fraction: number): number {
    // Convert fraction (in sixteenths) to span in beats
    return fraction / 4; // 4 sixteenths per beat
  }

  /**
   * Convert duration to span (for grid calculations)
   */
  static durationToSpan(duration: number): number {
    // Convert duration (in ticks) to span in beats
    return duration / 480; // 480 ticks per beat
  }

  /**
   * Static timeline settings (for backward compatibility)
   */
  static timelineSettings: TimelineSettings = {
    tempo: 120,
    timeSignature: { beats: 4, noteValue: 4 },
    snap: true,
    snapUnit: 'beat',
    horizontalScale: 1
  };

  /**
   * Convert position to seconds based on tempo
   */
  toSeconds(tempo: number = TimelinePosition.defaultSettings.tempo): number {
    const ticksPerSecond = (tempo * 480) / 60; // 480 ticks per beat
    return this.toTicks() / ticksPerSecond;
  }

  /**
   * Static method to convert position to seconds
   */
  static toSeconds(position: TimelinePosition, tempo: number = TimelinePosition.defaultSettings.tempo): number {
    return position.toSeconds(tempo);
  }

  /**
   * Static method to add seconds to position
   */
  static addSeconds(position: TimelinePosition, seconds: number, tempo: number = TimelinePosition.defaultSettings.tempo): TimelinePosition {
    const additionalTicks = Math.round(seconds * (tempo * 480) / 60);
    return TimelinePosition.fromTicks(position.toTicks() + additionalTicks);
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

  /**
   * Snap position to grid
   */
  snap(gridSize: number): TimelinePosition {
    if (gridSize <= 0) return this.copy();
    
    // Convert to total ticks
    const totalTicks = this.toTicks();
    
    // Calculate grid size in ticks (assuming gridSize is in beats)
    const gridTicks = gridSize * 480; // 480 ticks per beat
    
    // Snap to nearest grid
    const snappedTicks = Math.round(totalTicks / gridTicks) * gridTicks;
    
    return TimelinePosition.fromTicks(snappedTicks);
  }

  /**
   * Translate position by delta
   */
  translate(delta: { measures: number; beats: number; fraction: number; sign: number }, applySnap?: boolean): TimelinePosition {
    // Convert current position to total ticks
    let totalTicks = this.toTicks();
    
    // Calculate delta in ticks
    const deltaTicks = (
      (delta.measures * 4 * 480) + 
      (delta.beats * 480) + 
      (delta.fraction * 120) // assuming fraction is in sixteenths, 480/4 = 120 ticks per sixteenth
    ) * delta.sign;
    
    // Apply translation
    totalTicks += deltaTicks;
    
    // Ensure non-negative
    totalTicks = Math.max(0, totalTicks);
    
    // Create new position
    let newPosition = TimelinePosition.fromTicks(totalTicks);
    
    // Apply snapping if requested
    if (applySnap) {
      newPosition = newPosition.snap(1); // Default snap to beat
    }
    
    return newPosition;
  }

  /**
   * Calculate difference between positions
   */
  diff(other: TimelinePosition): { measures: number; beats: number; fraction: number; sign: number } {
    const thisTicks = this.toTicks();
    const otherTicks = other.toTicks();
    const diffTicks = thisTicks - otherTicks;
    const sign = Math.sign(diffTicks);
    const absDiffTicks = Math.abs(diffTicks);
    
    // Convert back to measures, beats, fraction
    const measures = Math.floor(absDiffTicks / (4 * 480));
    let remainingTicks = absDiffTicks % (4 * 480);
    
    const beats = Math.floor(remainingTicks / 480);
    remainingTicks = remainingTicks % 480;
    
    const fraction = Math.floor(remainingTicks / 120); // Convert to sixteenths
    
    return { measures, beats, fraction, sign };
  }
}

// Automation types
export enum AutomationLaneEnvelope {
  Volume = "volume",
  Pan = "pan",
  Send = "send",
  Filter = "filter",
  Tempo = "tempo"
}

export enum AutomationMode {
  Off = "off",
  Read = "read",
  Write = "write",
  Touch = "touch"
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

// Window scroll thresholds
export interface WindowAutoScrollThresholds {
  top: { slow: number; medium: number; fast: number };
  right: { slow: number; medium: number; fast: number };
  bottom: { slow: number; medium: number; fast: number };
  left: { slow: number; medium: number; fast: number };
}

// Region interface for defining time ranges
export interface Region {
  start: TimelinePosition;
  end: TimelinePosition;
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

// Base effect interface
export interface BaseEffect {
  id: string;
  name: string;
  type: string;
  enabled: boolean;
  bypass?: boolean;
}

// Effect interface with parameters
export interface Effect extends BaseEffect {
  parameters: Record<string, any>;
}

// Missing properties for clips
export interface WorkstationPlugin {
  id: string;
  name: string;
  version: string;
}

export interface WorkstationContextType {
  tracks: Track[];
  play: () => void;
  stop: () => void;
  record: () => void;
  addTrack: (type: TrackType) => void;
  removeTrack: (id: string) => void;
  addClip: (trackId: string, clip: Clip) => void;
  removeClip: (trackId: string, clipId: string) => void;
  timelineSettings: TimelineSettings;
  currentPosition: TimelinePosition;
  playheadPos: TimelinePosition;
  isPlaying: boolean;
  isRecording: boolean;
}

// Base clip component props
export interface BaseClipComponentProps {
  clip: Clip;
  color?: string;
  onContextMenu?: (e: React.MouseEvent, clip: Clip) => void;
}

// Waveform LOD level
export enum WaveformLODLevel {
  High = "high",
  Medium = "medium", 
  Low = "low"
}

// Export interfaces for audio processing
export interface ExportOptions {
  format?: 'wav' | 'mp3' | 'ogg' | 'flac';
  sampleRate?: number;
  bitDepth?: 16 | 24 | 32;
  bitRate?: number;
  normalize?: boolean;
  metadata?: Record<string, any>;
  // Cloud storage options
  cloudProvider?: 'local' | 'ipfs' | 'aws-s3' | 'google-cloud' | 'azure-blob' | 'dropbox' | 'cloudflare-r2';
  folderPath?: string;
  makePublic?: boolean;
  // Quality settings for consistency with plugin options
  quality?: 'low' | 'medium' | 'high' | 'lossless';
}

export interface ExportResult {
  filePath: string;
  duration: number;
  format: string;
  metadata?: Record<string, any>;
}

export interface IPFSExportResult {
  cid: string;
  url: string;
  format: string;
}
