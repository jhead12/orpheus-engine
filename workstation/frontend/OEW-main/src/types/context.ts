import { Track, TimelinePosition, Region, Clip } from "./core";
import {
  SnapGridSizeOption,
  AudioAnalysisType,
  AudioAnalysisResults,
} from "./audio";

export interface WorkstationContextType {
  addTrack: (type: string) => void;
  adjustNumMeasures: (num: number) => void;
  createAudioClip: (file: File) => Promise<void>;
  createClipFromTrackRegion: () => void;
  insertClips: (clips: any[]) => void;
  isPlaying: boolean;
  masterTrack: Track;
  maxPos: TimelinePosition;
  numMeasures: number;
  playheadPos: TimelinePosition;
  scrollToItem: any;
  setAllowMenuAndShortcuts: (allow: boolean) => void;
  setPlayheadPos: (pos: TimelinePosition) => void;
  setScrollToItem: (item: any) => void;
  setSongRegion: (region: Region) => void;
  setTrack: (track: Track) => void;
  setTracks: (tracks: Track[]) => void;
  setVerticalScale: (scale: number) => void;
  snapGridSize: SnapGridSizeOption;
  songRegion: Region | null;
  timelineSettings: {
    beatWidth: number;
    timeSignature: { beats: number; noteValue: number };
    horizontalScale: number;
  };
  tracks: Track[];
  updateTimelineSettings: (settings: any) => void;
  verticalScale: number;
}

export interface AnalysisContextType {
  analysisType: AudioAnalysisType;
  analysisResults: AudioAnalysisResults | null;
  selectedClip: Clip | null;
  setAnalysisType: (type: AudioAnalysisType) => void;
  setSelectedClip: (clip: Clip | null) => void;
  runAudioAnalysis: (
    buffer: AudioBuffer,
    type: AudioAnalysisType
  ) => Promise<AudioAnalysisResults | null>;
}
