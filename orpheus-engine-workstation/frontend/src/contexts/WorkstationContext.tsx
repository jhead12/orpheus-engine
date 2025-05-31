import { createContext } from "react";
import {
  AutomationLane,
  AutomationLaneEnvelope,
  AutomationNode,
  Clip,
  ClipAudio,
  ContextMenuType,
  FXChainPreset,
  Region,
  SnapGridSizeOption,
  TimelinePosition,
  TimelineSettings,
  TimeSignature,
  Track,
  TrackType,
  WorkstationAudioInputFile,
} from "../types/types"; // Updated import path to local types

export interface ScrollToItem {
  pos: TimelinePosition;
  zoomToFit?: boolean;
}

export enum ClipboardItemType {
  Clip = "clip",
  Node = "node",
}

export interface ClipboardItem {
  item: any;
  type: ClipboardItemType;
}

export interface WorkstationContextProps {
  allowMenuAndShortcuts: boolean;
  setAllowMenuAndShortcuts: (allowMenuAndShortcuts: boolean) => void;
  fxChainPresets: FXChainPreset[];
  setFXChainPresets: (fxChainPresets: FXChainPreset[]) => void;
  isLooping: boolean;
  setIsLooping: (isLooping: boolean) => void;
  isPlaying: boolean;
  setIsPlaying: (isPlaying: boolean) => void;
  isRecording: boolean;
  setIsRecording: (isRecording: boolean) => void;
  masterTrack: Track;
  setMasterTrack: (masterTrack: Track) => void;
  metronome: boolean;
  setMetronome: (metronome: boolean) => void;
  mixerHeight: number;
  setMixerHeight: (mixerHeight: number) => void;
  numMeasures: number;
  setNumMeasures: (numMeasures: number) => void;
  playheadPos: TimelinePosition;
  setPlayheadPos: (playheadPos: TimelinePosition) => void;
  scrollToItem: ScrollToItem | null;
  setScrollToItem: (scrollToItem: ScrollToItem | null) => void;
  selectedClipId: string | null;
  setSelectedClipId: (selectedClipId: string | null) => void;
  selectedNodeId: string | null;
  setSelectedNodeId: (selectedNodeId: string | null) => void;
  selectedTrackId: string | null;
  setSelectedTrackId: (selectedTrackId: string | null) => void;
  showMaster: boolean;
  setShowMaster: (showMaster: boolean) => void;
  showMixer: boolean;
  setShowMixer: (showMixer: boolean) => void;
  showTimeRuler: boolean;
  setShowTimeRuler: (showTimeRuler: boolean) => void;
  songRegion: Region | null;
  setSongRegion: (songRegion: Region | null) => void;
  snapGridSize: { measures: number; beats: number; fraction: number };
  setSnapGridSize: (snapGridSize: {
    measures: number;
    beats: number;
    fraction: number;
  }) => void;
  snapGridSizeOption: SnapGridSizeOption;
  setSnapGridSizeOption: (snapGridSizeOption: SnapGridSizeOption) => void;
  stretchAudio: boolean;
  setStretchAudio: (stretchAudio: boolean) => void;
  trackRegion: { region: Region; trackId: string } | null;
  setTrackRegion: (trackRegion: { region: Region; trackId: string } | null) => void;
  tracks: Track[];
  setTracks: (tracks: Track[]) => void;
  verticalScale: number;
  setVerticalScale: (verticalScale: number) => void;
  timelineSettings: TimelineSettings;
  setTimelineSettings: (timelineSettings: TimelineSettings) => void;
  addNode: (track: Track, lane: AutomationLane, node: AutomationNode) => void;
  addTrack: (type: TrackType) => void;
  adjustNumMeasures: (pos?: TimelinePosition) => void;
  calculateNumMeasures: (pos: TimelinePosition) => number;
  consolidateClip: (clip: Clip) => void;
  consolidateClipAudio: (clip: Clip) => ClipAudio | null;
  createAudioClip: (buffer: AudioBuffer, start: number, end: number) => Promise<Clip>;
  createClipFromTrackRegion: () => void;
  deleteClip: (clip: Clip) => void;
  deleteNode: (node: AutomationNode) => void;
  deleteTrack: (track: Track) => void;
  duplicateClip: (clip: Clip) => void;
  duplicateTrack: (track: Track) => void;
  getTrackCurrentValue: (track: Track, lane: AutomationLane, pos: TimelinePosition) => number;
  handleDelete: () => void;
  insertClips: (newClips: Clip[], track: Track) => void;
  pasteClip: (pos: TimelinePosition, targetTrack?: Track) => void;
  pasteNode: (pos: TimelinePosition, targetLane?: AutomationLane) => void;
  setLane: (track: Track, lane: AutomationLane) => void;
  setTrack: (track: Track) => void;
  skipToEnd: () => void;
  skipToStart: () => void;
  splitClip: (clip: Clip, pos: TimelinePosition) => void;
  toggleMuteClip: (clip: Clip) => void;
  updateTimelineSettings: (timelineSettings: TimelineSettings) => void;
}

export const WorkstationContext = createContext<WorkstationContextProps | null>(null);