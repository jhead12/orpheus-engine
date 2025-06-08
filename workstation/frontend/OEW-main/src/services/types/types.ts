import { TimelinePosition } from "../../types/core";
import { AudioAnalysisType as CoreAudioAnalysisType } from "../../types/audio";

// Re-export TimelinePosition from the core types
export { TimelinePosition } from "../../types/core";
// Export unified AudioAnalysisType to ensure consistency across the app
export { AudioAnalysisType } from "../../types/audio";

export enum AutomationLaneEnvelope {
  Volume = "volume",
  Pan = "pan",
  Send = "send",
  Filter = "filter",
  Tempo = "tempo",
  Effect = "effect",
}

export enum AutomationMode {
  Off = "off",
  Read = "read",
  Write = "write",
  Touch = "touch",
  Latch = "latch",
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

export interface BaseClipComponentProps {
  clip: Clip;
  height: number;
  onChangeLane: (clip: Clip, track: Track) => void;
  onSetClip: (clip: Clip) => void;
  track: Track;
}

export enum ContextMenuType {
  Clip = "clip",
  Region = "region",
  Track = "track",
  Lane = "lane",
  Node = "node",
  Text = "text",
  FXChainPreset = "fxChainPreset",
  AddAutomationLane = "addAutomationLane",
  Automation = "automation",
}

export enum TrackType {
  Audio = "audio",
  Midi = "midi",
  Sequencer = "sequencer",
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

export interface Effect {
  id: string;
  name: string;
  enabled: boolean;
  type: "native" | "juce" | "python";
  parameters: Record<string, any>;
}

export interface FXChainPreset {
  id: string;
  name: string;
  effects: Effect[];
}

export interface Region {
  start: TimelinePosition;
  end: TimelinePosition;
}

// Audio search exports (placeholder)
export interface SearchResult {
  id: string;
  name: string;
  path: string;
  type: string;
}
