import React, { createContext, useContext, useState, useCallback, useRef, ReactNode } from "react";
import { v4 as uuidv4 } from "uuid";
import { 
  TimelinePosition, 
  Track, 
  Clip, 
  TrackType, 
  TimelineSettings,
  Region,
  AutomationMode
} from "../types/core";

export interface WorkstationContextType {
  // Track management
  addTrack: (type: TrackType) => void;
  tracks: Track[];
  setTracks: (tracks: Track[]) => void;
  masterTrack: Track | null;
  
  // Clip management
  createAudioClip: (file: any, position: TimelinePosition) => Promise<Clip | null>;
  insertClips: (clips: Clip[], track: Track) => void;
  consolidateClip: (clip: Clip) => void;
  deleteClip: (clip: Clip) => void;
  duplicateClip: (clip: Clip) => void;
  splitClip: (clip: Clip, position: TimelinePosition) => void;
  toggleMuteClip: (clip: Clip) => void;
  selectedClipId: string | null;
  setSelectedClipId: (id: string | null) => void;
  
  // Timeline and playback
  playheadPos: TimelinePosition;
  setPlayheadPos: (pos: TimelinePosition) => void;
  timelineSettings: TimelineSettings;
  updateTimelineSettings: (settings: Partial<TimelineSettings> | ((prev: TimelineSettings) => TimelineSettings)) => void;
  isPlaying: boolean;
  
  // Project structure
  numMeasures: number;
  adjustNumMeasures: (pos?: TimelinePosition) => void;
  maxPos: TimelinePosition;
  snapGridSize: TimelinePosition;
  
  // UI state
  verticalScale: number;
  setVerticalScale: (scale: number | ((prev: number) => number)) => void;
  allowMenuAndShortcuts: boolean;
  setAllowMenuAndShortcuts: (allow: boolean) => void;
  scrollToItem: { type: string; params: Record<string, any> } | null;
  setScrollToItem: (item: { type: string; params: Record<string, any> } | null) => void;
  
  // Regions
  songRegion: Region | null;
  setSongRegion: (region: Region | null) => void;
  trackRegion: Region | null;
  setTrackRegion: (region: Region | null) => void;
}

const WorkstationContext = createContext<WorkstationContextType | null>(null);

export interface WorkstationProviderProps {
  children: ReactNode;
}

export function WorkstationProvider({ children }: WorkstationProviderProps) {
  // State
  const [tracks, setTracksState] = useState<Track[]>([]);
  const [playheadPos, setPlayheadPos] = useState<TimelinePosition>(new TimelinePosition(0, 0, 0));
  const [timelineSettings, setTimelineSettings] = useState<TimelineSettings>({
    tempo: 120,
    timeSignature: { beats: 4, noteValue: 4 },
    snap: true,
    snapUnit: "beat",
    horizontalScale: 1,
    beatWidth: 60
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [numMeasures, setNumMeasures] = useState(16);
  const [verticalScale, setVerticalScale] = useState(1);
  const [allowMenuAndShortcuts, setAllowMenuAndShortcuts] = useState(true);
  const [scrollToItem, setScrollToItem] = useState<{ type: string; params: Record<string, any> } | null>(null);
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null);
  const [songRegion, setSongRegion] = useState<Region | null>(null);
  const [trackRegion, setTrackRegion] = useState<Region | null>(null);
  
  // Refs
  const audioContext = useRef<AudioContext | null>(null);

  // Computed values
  const maxPos = new TimelinePosition(numMeasures, 0, 0);
  const snapGridSize = new TimelinePosition(0, 1, 0); // Default to beat snap
  const masterTrack: Track | null = tracks.find(t => t.id === 'master') || null;

  // Track management
  const addTrack = useCallback((type: TrackType) => {
    const newTrack: Track = {
      id: uuidv4(),
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} Track ${tracks.length + 1}`,
      type,
      color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
      mute: false,
      solo: false,
      armed: false,
      volume: 0.8,
      pan: 0,
      automation: false,
      automationMode: AutomationMode.Read,
      automationLanes: [],
      clips: [],
      effects: [],
      fx: {
        preset: null,
        selectedEffectIndex: 0,
        effects: []
      }
    };
    
    setTracksState(prev => [...prev, newTrack]);
  }, [tracks.length]);

  const setTracks = useCallback((newTracks: Track[]) => {
    setTracksState(newTracks);
  }, []);

  // Clip management
  const createAudioClip = useCallback(async (file: any, position: TimelinePosition): Promise<Clip | null> => {
    try {
      // This is a simplified implementation - in a real app, you'd process the audio file
      const clip: Clip = {
        id: uuidv4(),
        name: file.name || 'Audio Clip',
        type: TrackType.Audio,
        start: position,
        end: position.add(0, 4, 0), // Default 4 beats duration
        loopEnd: position.add(0, 4, 0),
        muted: false,
        audio: {
          audioBuffer: null as any, // Would be populated with actual audio data
          buffer: null as any,
          waveform: [],
          start: position,
          end: position.add(0, 4, 0)
        }
      };
      return clip;
    } catch (error) {
      console.error('Failed to create audio clip:', error);
      return null;
    }
  }, [timelineSettings.tempo]);

  const insertClips = useCallback((clips: Clip[], track: Track) => {
    setTracksState(prev => prev.map(t => 
      t.id === track.id 
        ? { ...t, clips: [...t.clips, ...clips] }
        : t
    ));
  }, []);

  const consolidateClip = useCallback((clip: Clip) => {
    // Implementation would consolidate the clip's audio
    console.log('Consolidating clip:', clip.id);
  }, []);

  const deleteClip = useCallback((clip: Clip) => {
    setTracksState(prev => prev.map(track => ({
      ...track,
      clips: track.clips.filter(c => c.id !== clip.id)
    })));
  }, []);

  const duplicateClip = useCallback((clip: Clip) => {
    const duplicatedClip: Clip = {
      ...clip,
      id: uuidv4(),
      name: `${clip.name} Copy`,
      start: clip.end,
      end: clip.end.add(
        clip.end.bar - clip.start.bar,
        clip.end.beat - clip.start.beat,
        clip.end.tick - clip.start.tick
      )
    };

    setTracksState(prev => prev.map(track => 
      track.id === clip.trackId 
        ? { ...track, clips: [...track.clips, duplicatedClip] }
        : track
    ));
  }, []);

  const splitClip = useCallback((clip: Clip, position: TimelinePosition) => {
    const clip1: Clip = { ...clip, end: position };
    const clip2: Clip = { 
      ...clip, 
      id: uuidv4(),
      start: position,
      name: `${clip.name} (2)`
    };

    setTracksState(prev => prev.map(track => 
      track.id === clip.trackId 
        ? { 
            ...track, 
            clips: track.clips.map(c => c.id === clip.id ? clip1 : c).concat(clip2)
          }
        : track
    ));
  }, []);

  const toggleMuteClip = useCallback((clip: Clip) => {
    setTracksState(prev => prev.map(track => ({
      ...track,
      clips: track.clips.map(c => 
        c.id === clip.id ? { ...c, muted: !c.muted } : c
      )
    })));
  }, []);

  // Timeline management
  const updateTimelineSettings = useCallback((
    settings: Partial<TimelineSettings> | ((prev: TimelineSettings) => TimelineSettings)
  ) => {
    if (typeof settings === 'function') {
      setTimelineSettings(settings);
    } else {
      setTimelineSettings(prev => ({ ...prev, ...settings }));
    }
  }, []);

  const adjustNumMeasures = useCallback((pos?: TimelinePosition) => {
    if (pos) {
      const requiredMeasures = pos.bar + 4; // Add some buffer
      if (requiredMeasures > numMeasures) {
        setNumMeasures(requiredMeasures);
      }
    }
  }, [numMeasures]);

  const contextValue: WorkstationContextType = {
    // Track management
    addTrack,
    tracks,
    setTracks,
    masterTrack,
    
    // Clip management
    createAudioClip,
    insertClips,
    consolidateClip,
    deleteClip,
    duplicateClip,
    splitClip,
    toggleMuteClip,
    selectedClipId,
    setSelectedClipId,
    
    // Timeline and playback
    playheadPos,
    setPlayheadPos,
    timelineSettings,
    updateTimelineSettings,
    isPlaying,
    
    // Project structure
    numMeasures,
    adjustNumMeasures,
    maxPos,
    snapGridSize,
    
    // UI state
    verticalScale,
    setVerticalScale,
    allowMenuAndShortcuts,
    setAllowMenuAndShortcuts,
    scrollToItem,
    setScrollToItem,
    
    // Regions
    songRegion,
    setSongRegion,
    trackRegion,
    setTrackRegion
  };

  return (
    <WorkstationContext.Provider value={contextValue}>
      {children}
    </WorkstationContext.Provider>
  );
}

export function useWorkstation() {
  const context = useContext(WorkstationContext);
  if (!context) {
    throw new Error('useWorkstation must be used within a WorkstationProvider');
  }
  return context;
}

export { WorkstationContext };