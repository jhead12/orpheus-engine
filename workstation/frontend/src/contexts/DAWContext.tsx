import React, { createContext, useContext, useState, useRef, useEffect, ReactNode } from 'react';
import { AudioService } from '../services/AudioService';
import { ClipService } from '../services/daw/clipService';
import { AudioExporter } from '../services/audio/audioExporter';
import { Track, Clip, TimelinePosition, TrackType } from '../services/types/types';
import { audioContext } from '../services/utils/audio';
import { useMixer } from './MixerContext';

interface DAWContextType {
  audioService: AudioService;
  clipService: ClipService;
  audioExporter: AudioExporter;
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
  // Additional missing properties
  togglePlayback: () => void;
  currentPosition: TimelinePosition;
  setPosition: (position: TimelinePosition) => void;
}

const DAWContext = createContext<DAWContextType | undefined>(undefined);

export const DAWProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isReady, setIsReady] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [currentClip, setCurrentClip] = useState<Clip | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [clips, setClips] = useState<Map<string, Clip[]>>(new Map());
  const [playbackPosition, setPlaybackPosition] = useState(new TimelinePosition());
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const mixer = useMixer();
  const audioServiceRef = useRef<AudioService>(new AudioService());
  const clipServiceRef = useRef<ClipService>(new ClipService());
  const audioExporterRef = useRef<AudioExporter>(new AudioExporter());
  const playbackIntervalRef = useRef<number | null>(null);

  // Initialize audio context and services
  useEffect(() => {
    const initAudio = async () => {
      try {
        await audioContext.resume();
        setIsReady(true);
      } catch (error) {
        console.error('Failed to initialize audio context:', error);
      }
    };

    initAudio();

    return () => {
      // Cleanup
      if (playbackIntervalRef.current) {
        window.clearInterval(playbackIntervalRef.current);
      }
      audioServiceRef.current.dispose();
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
      const next = new Map(prev);
      next.delete(trackId);
      return next;
    });
  };

  // Clip management
  const addClip = (trackId: string, clip: Clip) => {
    setClips(prev => {
      const next = new Map(prev);
      const trackClips = next.get(trackId) || [];
      next.set(trackId, [...trackClips, clip]);
      return next;
    });
  };

  const removeClip = (trackId: string, clipId: string) => {
    setClips(prev => {
      const next = new Map(prev);
      const trackClips = next.get(trackId) || [];
      next.set(trackId, trackClips.filter(c => c.id !== clipId));
      return next;
    });
  };

  // Playback control
  const startPlayback = (startPosition?: TimelinePosition) => {
    if (startPosition) {
      setPlaybackPosition(startPosition);
    }

    // Schedule all clips that start after the current position
    tracks.forEach(track => {
      const trackClips = clips.get(track.id) || [];
      trackClips.forEach(clip => {
        if (clip.start.compareTo(playbackPosition) >= 0) {
          const gainNode = mixer.getTrackGainNode(track.id);
          const startOffset = clip.start.toSeconds() - playbackPosition.toSeconds();
          audioServiceRef.current.play(clip.data.type === 'audio' ? clip.data.buffer : null, clip.id, {
            start: startOffset,
            onEnded: () => {
              // Handle clip end
            }
          });
        }
      });
    });

    setIsPlaying(true);

    // Start playback timer - update 30 times per second
    playbackIntervalRef.current = window.setInterval(() => {
      setPlaybackPosition(prev => prev.add(0, 0, 16)); // 480 ticks/beat / 30 fps ≈ 16 ticks/frame
    }, 1000/30);
  };

  const stopPlayback = () => {
    if (playbackIntervalRef.current) {
      window.clearInterval(playbackIntervalRef.current);
      playbackIntervalRef.current = null;
    }
    audioServiceRef.current.stop(); // Stop all playing sources
    setIsPlaying(false);
  };

  // Recording control
  const startRecording = async (trackId: string, deviceId?: string) => {
    if (!isReady) throw new Error('Audio system not ready');
    
    try {
      await audioServiceRef.current.startRecording();
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording:', error);
      throw error;
    }
  };

  const stopRecording = async (): Promise<Clip | null> => {
    if (!isRecording) return null;

    try {
      const recordedBuffer = await audioServiceRef.current.stopRecording();
      setIsRecording(false);

      if (recordedBuffer && currentTrack) {
        const clip = clipServiceRef.current.createClip(currentTrack.id, {
          type: 'audio',
          buffer: recordedBuffer,
          waveform: [] // Generate waveform data
        });
        addClip(currentTrack.id, clip);
        return clip;
      }
    } catch (error) {
      console.error('Failed to stop recording:', error);
    }

    return null;
  };

  // Project export
  const exportProject = async (options: any = {}) => {
    // Implement project export using audioExporterRef
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
    audioService: audioServiceRef.current,
    clipService: clipServiceRef.current,
    audioExporter: audioExporterRef.current,
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
    setPosition
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
