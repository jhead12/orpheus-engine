import {
  TimelinePosition,
  TrackType as CoreTrackType,
  AutomationMode as CoreAutomationMode,
  AutomationLaneEnvelope as CoreAutomationLaneEnvelope,
  Track as CoreTrack,
  AutomationLane as CoreAutomationLane,
  AutomationNode as CoreAutomationNode,
  Clip as CoreClip,
  Effect as CoreEffect,
  FXChainPreset as CoreFXChainPreset,
} from '../../types/core';
import { AudioAnalysisType } from '../../types/audio';

// Re-export from core types
export { TimelinePosition, AudioAnalysisType };

// Use core enums
export { CoreTrackType as TrackType };
export { CoreAutomationMode as AutomationMode };
export { CoreAutomationLaneEnvelope as AutomationLaneEnvelope };

// Use core types
export type Track = CoreTrack;
export type AutomationNode = CoreAutomationNode;
export type AutomationLane = CoreAutomationLane;
export type Clip = CoreClip;
export type Effect = CoreEffect;
export type FXChainPreset = CoreFXChainPreset;

export interface BaseClipComponentProps {
  clip: Clip;
  height: number;
  onChangeLane: (clip: Clip, track: Track) => void;
  onSetClip: (clip: Clip) => void;
  track: Track;
}

export enum ContextMenuType {
  Clip = 'clip',
  Region = 'region',
  Track = 'track',
  Lane = 'lane',
  Node = 'node',
  Text = 'text',
  FXChainPreset = 'fxChainPreset',
  AddAutomationLane = 'addAutomationLane',
  Automation = 'automation',
}

// Audio search exports (placeholder)
export interface SearchResult {
  id: string;
  name: string;
  path: string;
  type: string;
}
