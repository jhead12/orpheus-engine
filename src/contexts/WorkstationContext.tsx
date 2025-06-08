import React, { createContext, useState, useCallback } from "react";
import { Track, TimelineSettings, TimelinePosition } from "../types";

export interface WorkstationContextType {
  tracks: Track[];
  masterTrack: Track | null;
  playheadPos: TimelinePosition;
  maxPos: TimelinePosition;
  numMeasures: number;
  snapGridSize: number;
  songRegion: { start: TimelinePosition; end: TimelinePosition } | null;
  verticalScale: number;
  timelineSettings: TimelineSettings;
  isPlaying: boolean;
  scrollToItem: any | null;
  allowMenuAndShortcuts: boolean;
  setTracks: (tracks: Track[]) => void;
  setPlayheadPos: (pos: TimelinePosition) => void;
  setSongRegion: (
    region: { start: TimelinePosition; end: TimelinePosition } | null
  ) => void;
  setVerticalScale: (scale: number) => void;
  setScrollToItem: (item: any | null) => void;
  setAllowMenuAndShortcuts: (allow: boolean) => void;
  addTrack: (track: Track) => void;
  adjustNumMeasures: (num: number) => void;
  createAudioClip: (buffer: AudioBuffer, track: Track) => void;
  insertClips: (clips: any[], track: Track) => void;
  updateTimelineSettings: (settings: Partial<TimelineSettings>) => void;
}

export const WorkstationContext = createContext<WorkstationContextType>({
  tracks: [],
  masterTrack: null,
  playheadPos: 0,
  maxPos: 0,
  numMeasures: 4,
  snapGridSize: 1,
  songRegion: null,
  verticalScale: 1,
  timelineSettings: {
    bpm: 120,
    timeSignature: [4, 4],
    snapToGrid: true,
    gridSubdivision: 4,
  },
  isPlaying: false,
  scrollToItem: null,
  allowMenuAndShortcuts: true,
  setTracks: () => {},
  setPlayheadPos: () => {},
  setSongRegion: () => {},
  setVerticalScale: () => {},
  setScrollToItem: () => {},
  setAllowMenuAndShortcuts: () => {},
  addTrack: () => {},
  adjustNumMeasures: () => {},
  createAudioClip: () => {},
  insertClips: () => {},
  updateTimelineSettings: () => {},
});
