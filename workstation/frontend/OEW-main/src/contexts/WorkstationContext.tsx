import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  Track, 
  Clip, 
  TimelinePosition, 
  TimelineSettings, 
  SnapGridSizeOption, 
  TrackType, 
  Region
} from '../services/types/types';
import { BASE_BEAT_WIDTH } from '../services/utils/utils';

// Define the ElectronAPI interface
interface ElectronAPI {
  ipcRenderer: {
    on: (channel: string, listener: (...args: any[]) => void) => void;
    removeAllListeners: (channel: string) => void;
  };
  getDataDirectory?: () => Promise<string>;
  analyzeAudio?: (filePath: string) => Promise<any>;
  getVersion?: () => Promise<string>;
}

// Extend Window interface to include electronAPI
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

// Define the extended WorkstationContextType with all properties
export interface WorkstationContextType {
  // Transport/Playback
  isPlaying: boolean;
  isRecording: boolean;
  isLooping: boolean;
  setIsPlaying: (playing: boolean) => void;
  setIsRecording: (recording: boolean) => void;
  setIsLooping: (looping: boolean) => void;
  skipToStart: () => void;
  skipToEnd: () => void;
  
  // Timeline & Position
  playheadPos: TimelinePosition;
  setPlayheadPos: (pos: TimelinePosition) => void;
  maxPos: TimelinePosition;
  numMeasures: number;
  timelineSettings: TimelineSettings;
  updateTimelineSettings: (updater: TimelineSettings | ((settings: TimelineSettings) => TimelineSettings)) => void;
  
  // Grid & Snap
  snapGridSize: number;
  snapGridSizeOption: SnapGridSizeOption;
  setSnapGridSizeOption: (option: SnapGridSizeOption) => void;
  showTimeRuler: boolean;
  setShowTimeRuler: (show: boolean) => void;
  
  // Tracks & Clips
  tracks: Track[];
  setTracks: (tracks: Track[]) => void;
  masterTrack: Track;
  getTrackCurrentValue: (track: Track, envelope: string, pos?: TimelinePosition) => number;
  adjustNumMeasures: (pos?: TimelinePosition) => void;
  
  // Audio Features
  stretchAudio: boolean;
  setStretchAudio: (stretch: boolean) => void;
  
  // UI & Navigation
  scrollToItem: { type: string, params?: any } | null;
  setScrollToItem: (item: { type: string, params?: any } | null) => void;
  setTimeSignature: (numerator: number, denominator: number) => void;
  setVerticalScale: (scale: number) => void;
  verticalScale: number;
  
  // Audio Service
  audioService: {
    play: (buffer?: AudioBuffer) => void;
    stop: () => void;
    getWaveformData: () => Promise<Float32Array>;
    getFrequencyData: () => Promise<Float32Array>;
  };
  
  // Project Management
  saveWorkstation: (name: string) => Promise<string>;
}

// Create the context with a default undefined value
export const WorkstationContext = createContext<WorkstationContextType | undefined>(undefined);

export const useWorkstation = () => {
  const context = useContext(WorkstationContext);
  if (!context) {
    throw new Error('useWorkstation must be used within a WorkstationProvider');
  }
  return context;
};

export const WorkstationProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  // Core State
  const [tracks, setTracks] = useState<Track[]>([]);
  const [playheadPos, setPlayheadPos] = useState<TimelinePosition>(new TimelinePosition());
  const [timelineSettings, setTimelineSettings] = useState<TimelineSettings>({
    tempo: 120,
    timeSignature: { beats: 4, noteValue: 4 },
    snap: true,
    snapUnit: 'beat',
    horizontalScale: 1
  });
  
  // Transport State
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  
  // UI State
  const [showTimeRuler, setShowTimeRuler] = useState(true);
  const [snapGridSizeOption, setSnapGridSizeOption] = useState<SnapGridSizeOption>(SnapGridSizeOption.Eighth);
  const [stretchAudio, setStretchAudio] = useState(false);
  const [scrollToItem, setScrollToItem] = useState<{ type: string, params?: any } | null>(null);
  const [verticalScale, setVerticalScale] = useState(1);
  const [numMeasures, setNumMeasures] = useState(4);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  
  // Initialize master track
  const [masterTrack, setMasterTrack] = useState<Track>({
    id: 'master',
    name: 'Master',
    type: TrackType.Audio,
    clips: [],
    mute: false,
    solo: false,
    volume: 0,
    pan: 0,
    automationLanes: []
  });

  // Helper functions for recording and project management
  const listWorkstations = async (): Promise<string[]> => {
    // Implementation to list available workstation projects
    return [];
  };

  const startRecording = (trackId: string) => {
    // Implementation to start recording on a track
    setIsRecording(true);
  };

  const stopRecording = () => {
    // Implementation to stop recording
    setIsRecording(false);
  };

  useEffect(() => {
    // Initialize Electron API connections when component mounts
    if (window.electronAPI) {
      console.log('🔌 Electron API connected');
      
      // Listen for menu events from Electron
      window.electronAPI.ipcRenderer.on('menu-new-project', () => {
        // Handle new project creation
        setTracks([]);
        setPlayheadPos(new TimelinePosition());
      });

      window.electronAPI.ipcRenderer.on('menu-open-project', async () => {
        // Handle project opening
        const projects = await listWorkstations();
        console.log('Available projects:', projects);
      });

      window.electronAPI.ipcRenderer.on('menu-start-recording', () => {
        if (tracks.length > 0) {
          startRecording(tracks[0].id);
        }
      });

      window.electronAPI.ipcRenderer.on('menu-stop-recording', () => {
        stopRecording();
      });
    }

    return () => {
      // Cleanup IPC listeners
      if (window.electronAPI) {
        window.electronAPI.ipcRenderer.removeAllListeners('menu-new-project');
        window.electronAPI.ipcRenderer.removeAllListeners('menu-open-project');
        window.electronAPI.ipcRenderer.removeAllListeners('menu-start-recording');
        window.electronAPI.ipcRenderer.removeAllListeners('menu-stop-recording');
      }
    };
  }, [tracks]);

  // Enhanced audio service with Electron integration
  const audioService = {
    play: (buffer?: AudioBuffer) => {
      if (buffer && audioContext) {
        const source = audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContext.destination);
        source.start();
        setIsPlaying(true);
      }
    },
    stop: () => {
      setIsPlaying(false);
      if (audioContext) {
        audioContext.suspend();
      }
    },
    getWaveformData: async (): Promise<Float32Array> => {
      // Use Electron's audio analysis if available
      if (window.electronAPI?.analyzeAudio) {
        try {
          // This would need actual audio file path
          // const analysis = await window.electronAPI.analyzeAudio(filePath);
          // Return waveform data from analysis
        } catch (error) {
          console.error('Audio analysis failed:', error);
        }
      }
      return new Float32Array(1024);
    },
    getFrequencyData: async (): Promise<Float32Array> => {
      return new Float32Array(1024);
    }
  };

  // Enhanced project management with Electron file system
  const saveWorkstation = async (name: string): Promise<string> => {
    const projectData = {
      name,
      tracks,
      timelineSettings,
      timestamp: Date.now()
    };
    
    // Use Electron's file system if available
    if (window.electronAPI) {
      try {
        const userDataPath = await window.electronAPI.getDataDirectory?.();
        if (userDataPath) {
          const projectPath = `${userDataPath}/${name}.oew`;
          // Save to file system via Electron IPC
          // await window.electronAPI.saveProject(projectPath, projectData);
          return projectPath;
        }
      } catch (error) {
        console.error('Failed to save via Electron:', error);
      }
    }
    
    // Fallback to localStorage
    const id = `project_${Date.now()}`;
    localStorage.setItem(id, JSON.stringify(projectData));
    return id;
  };
  
  // Calculate the maximum position based on tracks
  const maxPos = new TimelinePosition(numMeasures, 0, 0);
  
  // Calculated snap grid size based on option
  const snapGridSize = snapGridSizeOption === SnapGridSizeOption.None ? 0 : BASE_BEAT_WIDTH / 4; // Default snap size
  
  // Get track current value (for automation) - Fix return type
  const getTrackCurrentValue = (track: Track, envelope: string, pos?: TimelinePosition): number => {
    const automationLane = track.automationLanes?.find(lane => lane.id === envelope);
    if (automationLane) {
      return envelope === 'volume' ? track.volume : track.pan;
    }
    return envelope === 'volume' ? track.volume : track.pan;
  };
  
  // Timeline navigation methods
  const skipToStart = () => {
    setPlayheadPos(new TimelinePosition(0, 0, 0));
  };
  
  const skipToEnd = () => {
    setPlayheadPos(maxPos);
  };

  // Timeline updating methods
  const updateTimelineSettings = (updater: TimelineSettings | ((settings: TimelineSettings) => TimelineSettings)) => {
    if (typeof updater === 'function') {
      setTimelineSettings(updater(timelineSettings));
    } else {
      setTimelineSettings(updater);
    }
  };
  
  const adjustNumMeasures = (pos?: TimelinePosition) => {
    // Implementation to adjust the number of measures based on position
    if (pos && pos.measure >= numMeasures) {
      setNumMeasures(pos.measure + 1);
    }
  };
  
  const setTimeSignature = (numerator: number, denominator: number) => {
    updateTimelineSettings(settings => ({
      ...settings,
      timeSignature: { beats: numerator, noteValue: denominator }
    }));
  };

  // Final value object with all required properties for Header component
  const value: WorkstationContextType = {
    tracks,
    playheadPos,
    timelineSettings,
    isPlaying,
    isRecording,
    isLooping,
    masterTrack,
    maxPos,
    snapGridSize,
    snapGridSizeOption,
    showTimeRuler,
    stretchAudio,
    verticalScale,
    numMeasures,
    scrollToItem,
    audioService,
    getTrackCurrentValue,
    setTracks,
    setPlayheadPos,
    setIsPlaying,
    setIsRecording,
    setIsLooping,
    setSnapGridSizeOption,
    setShowTimeRuler,
    setStretchAudio,
    setScrollToItem,
    setVerticalScale,
    setTimeSignature,
    skipToStart,
    skipToEnd,
    updateTimelineSettings,
    adjustNumMeasures,
    saveWorkstation
  };

  return (
    <WorkstationContext.Provider value={value}>
      {children}
    </WorkstationContext.Provider>
  );
};

export default WorkstationContext;