import * as React from 'react';
import { useContext } from 'react';
import { Clip, TimelinePosition, TrackType, Track, Region, TimelineSettings } from '../services/types/types';

// Define ScrollToItem interface
export interface ScrollToItem {
  type: string;
  params?: {
    trackId?: string;
    alignment?: string;
  };
}

// Plugin metadata interface
export interface PluginMetadata {
  id: string;
  name: string;
  version: string;
  description?: string;
  author?: string;
  tags?: string[];
}

// Storage connector interface for plugin implementations
export interface StorageConnector {
  type: string;  // Add the 'type' property
  save: (data: WorkstationData) => Promise<string>;
  load: (id: string) => Promise<WorkstationData>;
  list: () => Promise<string[]>;
  delete?: (id: string) => Promise<boolean>;
}

// Base interface for all workstation plugins
export interface WorkstationPlugin {
  metadata: PluginMetadata;
  initialize: (workstation: WorkstationData | null) => void;
  cleanup: () => void;
  storageConnector?: StorageConnector;
}

// Workstation data interface
export interface WorkstationData {
  id?: string;
  name: string;
  tracks: Track[];
  effects?: any[];
  settings?: Record<string, any>;
  metadata?: Record<string, any>;
}

// Workstation context interface
export interface WorkstationContextType {
  // Plugin management
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
  
  // Editor properties
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
  
  // Additional properties needed for Editor.tsx errors
  deleteTrack: (trackId: string) => void;
  duplicateTrack: (trackId: string) => void;
  getTrackCurrentValue: (track: Track, lane: string, pos?: TimelinePosition) => number;
  selectedTrackId: string | null;
  setSelectedTrackId: (id: string | null) => void;
  
  // Selection properties
  selectedClipId: string | null;
  setSelectedClipId: (id: string | null) => void;
  selectedRegionId: string | null;
  setSelectedRegionId: (id: string | null) => void;
  selectedAutomationPointId: string | null;
  setSelectedAutomationPointId: (id: string | null) => void;
  selectedAutomationLaneId?: string | null;
  setSelectedAutomationLaneId?: (id: string | null) => void;
  
  setTrack: (trackId: string, updates: Partial<Track>) => void;
  showMaster: boolean;
  
  // Metronome-related properties
  metronome: boolean;
  setMetronome: (enabled: boolean) => void;
  
  // Timeline properties
  autoGridSize: number;
  showTimeRuler: boolean;
  snapGridSizeOption: string;
}

// Create the context with null as default value
const WorkstationContext = React.createContext<WorkstationContextType | null>(null);

// Create a hook to use the workstation context
export const useWorkstation = (): WorkstationContextType => {
  const context = useContext(WorkstationContext);
  if (context === null) {
    throw new Error('useWorkstation must be used within a WorkstationProvider');
  }
  return context;
};

export default WorkstationContext;
