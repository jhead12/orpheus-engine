import { TimelinePosition, TimelineSettings } from "./timeline";

export enum AutomationLaneEnvelope {
  Volume = "volume",
  Pan = "pan",
  Send = "send",
  Filter = "filter",
  Tempo = "tempo",
}

export enum AutomationMode {
  Off = "off",
  Read = "read",
  Write = "write",
  Touch = "touch",
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
  fx: {
    preset: string | null;
    selectedEffectIndex: number;
    effects: Effect[];
  };
}

export interface Clip {
  id: string;
  name: string;
  type?: TrackType;
  start: TimelinePosition;
  end: TimelinePosition;
  loopEnd?: TimelinePosition;
  startLimit?: TimelinePosition;
  endLimit?: TimelinePosition;
  muted?: boolean;
  audio?: {
    audioBuffer: AudioBuffer;
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
