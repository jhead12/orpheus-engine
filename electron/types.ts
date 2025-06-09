// Electron-specific types - standalone versions to avoid DOM dependencies

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

export enum ContextMenuType {
  Track = "track",
  Clip = "clip",
  Timeline = "timeline",
  Mixer = "mixer",
  AddAutomationLane = "add-automation-lane",
  Automation = "automation",
  FXChainPreset = "fx-chain-preset",
  Lane = "lane",
  Node = "node",
  Region = "region",
  Text = "text",
}

export interface AutomationLane {
  id: string;
  envelope: AutomationLaneEnvelope;
  points: { time: number; value: number }[];
  visible: boolean;
  show: boolean;
  label: string;
}

export interface Clip {
  id: string;
  name: string;
  trackId: string;
  start: number;
  end: number;
  offset: number;
  mute: boolean;
  muted: boolean;
  type: string;
  audio?: {
    filePath: string;
    duration: number;
  };
  fade?: {
    in: number;
    out: number;
  };
}

export interface Track {
  id: string;
  name: string;
  type: TrackType;
  color: string;
  mute: boolean;
  solo: boolean;
  armed: boolean;
  clips: Clip[];
  automationLanes: AutomationLane[];
}
