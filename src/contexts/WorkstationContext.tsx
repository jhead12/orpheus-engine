import { createContext, useContext } from 'react';
import { 
  Clip, 
  TimelinePosition, 
  TrackType, 
  Track,
  Region,
  TimelineSettings
} from '../services/types/types';

// Define ScrollToItem interface
export interface ScrollToItem {
  type: string;
  params?: {
    trackId?: string;
    alignment?: string;
  };
}

export interface WorkstationData {
  id?: string;
  name: string;
  tracks: Track[];
}

export interface StorageConnector {
  save: (data: WorkstationData) => Promise<string>;
  load: (id: string) => Promise<WorkstationData>;
  list: () => Promise<string[]>;
}

export interface PluginMetadata {
  id: string;
  name: string;
  version: string;
  description?: string;
}

export interface WorkstationPlugin {
  metadata: PluginMetadata;
  initialize: (workstation: WorkstationData | null) => void;
  cleanup: () => void;
  storageConnector?: StorageConnector;
}

// Define WorkstationContextType with all properties
export interface WorkstationContextType {
  // Properties used in Editor.tsx
  addTrack: (type: TrackType) => void;
  adjustNumMeasures: (pos?: TimelinePosition) => void;
  createAudioClip: (audio: any, pos: TimelinePosition) => Promise<Clip | null>;
  insertClips: (clips: Clip[], track: Track) => void;
  masterTrack: Track;
  maxPos: TimelinePosition;
  numMeasures: number;
  playheadPos: TimelinePosition;
  scrollToItem: ScrollToItem | null;
  setAllowMenuAndShortcuts: (allow: boolean) => void;
  setPlayheadPos: (pos: TimelinePosition) => void;
  setScrollToItem: (item: ScrollToItem | null) => void;
  setSongRegion: (region: Region | null) => void;
  setTracks: (tracks: Track[]) => void;
  setVerticalScale: (scale: number) => void;
  snapGridSize: number;
  songRegion: Region | null;
  timelineSettings: TimelineSettings;
  tracks: Track[];
  updateTimelineSettings: (updater: (settings: TimelineSettings) => TimelineSettings) => void;
  verticalScale: number;
  isPlaying: boolean;
  allowMenuAndShortcuts?: boolean;
  
  // Properties used in Workstation.tsx
  mixerHeight: number;
  setMixerHeight: (height: number) => void;
  showMixer: boolean;
  setShowMixer: (show: boolean) => void;
  
  // Plugin system properties
  plugins: WorkstationPlugin[];
  registerPlugin: (plugin: WorkstationPlugin) => void;
  unregisterPlugin: (pluginId: string) => void;
  getPlugin: (pluginId: string) => WorkstationPlugin | undefined;
  hasPlugin: (id: string) => boolean;
  getPlugins: () => WorkstationPlugin[];
  clearPlugins: () => void;
  storageConnectors: Record<string, StorageConnector>;
  
  // Workstation data management
  currentWorkstation: WorkstationData | null;
  saveWorkstation: (name: string) => Promise<string | null>;
  loadWorkstation: (id: string) => Promise<boolean>;
  listWorkstations: () => Promise<string[]>;
  createNewWorkstation: (name: string) => void;
}

// Create the context with null as default
export const WorkstationContext = createContext<WorkstationContextType | null>(null);

// Create a hook to use the workstation context
export function useWorkstation(): WorkstationContextType {
  const context = useContext(WorkstationContext);
  if (context === null) {
    throw new Error('useWorkstation must be used within a WorkstationProvider');
  }
  return context;
}

export default WorkstationContext;
