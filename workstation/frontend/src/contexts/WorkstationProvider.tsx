import React, { createContext, useContext, useState, ReactNode } from 'react';
import { 
  Clip,
  TrackType, 
  Track,
  Region,
  TimelinePosition,
  TimelineSettings,
  TimeSignature
} from '../services/types/types';

interface WorkstationContextType {
  tracks: Track[];
  play: () => void;
  stop: () => void;
  record: () => void;
  addTrack: (type: TrackType) => void;
  removeTrack: (id: string) => void;
  addClip: (trackId: string, clip: Clip) => void;
  removeClip: (trackId: string, clipId: string) => void;
  timelineSettings: TimelineSettings;
  currentPosition: TimelinePosition;
  isPlaying: boolean;
  isRecording: boolean;
}

const defaultTimelineSettings: TimelineSettings = {
  tempo: 120,
  timeSignature: {
    beats: 4,
    noteValue: 4
  },
  snap: true,
  snapUnit: 'beat'
};

const WorkstationContext = createContext<WorkstationContextType | undefined>(undefined);

export const WorkstationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(new TimelinePosition(1, 1, 0));
  const [timelineSettings] = useState<TimelineSettings>(defaultTimelineSettings);

  const play = () => {
    setIsPlaying(true);
    // Implement playback logic
  };

  const stop = () => {
    setIsPlaying(false);
    // Implement stop logic
  };

  const record = () => {
    setIsRecording(!isRecording);
    // Implement recording logic
  };

  const addTrack = (type: TrackType) => {
    const newTrack: Track = {
      id: Math.random().toString(),
      name: `Track ${tracks.length + 1}`,
      type,
      clips: [],
      mute: false,
      solo: false,
      volume: 1,
      pan: 0,
    };
    setTracks([...tracks, newTrack]);
  };

  const removeTrack = (id: string) => {
    setTracks(tracks.filter(track => track.id !== id));
  };

  const addClip = (trackId: string, clip: Clip) => {
    setTracks(tracks.map(track => 
      track.id === trackId 
        ? { ...track, clips: [...track.clips, clip] }
        : track
    ));
  };

  const removeClip = (trackId: string, clipId: string) => {
    setTracks(tracks.map(track => 
      track.id === trackId 
        ? { ...track, clips: track.clips.filter(clip => clip.id !== clipId) }
        : track
    ));
  };

  const value: WorkstationContextType = {
    tracks,
    play,
    stop,
    record,
    addTrack,
    removeTrack,
    addClip,
    removeClip,
    timelineSettings,
    currentPosition,
    isPlaying,
    isRecording,
  };

  return (
    <WorkstationContext.Provider value={value}>
      {children}
    </WorkstationContext.Provider>
  );
};

export const useWorkstation = () => {
  const context = useContext(WorkstationContext);
  if (!context) {
    throw new Error('useWorkstation must be used within a WorkstationProvider');
  }
  return context;
};

export default WorkstationProvider;
