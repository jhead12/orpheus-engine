import React, { createContext, useContext, useState, useRef, ReactNode, useEffect } from 'react';
import { Track, Clip, TimelinePosition, TrackType } from '../services/types/types';
import { useMixer } from './MixerContext';

interface AudioService {
  getWaveformData: () => Promise<Float32Array>;
  getFrequencyData: () => Promise<Float32Array>;
  play: (buffer?: AudioBuffer) => void;
  stop: () => void;
  dispose: () => void;
}

interface ClipService {
  createClip: (data: any) => Clip;
  processClip: (clip: Clip) => void;
}

interface AudioExporter {
  export: (data: any) => Promise<void>;
}

interface DAWContextType {
  isReady: boolean;
  currentTrack: Track | null;
  currentClip: Clip | null;
  tracks: Track[];
  clips: Map<string, Clip[]>;
  playbackPosition: TimelinePosition;
  isPlaying: boolean;
  isRecording: boolean;
  setCurrentTrack: (track: Track | null) => void;
  setCurrentClip: (clip: Clip | null) => void;
  addTrack: (name: string, type: TrackType) => Track;
  removeTrack: (trackId: string) => void;
  addClip: (trackId: string, clip: Clip) => void;
  removeClip: (trackId: string, clipId: string) => void;
  startPlayback: (startPosition?: TimelinePosition) => void;
  stopPlayback: () => void;
  startRecording: (trackId: string, deviceId?: string) => Promise<void>;
  stopRecording: () => Promise<Clip | null>;
  exportProject: (options?: any) => Promise<void>;
  togglePlayback: () => void;
  currentPosition: TimelinePosition;
  setPosition: (position: TimelinePosition) => void;
  audioService: AudioService;
  clipService: ClipService;
}

const DAWContext = createContext<DAWContextType | undefined>(undefined);

export const DAWProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isReady, setIsReady] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [currentClip, setCurrentClip] = useState<Clip | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [clips, setClips] = useState<Map<string, Clip[]>>(new Map());
  const [playbackPosition, setPlaybackPosition] = useState(() => {
    const pos = new TimelinePosition();
    return pos;
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const mixer = useMixer();
  const audioServiceRef = useRef<AudioService>({
    getWaveformData: async () => new Float32Array(1024),
    getFrequencyData: async () => new Float32Array(1024), 
    play: () => {},
    stop: () => {},
    dispose: () => {}
  });
  
  const clipServiceRef = useRef<ClipService>({
    createClip: () => ({} as Clip),
    processClip: () => {}
  });
  
  const audioExporterRef = useRef<AudioExporter>({
    export: async () => {}
  });

  // Fix the audioContext issue
  useEffect(() => {
    const initAudio = async () => {
      try {
        const context = new (window.AudioContext || (window as any).webkitAudioContext)();
        setIsReady(true);
      } catch (error) {
        console.error('Failed to initialize audio context:', error);
      }
    };

    initAudio();

    return () => {
      // Cleanup
    };
  }, []);

  // Track management
  const addTrack = (name: string, type: TrackType): Track => {
    const track: Track = {
      id: crypto.randomUUID(),
      name,
      type,
      clips: [],
      mute: false,
      solo: false,
      volume: 1,
      pan: 0
    };
    setTracks(prev => [...prev, track]);
    setClips(prev => new Map(prev).set(track.id, []));
    return track;
  };

  const removeTrack = (trackId: string) => {
    setTracks(prev => prev.filter(t => t.id !== trackId));
    setClips(prev => {
      const newClips = new Map(prev);
      newClips.delete(trackId);
      return newClips;
    });
  };

  // Clip management
  const addClip = (trackId: string, clip: Clip) => {
    setClips(prev => {
      const newClips = new Map(prev);
      const trackClips = newClips.get(trackId) || [];
      newClips.set(trackId, [...trackClips, clip]);
      return newClips;
    });
  };

  const removeClip = (trackId: string, clipId: string) => {
    setClips(prev => {
      const newClips = new Map(prev);
      const trackClips = newClips.get(trackId) || [];
      newClips.set(trackId, trackClips.filter(c => c.id !== clipId));
      return newClips;
    });
  };

  // Playback control
  const startPlayback = (startPosition?: TimelinePosition) => {
    if (startPosition) {
      setPlaybackPosition(startPosition);
    }

    tracks.forEach(track => {
      const trackClips = clips.get(track.id) || [];
      // Schedule clips that should play
      trackClips.forEach(clip => {
        // Implementation for scheduling clips
      });
    });

    setIsPlaying(true);
  };

  const stopPlayback = () => {
    audioServiceRef.current.stop();
    setIsPlaying(false);
  };

  // Recording control
  const startRecording = async (trackId: string, deviceId?: string) => {
    if (!isReady) return;
    
    try {
      setIsRecording(true);
      // Implementation for starting recording
    } catch (error) {
      console.error('Recording failed:', error);
      setIsRecording(false);
    }
  };

  const stopRecording = async (): Promise<Clip | null> => {
    if (!isRecording) return null;

    try {
      setIsRecording(false);
      // Implementation for stopping recording and creating clip
      return null;
    } catch (error) {
      console.error('Stop recording failed:', error);
    }

    return null;
  };

  // Project export
  const exportProject = async (options: any = {}) => {
    // Implementation for project export
    console.log('Exporting project with options:', options);
  };

  // Additional methods for compatibility
  const togglePlayback = () => {
    if (isPlaying) {
      stopPlayback();
    } else {
      startPlayback();
    }
  };

  const setPosition = (position: TimelinePosition) => {
    setPlaybackPosition(position);
  };

  const value = {
    isReady,
    currentTrack,
    currentClip,
    tracks,
    clips,
    playbackPosition,
    isPlaying,
    isRecording,
    setCurrentTrack,
    setCurrentClip,
    addTrack,
    removeTrack,
    addClip,
    removeClip,
    startPlayback,
    stopPlayback,
    startRecording,
    stopRecording,
    exportProject,
    togglePlayback,
    currentPosition: playbackPosition,
    setPosition,
    audioService: audioServiceRef.current,
    clipService: clipServiceRef.current,
  };

  return (
    <DAWContext.Provider value={value}>
      {children}
    </DAWContext.Provider>
  );
};

export const useDAW = () => {
  const context = useContext(DAWContext);
  if (!context) {
    throw new Error('useDAW must be used within a DAWProvider');
  }
  return context;
};

export default DAWProvider;
