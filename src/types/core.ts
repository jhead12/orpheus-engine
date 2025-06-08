// Core type definitions for the audio workstation

export interface TimeSignature {
  beats: number;
  noteValue: number;
}

export interface TimelineSettings {
  tempo: number;
  timeSignature: { beats: number; noteValue: number };
  snap: boolean;
  snapUnit: "beat" | "bar" | "sixteenth";
  horizontalScale: number;
  beatWidth?: number;
}

export interface Region {
  start: TimelinePosition;
  end: TimelinePosition;
}

// Track Types
export enum TrackType {
  Audio = "audio",
  Midi = "midi",
  Sequencer = "sequencer",
}

export enum AutomationMode {
  Read = "read",
  Write = "write",
  Touch = "touch",
  Latch = "latch",
  Trim = "trim",
  Off = "off",
}

export enum AutomationLaneEnvelope {
  Volume = "volume",
  Pan = "pan",
  Send = "send",
  Filter = "filter",
  Tempo = "tempo",
  Effect = "effect",
}

export interface Track {
  id: string;
  name: string;
  type: TrackType;
  color: string;
  mute: boolean;
  solo: boolean;
  armed: boolean;
  volume: number;
  pan: number;
  automation: boolean;
  automationMode: AutomationMode;
  automationLanes: AutomationLane[];
  clips: Clip[];
  effects?: Effect[];
  fx: {
    preset: FXChainPreset | null;
    selectedEffectIndex: number;
    effects: Effect[];
  };
  inputs?: {
    id: string;
    name: string;
    active: boolean;
  }[];
  outputs?: {
    id: string;
    name: string;
    active: boolean;
  }[];
}

// Timeline Types
export class TimelinePosition {
  static defaultSettings: TimelineSettings = {
    tempo: 120,
    timeSignature: { beats: 4, noteValue: 4 },
    snap: true,
    snapUnit: "beat",
    horizontalScale: 1,
  };

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
   * Add an offset to this position and return a new position
   */
  add(bars: number, beats: number, ticks: number): TimelinePosition {
    let resultTick = this.tick + ticks;
    let resultBeat = this.beat + beats;
    let resultBar = this.bar + bars;

    // Handle tick overflow
    if (resultTick >= 480) {
      // Assuming 480 ticks per beat
      resultBeat += Math.floor(resultTick / 480);
      resultTick %= 480;
    }

    // Handle beat overflow
    if (resultBeat >= 4) {
      // Assuming 4 beats per bar
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
    return (
      this.bar === other.bar &&
      this.beat === other.beat &&
      this.tick === other.tick
    );
  }

  /**
   * Convert position to total number of ticks
   */
  toTicks(): number {
    return this.bar * 4 * 480 + this.beat * 480 + this.tick;
  }

  /**
   * Convert to margin for timeline display
   */
  toMargin(): number {
    return this.toTicks();
  }

  /**
   * Convert position to seconds based on tempo
   */
  toSeconds(tempo: number = TimelinePosition.defaultSettings.tempo): number {
    const ticksPerSecond = (tempo * 480) / 60;
    return this.toTicks() / ticksPerSecond;
  }

  /**
   * Snap position to grid
   */
  snap(
    gridSize: number,
    direction: "floor" | "ceil" | "round" = "round"
  ): TimelinePosition {
    if (gridSize <= 0) return this.copy();

    const totalTicks = this.toTicks();
    const gridTicks = gridSize * 480;

    let snappedTicks: number;
    switch (direction) {
      case "floor":
        snappedTicks = Math.floor(totalTicks / gridTicks) * gridTicks;
        break;
      case "ceil":
        snappedTicks = Math.ceil(totalTicks / gridTicks) * gridTicks;
        break;
      case "round":
      default:
        snappedTicks = Math.round(totalTicks / gridTicks) * gridTicks;
    }

    return TimelinePosition.fromTicks(snappedTicks);
  }

  /**
   * Translate position by delta
   */
  translate(
    delta: { measures: number; beats: number; fraction: number; sign: number },
    applySnap?: boolean
  ): TimelinePosition {
    // Convert current position to total ticks
    let totalTicks = this.toTicks();

    // Calculate delta in ticks
    const deltaTicks =
      (delta.measures * 4 * 480 + delta.beats * 480 + delta.fraction * 120) *
      delta.sign;

    // Apply translation
    totalTicks += deltaTicks;

    // Ensure non-negative
    totalTicks = Math.max(0, totalTicks);

    // Create new position
    let newPosition = TimelinePosition.fromTicks(totalTicks);

    // Apply snapping if requested
    if (applySnap) {
      newPosition = newPosition.snap(1);
    }

    return newPosition;
  }

  /**
   * Calculate absolute difference between margins of two positions
   */
  diffInMargin(other: TimelinePosition): number {
    return Math.abs(this.toMargin() - other.toMargin());
  }

  // Static methods
  static fromTicks(ticks: number): TimelinePosition {
    const bars = Math.floor(ticks / (4 * 480));
    let remainingTicks = ticks % (4 * 480);

    const beats = Math.floor(remainingTicks / 480);
    remainingTicks = remainingTicks % 480;

    return new TimelinePosition(bars, beats, remainingTicks);
  }

  static fromSixteenths(sixteenths: number): TimelinePosition {
    const bars = Math.floor(sixteenths / 16);
    let remainingSixteenths = sixteenths % 16;

    const beats = Math.floor(remainingSixteenths / 4);
    remainingSixteenths = remainingSixteenths % 4;

    const ticks = remainingSixteenths * 120;

    return new TimelinePosition(bars, beats, ticks);
  }

  static fromSpan(span: number): TimelinePosition {
    return TimelinePosition.fromTicks(span * 480);
  }

  static fromSeconds(
    seconds: number,
    tempo: number = TimelinePosition.defaultSettings.tempo
  ): TimelinePosition {
    const ticksPerSecond = (tempo * 480) / 60;
    const totalTicks = Math.round(seconds * ticksPerSecond);
    return TimelinePosition.fromTicks(totalTicks);
  }

  static fromMargin(margin: number): TimelinePosition {
    return TimelinePosition.fromTicks(margin);
  }

  static add(a: TimelinePosition, b: TimelinePosition): TimelinePosition {
    return a.add(b.bar, b.beat, b.tick);
  }

  static subtract(a: TimelinePosition, b: TimelinePosition): TimelinePosition {
    const totalTicks = Math.max(0, a.toTicks() - b.toTicks());
    return TimelinePosition.fromTicks(totalTicks);
  }

  static compare(a: TimelinePosition, b: TimelinePosition): number {
    return a.compareTo(b);
  }

  static get start(): TimelinePosition {
    return new TimelinePosition(0, 0, 0);
  }

  static max(a: TimelinePosition, b: TimelinePosition): TimelinePosition {
    return a.compareTo(b) >= 0 ? a : b;
  }

  static min(a: TimelinePosition, b: TimelinePosition): TimelinePosition {
    return a.compareTo(b) <= 0 ? a : b;
  }

  static measureMargin(value: number): {
    measures: number;
    beats: number;
    fraction: number;
  } {
    const bars = Math.floor(value / (4 * 480));
    let remainingTicks = value % (4 * 480);

    const beats = Math.floor(remainingTicks / 480);
    remainingTicks = remainingTicks % 480;

    const fraction = Math.floor(remainingTicks / 120);

    return { measures: bars, beats, fraction };
  }

  static toSeconds(
    position: TimelinePosition,
    tempo: number = TimelinePosition.defaultSettings.tempo
  ): number {
    return position.toSeconds(tempo);
  }

  static addSeconds(
    position: TimelinePosition,
    seconds: number,
    tempo: number = TimelinePosition.defaultSettings.tempo
  ): TimelinePosition {
    const additionalTicks = Math.round((seconds * (tempo * 480)) / 60);
    return TimelinePosition.fromTicks(position.toTicks() + additionalTicks);
  }

  // Add missing static methods
  static parseFromString(str: string): TimelinePosition {
    // Parse format "bar:beat:tick" or similar
    const parts = str.split(':').map(Number);
    if (parts.length >= 3) {
      return new TimelinePosition(parts[0] || 0, parts[1] || 0, parts[2] || 0);
    }
    return new TimelinePosition(0, 0, 0);
  }

  toDisplayString(): string {
    return `${this.bar}:${this.beat}:${Math.floor(this.tick / 120)}`;
  }

  static toDisplayString(position: TimelinePosition): string {
    return position.toDisplayString();
  }

  static durationToSpan(duration: number): number {
    // Convert duration (in beats) to span (in ticks)
    return duration * 480;
  }

  static fractionToSpan(fraction: number): number {
    // Convert fraction (in milliseconds) to span (in ticks)
    return fraction * 480 / 1000;
  }
}

export interface AutomationLane {
  id: string;
  envelope: AutomationLaneEnvelope;
  enabled: boolean;
  expanded: boolean;
  label: string;
  minValue: number;
  maxValue: number;
  nodes: AutomationNode[];
  show: boolean;
}

export interface AutomationNode {
  id: string;
  pos: TimelinePosition;
  value: number;
}

export interface Clip {
  id: string;
  name: string;
  type: TrackType;
  start: TimelinePosition;
  end: TimelinePosition;
  loopEnd: TimelinePosition;
  startLimit?: TimelinePosition;
  endLimit?: TimelinePosition;
  muted: boolean;
  audio?: {
    audioBuffer: AudioBuffer;
    buffer: AudioBuffer;
    waveform: number[];
    start: TimelinePosition;
    end: TimelinePosition;
  };
}

// Effects Types
export interface BaseEffect {
  id: string;
  name: string;
  enabled: boolean;
  type: "native" | "juce" | "python";
}

export interface Effect extends BaseEffect {
  parameters: Record<string, any>;
}

export interface FXChainPreset {
  id: string;
  name: string;
  effects: Effect[];
}

// Context Menu Types
export enum ContextMenuType {
  AddAutomationLane = "add-automation-lane",
  Automation = "automation",
  Clip = "clip",
  FXChainPreset = "fx-chain-preset",
  Lane = "lane",
  Node = "node",
  Region = "region",
  Text = "text",
  Timeline = "timeline",
  Track = "track",
}
