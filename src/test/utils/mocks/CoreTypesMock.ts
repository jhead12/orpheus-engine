/**
 * Core Types Mock
 * Provides consistent mocks for core enums and types
 */

// Define enums
export const TrackType = {
  Audio: "audio",
  Midi: "midi",
  Sequencer: "sequencer",
};

export const AutomationMode = {
  Read: "read",
  Write: "write", 
  Touch: "touch",
  Latch: "latch",
  Trim: "trim",
  Off: "off",
};

export const AutomationLaneEnvelope = {
  Volume: "volume",
  Pan: "pan",
  Send: "send",
  Filter: "filter",
  Tempo: "tempo",
  Effect: "effect",
};

export const ContextMenuType = {
  Track: "track",
  Mixer: "mixer",
  Timeline: "timeline",
  Clip: "clip",
  Node: "node",
  Region: "region",
  Lane: "lane",
  Automation: "automation",
  AddAutomationLane: "add-automation-lane",
  FXChainPreset: "fx-chain-preset"
};

// TimelinePosition mock
export class TimelinePosition {
  bar: number = 1;
  beat: number = 1;
  tick: number = 0;
  ticks: number = 0;

  static defaultSettings = {
    tempo: 120,
    timeSignature: { beats: 4, noteValue: 4 },
    snap: true,
    snapUnit: "beat",
    horizontalScale: 1
  };

  constructor(bar = 1, beat = 1, tick = 0) {
    this.bar = bar;
    this.beat = beat;
    this.tick = tick;
  }

  static fromTicks(ticks: number): TimelinePosition {
    return new TimelinePosition(1, 1, 0);
  }

  static fromSeconds(seconds: number): TimelinePosition {
    return new TimelinePosition(1, 1, 0);
  }

  toSeconds(): number {
    return 0;
  }

  toTicks(): number {
    return 0;
  }

  toMargin(): number {
    return 0;
  }

  fromMargin(margin: number): TimelinePosition {
    return this;
  }

  snap(): TimelinePosition {
    return this;
  }

  copy(): TimelinePosition {
    return new TimelinePosition(this.bar, this.beat, this.tick);
  }

  equals(other: TimelinePosition): boolean {
    return this.bar === other.bar && 
           this.beat === other.beat && 
           this.tick === other.tick;
  }

  add(other: TimelinePosition): TimelinePosition {
    return this;
  }
  
  compareTo(other: TimelinePosition): number {
    return 0;
  }

  toString(): string {
    return `${this.bar}:${this.beat}:${this.tick}`;
  }
}
