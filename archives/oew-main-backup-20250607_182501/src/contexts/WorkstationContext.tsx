import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  Track, 
  Clip, 
  TimelinePosition, 
  TimelineSettings,
  WorkstationPlugin,
  WorkstationContextType 
} from '../services/types';

// Create the context with a default undefined value
export const WorkstationContext = createContext<WorkstationContextType | undefined>(undefined);

// No need to redefine interfaces already defined in consolidated-types.ts

export const useWorkstation = () => {
  const context = useContext(WorkstationContext);
  if (!context) {
    throw new Error('useWorkstation must be used within a WorkstationProvider');
  }
  return context;
};

export const WorkstationProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [playheadPos, setPlayheadPos] = useState<TimelinePosition>(new TimelinePosition());
  const [timelineSettings, setTimelineSettings] = useState<TimelineSettings>({ bpm: 120, timeSignature: 4 });
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

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
        if (currentTrack) {
          startRecording(currentTrack.id);
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
  }, [currentTrack]);

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
        const userDataPath = await window.electronAPI.getDataDirectory();
        const projectPath = `${userDataPath}/${name}.oew`;
        // Save to file system via Electron IPC
        // await window.electronAPI.saveProject(projectPath, projectData);
        return projectPath;
      } catch (error) {
        console.error('Failed to save via Electron:', error);
      }
    }
    
    // Fallback to localStorage
    const id = `project_${Date.now()}`;
    localStorage.setItem(id, JSON.stringify(projectData));
    return id;
  };

  const value = {
    tracks,
    currentTrack,
    playheadPos,
    timelineSettings,
    isPlaying,
    audioService,
    setTracks,
    setCurrentTrack,
    setPlayheadPos,
    setTimelineSettings,
    setIsPlaying,
    saveWorkstation
  };

  return (
    <WorkstationContext.Provider value={value}>
      {children}
    </WorkstationContext.Provider>
  );
};

export default WorkstationContext;