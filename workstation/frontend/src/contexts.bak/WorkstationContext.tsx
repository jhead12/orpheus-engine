import React, { createContext, useContext } from 'react';
import { Track, Clip, TimelinePosition, TimelineSettings } from '../types/types';

export interface WorkstationPlugin {
  id: string;
  name: string;
  version: string;
  initialize?: (workstation: any) => void;
  cleanup?: () => void;
  metadata?: {
    id: string;
    name: string;
    author?: string;
    description?: string;
  };
  storageConnector?: any;
}

export interface WorkstationContextType {
  // Plugin Management
  plugins: WorkstationPlugin[];
  registerPlugin: (plugin: WorkstationPlugin) => void;
  unregisterPlugin: (pluginId: string) => void;
  getPlugin: (pluginId: string) => WorkstationPlugin | undefined;
  hasPlugin: (pluginId: string) => boolean;
  getPlugins: () => WorkstationPlugin[];
  clearPlugins: () => void;

  // Timeline & Playback
  playheadPos: TimelinePosition;
  setPlayheadPos: (pos: TimelinePosition) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  timelineSettings: TimelineSettings;
  updateTimelineSettings: (settings: TimelineSettings) => void;

  // Track Management
  tracks: Track[];
  setTracks: (tracks: Track[]) => void;
  addTrack: (type: string) => void;
  deleteTrack: (id: string) => void;
  masterTrack: Track;

  // Other essential properties...
  // ...existing code...
}

const WorkstationContext = createContext<WorkstationContextType | undefined>(undefined);

export const useWorkstation = () => {
  const context = useContext(WorkstationContext);
  if (!context) {
    throw new Error('useWorkstation must be used within a WorkstationProvider');
  }
  return context;
};

export default WorkstationContext;