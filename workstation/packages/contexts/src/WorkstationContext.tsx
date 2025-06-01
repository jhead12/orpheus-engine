import React, { createContext, useContext } from 'react';

// Define basic types needed by the context
interface TimelinePosition {
  toMargin: () => number;
  snap: (gridSize: any, direction?: string) => TimelinePosition;
  copy: () => TimelinePosition;
}

interface Track {
  id: string;
  type: any;
  name: string;
}

interface Region {
  start: TimelinePosition;
  end: TimelinePosition;
}

interface TimelineSettings {
  horizontalScale: number;
  timeSignature: {
    beats: number;
    noteValue: number;
  };
}

interface Clip {
  id: string;
  name?: string;
  end: TimelinePosition;
}

// Define WorkstationContext type
export interface WorkstationContextType {
  addTrack: (type: any) => void;
  adjustNumMeasures: (pos?: TimelinePosition) => void;
  createAudioClip: (data: any, pos: TimelinePosition) => Promise<Clip>;
  insertClips: (clips: Clip[], track: Track) => void;
  masterTrack: Track;
  maxPos: TimelinePosition;
  numMeasures: number;
  playheadPos: TimelinePosition;
  scrollToItem: {type: string; params?: any} | null;
  setAllowMenuAndShortcuts: (allow: boolean) => void;
  setPlayheadPos: (pos: TimelinePosition) => void;
  setScrollToItem: (item: {type: string; params?: any} | null) => void;
  setSongRegion: (region: Region | null) => void;
  setTracks: (tracks: Track[]) => void;
  setVerticalScale: (scale: number) => void;
  snapGridSize: any;
  songRegion: Region | null;
  timelineSettings: TimelineSettings;
  tracks: Track[];
  updateTimelineSettings: (updater: (settings: TimelineSettings) => TimelineSettings) => void;
  verticalScale: number;
  isPlaying: boolean;
  registerPlugin: (plugin: any) => void;
  unregisterPlugin: (id: string) => void;
  saveWorkstation: (name: string) => Promise<string>;
  loadWorkstation: (id: string) => Promise<boolean>;
  listWorkstations: () => Promise<any[]>;
}

// Create context with better type safety
export const WorkstationContext = createContext<WorkstationContextType | null>(null);

// Create custom hook for using this context
export const useWorkstation = (): WorkstationContextType => {
  const context = useContext(WorkstationContext);
  if (!context) {
    throw new Error('useWorkstation must be used within a WorkstationProvider');
  }
  return context;
};

// Mock provider for development
export const WorkstationProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  // This is a placeholder implementation
  const contextValue = {
    addTrack: () => {},
    adjustNumMeasures: () => {},
    createAudioClip: async () => ({ id: '', end: { toMargin: () => 0, snap: () => ({}), copy: () => ({}) } }),
    insertClips: () => {},
    masterTrack: { id: 'master', type: 'MASTER', name: 'Master' },
    maxPos: { toMargin: () => 1000, snap: () => ({}), copy: () => ({}) },
    numMeasures: 16,
    playheadPos: { toMargin: () => 0, snap: () => ({}), copy: () => ({}) },
    scrollToItem: null,
    setAllowMenuAndShortcuts: () => {},
    setPlayheadPos: () => {},
    setScrollToItem: () => {},
    setSongRegion: () => {},
    setTracks: () => {},
    setVerticalScale: () => {},
    snapGridSize: {},
    songRegion: null,
    timelineSettings: { 
      horizontalScale: 1, 
      timeSignature: { beats: 4, noteValue: 4 } 
    },
    tracks: [],
    updateTimelineSettings: () => {},
    verticalScale: 1,
    isPlaying: false,
    registerPlugin: () => {},
    unregisterPlugin: () => {},
    saveWorkstation: async () => '',
    loadWorkstation: async () => true,
    listWorkstations: async () => []
  } as WorkstationContextType;
  
  return (
    <WorkstationContext.Provider value={contextValue}>
      {children}
    </WorkstationContext.Provider>
  );
};

export default WorkstationContext;
