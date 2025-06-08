import { createContext } from "react";
import { TimelinePosition, Track, Clip } from "../services/types/types";

export interface WorkstationContextType {
  adjustNumMeasures: (pos?: TimelinePosition) => void;
  allowMenuAndShortcuts: boolean;
  consolidateClip: (clip: Clip) => void;
  deleteClip: (clip: Clip) => void;
  duplicateClip: (clip: Clip) => void;
  playheadPos: TimelinePosition;
  scrollToItem: { type: string; params: Record<string, any> } | null;
  selectedClipId: string | null;
  setAllowMenuAndShortcuts: (allow: boolean) => void;
  setScrollToItem: (
    item: { type: string; params: Record<string, any> } | null
  ) => void;
  setSelectedClipId: (id: string | null) => void;
  setSongRegion: (
    region: { start: TimelinePosition; end: TimelinePosition } | null
  ) => void;
  setTrackRegion: (
    region: { start: TimelinePosition; end: TimelinePosition } | null
  ) => void;
  snapGridSize: TimelinePosition;
  splitClip: (clip: Clip, position: TimelinePosition) => void;
  timelineSettings: {
    beatWidth: number;
    timeSignature: { beats: number; noteValue: number };
    horizontalScale: number;
  };
  toggleMuteClip: (clip: Clip) => void;
  tracks: Track[];
  verticalScale: number;

  // Missing properties from Editor.tsx
  addTrack: (track?: Partial<Track>) => void;
  createAudioClip: (
    file: File,
    trackId: string,
    position: TimelinePosition
  ) => Promise<void>;
  insertClips: (
    clips: Clip[],
    trackId: string,
    position: TimelinePosition
  ) => void;
  masterTrack: Track;
  maxPos: TimelinePosition;
  numMeasures: number;
  setPlayheadPos: (pos: TimelinePosition) => void;
  setTracks: (tracks: Track[]) => void;
  setVerticalScale: (scale: number) => void;
  songRegion: { start: TimelinePosition; end: TimelinePosition } | null;
  updateTimelineSettings: (updater: (prev: any) => any) => void;
  isPlaying: boolean;
}

export const WorkstationContext = createContext<WorkstationContextType | null>(
  null
);
