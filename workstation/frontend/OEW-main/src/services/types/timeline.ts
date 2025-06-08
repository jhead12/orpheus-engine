export interface TimelineSettings {
  tempo: number;
  timeSignature: { beats: number; noteValue: number };
  snap: boolean;
  snapUnit: "beat" | "bar" | "sixteenth";
  horizontalScale: number;
}

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

  get fraction(): number {
    return this.sixteenth;
  }

  get measure(): number {
    return this.bar;
  }

  add(bars: number, beats: number, ticks: number): TimelinePosition {
    let resultTick = this.tick + ticks;
    let resultBeat = this.beat + beats;
    let resultBar = this.bar + bars;

    if (resultTick >= 480) {
      resultBeat += Math.floor(resultTick / 480);
      resultTick %= 480;
    }

    if (resultBeat >= 4) {
      resultBar += Math.floor(resultBeat / 4);
      resultBeat %= 4;
    }

    return new TimelinePosition(resultBar, resultBeat, resultTick);
  }

  copy(): TimelinePosition {
    return new TimelinePosition(this.bar, this.beat, this.tick);
  }

  compareTo(other: TimelinePosition): number {
    if (this.bar !== other.bar) return this.bar - other.bar;
    if (this.beat !== other.beat) return this.beat - other.beat;
    return this.tick - other.tick;
  }

  equals(other: TimelinePosition): boolean {
    return (
      this.bar === other.bar &&
      this.beat === other.beat &&
      this.tick === other.tick
    );
  }

  toTicks(): number {
    return this.bar * 4 * 480 + this.beat * 480 + this.tick;
  }

  toMargin(): number {
    return this.toTicks();
  }

  toSeconds(tempo: number = TimelinePosition.defaultSettings.tempo): number {
    const ticksPerSecond = (tempo * 480) / 60;
    return this.toTicks() / ticksPerSecond;
  }

  /**
   * Calculate absolute difference between margins of two positions
   */
  diffInMargin(other: TimelinePosition): number {
    return Math.abs(this.toMargin() - other.toMargin());
  }

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

  translate(
    delta: { measures: number; beats: number; fraction: number; sign: number },
    applySnap?: boolean
  ): TimelinePosition {
    let totalTicks = this.toTicks();
    const deltaTicks =
      (delta.measures * 4 * 480 + delta.beats * 480 + delta.fraction * 120) *
      delta.sign;

    totalTicks += deltaTicks;
    totalTicks = Math.max(0, totalTicks);

    let newPosition = TimelinePosition.fromTicks(totalTicks);
    if (applySnap) {
      newPosition = newPosition.snap(1);
    }
    return newPosition;
  }

  diff(other: TimelinePosition): {
    measures: number;
    beats: number;
    fraction: number;
    sign: number;
  } {
    const thisTicks = this.toTicks();
    const otherTicks = other.toTicks();
    const diffTicks = thisTicks - otherTicks;
    const sign = Math.sign(diffTicks);
    const absDiffTicks = Math.abs(diffTicks);

    const measures = Math.floor(absDiffTicks / (4 * 480));
    let remainingTicks = absDiffTicks % (4 * 480);

    const beats = Math.floor(remainingTicks / 480);
    remainingTicks = remainingTicks % 480;

    const fraction = Math.floor(remainingTicks / 120);

    return { measures, beats, fraction, sign };
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
}
