import React, { createContext, useContext, useState } from 'react';
import { Track, TimelinePosition, Region } from '../types/core';
import { SnapGridSizeOption } from '../types/audio';
import { WorkstationContextType } from '../types/context';

const WorkstationContext = createContext<WorkstationContextType | undefined>(undefined);

export const useWorkstation = () => {
  const context = useContext(WorkstationContext);
  if (context === undefined) {
    throw new Error('useWorkstation must be used within a WorkstationProvider');
  }
  return context;
};

export const WorkstationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [masterTrack] = useState<Track>({} as Track);
  const [playheadPos, setPlayheadPos] = useState(new TimelinePosition());
  const [songRegion, setSongRegion] = useState<Region | null>(null);
  const [numMeasures, setNumMeasures] = useState(4);
  const [verticalScale, setVerticalScale] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [allowMenuAndShortcuts, setAllowMenuAndShortcuts] = useState(true);
  const [scrollToItem, setScrollToItem] = useState<any>(null);

  const value: WorkstationContextType = {
    addTrack: (type: string) => {
      // Implementation
    },
    adjustNumMeasures: (num: number) => setNumMeasures(num),
    createAudioClip: async (file: File) => {
      // Implementation
    },
    createClipFromTrackRegion: () => {
      // Implementation
    },
    insertClips: (clips: any[]) => {
      // Implementation
    },
    isPlaying,
    masterTrack,
    maxPos: new TimelinePosition(),
    numMeasures,
    playheadPos,
    scrollToItem,
    setAllowMenuAndShortcuts,
    setPlayheadPos,
    setScrollToItem,
    setSongRegion,
    setTrack: (track: Track) => {
      // Implementation
    },
    setTracks,
    setVerticalScale,
    snapGridSize: 0,
    songRegion,
    timelineSettings: {
      beatWidth: 40,
      timeSignature: { beats: 4, value: 4 }
    },
    tracks,
    updateTimelineSettings: (settings: any) => {
      // Implementation
    },
    verticalScale
  };

  return (
    <WorkstationContext.Provider value={value}>
      {children}
    </WorkstationContext.Provider>
  );
};

export default WorkstationContext;
