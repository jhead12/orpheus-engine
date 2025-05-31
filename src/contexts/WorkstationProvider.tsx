import React, { useState } from 'react';
import { 
  Clip,
  TrackType, 
  Track,
  Region,
  TimelinePosition,
  TimelineSettings
} from '../services/types/types';
import WorkstationContext, {
  WorkstationContextType,
  WorkstationPlugin,
  WorkstationData,
  StorageConnector,
  ScrollToItem
} from './WorkstationContext';

interface WorkstationProviderProps {
  children: React.ReactNode;
}

const WorkstationProvider: React.FC<WorkstationProviderProps> = ({ children }) => {
  // State for Workstation data
  const [plugins, setPlugins] = useState<WorkstationPlugin[]>([]);
  const [currentWorkstation, setCurrentWorkstation] = useState<WorkstationData | null>(null);
  const [storageConnectors, setStorageConnectors] = useState<Record<string, StorageConnector>>({});
  
  // State for Editor/UI
  const [masterTrack] = useState<Track>({} as Track);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [maxPos] = useState(new TimelinePosition());
  const [numMeasures] = useState(4);
  const [playheadPos, setPlayheadPos] = useState(new TimelinePosition());
  const [songRegion, setSongRegion] = useState<Region | null>(null);
  const [isPlaying] = useState(false);
  const [verticalScale, setVerticalScale] = useState(1);
  const [mixerHeight, setMixerHeight] = useState(200);
  const [showMixer, setShowMixer] = useState(true);
  const [scrollToItem, setScrollToItem] = useState<ScrollToItem | null>(null);
  const [snapGridSize] = useState(0);
  const [timelineSettings, setTimelineSettings] = useState<TimelineSettings>({
    horizontalScale: 1,
    timeSignature: { beats: 4, noteValue: 4 },
    tempo: 120
  });
  
  // UI state
  const [allowMenuAndShortcuts, setAllowMenuAndShortcuts] = useState(true);
  
  // Plugin registration and management
  const registerPlugin = (plugin: WorkstationPlugin) => {
    if (plugins.some(p => p.metadata?.id === plugin.metadata?.id)) {
      console.warn(`Plugin ${plugin.metadata?.id} is already registered`);
      return;
    }
    
    setPlugins(prev => [...prev, plugin]);
    
    // If the plugin has a storage connector, register it
    if (plugin.storageConnector) {
      setStorageConnectors(prev => ({
        ...prev,
        [plugin.metadata?.id || '']: plugin.storageConnector as StorageConnector
      }));
    }
    
    try {
      if (plugin.initialize) {
        plugin.initialize(currentWorkstation);
        console.log(`Plugin ${plugin.metadata?.name} initialized successfully`);
      }
    } catch (error) {
      console.error(`Failed to initialize plugin ${plugin.metadata?.name}:`, error);
    }
  };
  
  const unregisterPlugin = (pluginId: string) => {
    const plugin = plugins.find(p => p.metadata?.id === pluginId);
    if (!plugin) return;
    
    try {
      if (plugin.cleanup) {
        plugin.cleanup();
        console.log(`Plugin ${plugin.metadata?.name} cleanup completed`);
      }
    } catch (error) {
      console.error(`Error during plugin ${plugin.metadata?.name} cleanup:`, error);
    }
    
    setPlugins(prev => prev.filter(p => p.metadata?.id !== pluginId));
    
    // Remove the storage connector if it exists
    if (storageConnectors[pluginId]) {
      setStorageConnectors(prev => {
        const updated = { ...prev };
        delete updated[pluginId];
        return updated;
      });
    }
  };
  
  const getPlugin = (pluginId: string): WorkstationPlugin | undefined => {
    return plugins.find(p => p.metadata?.id === pluginId);
  };
  
  // Workstation data management
  const createNewWorkstation = (name: string) => {
    const newWorkstation: WorkstationData = {
      name,
      tracks: []
    };
    setCurrentWorkstation(newWorkstation);
  };
  
  const saveWorkstation = async (name: string): Promise<string | null> => {
    if (!currentWorkstation) {
      console.error("No active workstation to save");
      return null;
    }
    
    // Find first plugin with storage capability
    const storagePlugin = plugins.find(p => p.storageConnector);
    
    if (!storagePlugin?.storageConnector) {
      console.error("No storage plugin available");
      return null;
    }
    
    try {
      // Create a copy of the current workstation with the provided name
      const workstationToSave = {
        ...currentWorkstation,
        name
      };
      
      const id = await storagePlugin.storageConnector.save(workstationToSave);
      
      // Update the current workstation with the ID
      setCurrentWorkstation({
        ...workstationToSave,
        id
      });
      
      return id;
    } catch (error) {
      console.error("Failed to save workstation:", error);
      return null;
    }
  };
  
  const loadWorkstation = async (id: string): Promise<boolean> => {
    // Find first plugin with storage capability
    const storagePlugin = plugins.find(p => p.storageConnector);
    
    if (!storagePlugin?.storageConnector) {
      console.error("No storage plugin available");
      return false;
    }
    
    try {
      const workstationData = await storagePlugin.storageConnector.load(id);
      setCurrentWorkstation(workstationData);
      return true;
    } catch (error) {
      console.error("Failed to load workstation:", error);
      return false;
    }
  };
  
  // Changed return type to match WorkstationContextType
  const listWorkstations = async (): Promise<string[]> => {
    // Find first plugin with storage capability
    const storagePlugin = plugins.find(p => p.storageConnector);
    
    if (!storagePlugin?.storageConnector) {
      console.error("No storage plugin available");
      return [];
    }
    
    try {
      return await storagePlugin.storageConnector.list();
    } catch (error) {
      console.error("Failed to list workstations:", error);
      return [];
    }
  };

  // Implement Editor methods
  const addTrack = (_type: TrackType) => {
    // Implementation would add a track
    console.log("Adding track");
  };

  const adjustNumMeasures = (_pos?: TimelinePosition) => {
    // Implementation would adjust measures
    console.log("Adjusting measures");
  };

  const createAudioClip = async (_audio: any, _pos: TimelinePosition): Promise<Clip | null> => {
    // Implementation would create a clip
    console.log("Creating audio clip");
    return null;
  };

  const insertClips = (_clips: Clip[], _track: Track) => {
    // Implementation would insert clips
    console.log("Inserting clips");
  };

  const updateTimelineSettings = (updater: (settings: TimelineSettings) => TimelineSettings) => {
    setTimelineSettings(prev => updater(prev));
  };

  // Additional plugin helper methods
  const hasPlugin = (id: string) => plugins.some(p => p.metadata && p.metadata.id === id);
  // Make sure getPlugins returns WorkstationPlugin[] directly without any conversions
  const getPlugins = () => plugins;
  const clearPlugins = () => setPlugins([]);

  const contextValue: WorkstationContextType = {
    // Plugin system
    plugins,
    registerPlugin,
    unregisterPlugin,
    getPlugin,
    hasPlugin,
    getPlugins,  // Make sure we're using the function defined above
    clearPlugins,
    storageConnectors,
    
    // Workstation data
    currentWorkstation,
    saveWorkstation,
    loadWorkstation,
    listWorkstations,
    createNewWorkstation,
    
    // Editor properties
    addTrack,
    adjustNumMeasures,
    createAudioClip,
    insertClips,
    masterTrack,
    maxPos,
    numMeasures,
    playheadPos,
    scrollToItem,
    setAllowMenuAndShortcuts,
    setPlayheadPos,
    setScrollToItem,
    setSongRegion,
    setTracks,
    setVerticalScale,
    snapGridSize,
    songRegion,
    timelineSettings,
    tracks,
    updateTimelineSettings,
    verticalScale,
    isPlaying,
    
    // Workstation properties
    mixerHeight,
    setMixerHeight,
    showMixer,
    setShowMixer,
    
    // Allow menu shortcuts
    allowMenuAndShortcuts
  };

  return (
    <WorkstationContext.Provider value={contextValue}>
      {children}
    </WorkstationContext.Provider>
  );
};

export default WorkstationProvider;
