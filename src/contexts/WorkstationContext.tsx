import React, { createContext, useContext, useState, useEffect, HTMLAttributes } from 'react';

// Define all the necessary types locally instead of importing from non-existent paths
export interface TimelinePosition {
  measures: number;
  beats: number;
  fraction: number;
}

export interface Region {
  start: TimelinePosition;
  end: TimelinePosition;
}

export interface TimelineSettings {
  // Add the properties needed for TimelineSettings
  timeSigNumerator: number;
  timeSigDenominator: number;
  bpm: number;
}

export enum TrackType {
  AUDIO = 'AUDIO',
  MIDI = 'MIDI',
  // Add other track types as needed
}

export interface ClipAudio {
  // Define ClipAudio properties here
  id: string;
  buffer: AudioBuffer | null;
}

export interface Clip {
  id: string;
  start: TimelinePosition;
  end: TimelinePosition;
  // Add other clip properties
}

export interface Track {
  id: string;
  name: string;
  type: TrackType;
  // Other track properties
}

export interface AutomationLane {
  // Define automation lane properties
  id: string;
  name: string;
}

export interface AutomationNode {
  // Define automation node properties
  id: string;
  position: TimelinePosition;
  value: number;
}

export enum SnapGridSizeOption {
  MEASURE = 'MEASURE',
  BEAT = 'BEAT',
  EIGHTH = 'EIGHTH',
  SIXTEENTH = 'SIXTEENTH',
  THIRTYSECOND = 'THIRTYSECOND',
  SIXTYFOURTH = 'SIXTYFOURTH',
}

export interface FXChainPreset {
  id: string;
  name: string;
  // Other FX chain preset properties
}

export interface ScrollToItem {
  pos: TimelinePosition;
}

// Define WorkstationContextType
export interface WorkstationContextType {
  currentWorkstation: string | null;
  setCurrentWorkstation: (workstation: string) => void;
  allowMenuAndShortcuts: boolean;
  setAllowMenuAndShortcuts: (allowMenuAndShortcuts: boolean) => void;
  fxChainPresets: FXChainPreset[];
  setFXChainPresets: (fxChainPresets: FXChainPreset[]) => void;
  isLooping: boolean;
  setIsLooping: (isLooping: boolean) => void;
  isPlaying: boolean;
  setIsPlaying: (isPlaying: boolean) => void;
  isRecording: boolean;
  setIsRecording: (isRecording: boolean) => void;
  masterTrack: Track;
  setMasterTrack: (masterTrack: Track) => void;
  metronome: boolean;
  setMetronome: (metronome: boolean) => void;
  mixerHeight: number;
  setMixerHeight: (mixerHeight: number) => void;
  numMeasures: number;
  setNumMeasures: (numMeasures: number) => void;
  playheadPos: TimelinePosition;
  setPlayheadPos: (playheadPos: TimelinePosition) => void;
  scrollToItem: ScrollToItem | null;
  setScrollToItem: (scrollToItem: ScrollToItem | null) => void;
  selectedClipId: string | null;
  setSelectedClipId: (selectedClipId: string | null) => void;
  showMixer: boolean;
  setShowMixer: (showMixer: boolean) => void;
  showTimeRuler: boolean;
  setShowTimeRuler: (showTimeRuler: boolean) => void;
  songRegion: Region | null;
  setSongRegion: (songRegion: Region | null) => void;
  snapGridSize: { measures: number; beats: number; fraction: number };
  setSnapGridSize: (snapGridSize: {
    measures: number;
    beats: number;
    fraction: number;
  }) => void;
  snapGridSizeOption: SnapGridSizeOption;
  setSnapGridSizeOption: (snapGridSizeOption: SnapGridSizeOption) => void;
  stretchAudio: boolean;
  setStretchAudio: (stretchAudio: boolean) => void;
  trackRegion: { region: Region; trackId: string } | null;
  setTrackRegion: (trackRegion: { region: Region; trackId: string } | null) => void;
  tracks: Track[];
  setTracks: (tracks: Track[]) => void;
  verticalScale: number;
  setVerticalScale: (verticalScale: number) => void;
  timelineSettings: TimelineSettings;
  setTimelineSettings: (timelineSettings: TimelineSettings) => void;
  addNode: (track: Track, lane: AutomationLane, node: AutomationNode) => void;
  addTrack: (type: TrackType) => void;
  adjustNumMeasures: (pos?: TimelinePosition) => void;
  calculateNumMeasures: (pos: TimelinePosition) => number;
  consolidateClip: (clip: Clip) => void;
  consolidateClipAudio: (clip: Clip) => ClipAudio | null;
  createAudioClip: (buffer: AudioBuffer, start: number, end: number) => Promise<Clip>;
  createClipFromTrackRegion: () => void;
  deleteClip: (clip: Clip) => void;
  deleteNode: (node: AutomationNode) => void;
  deleteTrack: (track: Track) => void;
  duplicateClip: (clip: Clip) => void;
  duplicateTrack: (track: Track) => void;
  getTrackCurrentValue: (track: Track, lane: AutomationLane, pos: TimelinePosition) => number;
  handleDelete: () => void;
  insertClips: (newClips: Clip[], track: Track) => void;
  pasteClip: (pos: TimelinePosition, targetTrack?: Track) => void;
  pasteNode: (pos: TimelinePosition, targetLane?: AutomationLane) => void;
  setLane: (track: Track, lane: AutomationLane) => void;
  setTrack: (track: Track) => void;
  skipToEnd: () => void;
  skipToStart: () => void;
  splitClip: (clip: Clip, pos: TimelinePosition) => void;
  toggleMuteClip: (clip: Clip) => void;
  updateTimelineSettings: (
    timelineSettings: TimelineSettings
  ) => void;

  // Add these new properties for plugin support
  plugins: WorkstationPlugin[];
  registerPlugin: (plugin: WorkstationPlugin) => void;
  unregisterPlugin: (pluginId: string) => void;
  getPlugin: (pluginId: string) => WorkstationPlugin | undefined;

  // Add storage methods that plugins can implement
  saveWorkstation: (name?: string) => Promise<string>;
  loadWorkstation: (id: string) => Promise<boolean>;
  listWorkstations: () => Promise<{id: string, name: string}[]>;
}

// Add these new interfaces to support plugins
export interface PluginMetadata {
  id: string;
  name: string;
  version: string;
  description?: string;
}

export interface StorageConnector {
  type: string;
  save: (data: any) => Promise<string>;
  load: (id: string) => Promise<any>;
  list: () => Promise<string[]>;
}

export interface WorkstationPlugin {
  metadata: PluginMetadata;
  initialize: (workstation: WorkstationContextType) => void;
  cleanup: () => void;
  storageConnector?: StorageConnector;
}

// Create default values for the context
const defaultContextValue: WorkstationContextType = {
  currentWorkstation: null,
  setCurrentWorkstation: () => {},
  allowMenuAndShortcuts: true,
  setAllowMenuAndShortcuts: () => {},
  fxChainPresets: [],
  setFXChainPresets: () => {},
  isLooping: false,
  setIsLooping: () => {},
  isPlaying: false,
  setIsPlaying: () => {},
  isRecording: false,
  setIsRecording: () => {},
  masterTrack: { id: '', name: 'Master', type: TrackType.AUDIO },
  setMasterTrack: () => {},
  metronome: false,
  setMetronome: () => {},
  mixerHeight: 200,
  setMixerHeight: () => {},
  numMeasures: 4,
  setNumMeasures: () => {},
  playheadPos: { measures: 0, beats: 0, fraction: 0 },
  setPlayheadPos: () => {},
  scrollToItem: null,
  setScrollToItem: () => {},
  selectedClipId: null,
  setSelectedClipId: () => {},
  showMixer: true,
  setShowMixer: () => {},
  showTimeRuler: true,
  setShowTimeRuler: () => {},
  songRegion: null,
  setSongRegion: () => {},
  snapGridSize: { measures: 0, beats: 1, fraction: 0 },
  setSnapGridSize: () => {},
  snapGridSizeOption: SnapGridSizeOption.BEAT,
  setSnapGridSizeOption: () => {},
  stretchAudio: false,
  setStretchAudio: () => {},
  trackRegion: null,
  setTrackRegion: () => {},
  tracks: [],
  setTracks: () => {},
  verticalScale: 1,
  setVerticalScale: () => {},
  timelineSettings: { timeSigNumerator: 4, timeSigDenominator: 4, bpm: 120 },
  setTimelineSettings: () => {},
  addNode: () => {},
  addTrack: () => {},
  adjustNumMeasures: () => {},
  calculateNumMeasures: () => 0,
  consolidateClip: () => {},
  consolidateClipAudio: () => null,
  createAudioClip: async () => ({ id: '', start: { measures: 0, beats: 0, fraction: 0 }, end: { measures: 0, beats: 0, fraction: 0 } }),
  createClipFromTrackRegion: () => {},
  deleteClip: () => {},
  deleteNode: () => {},
  deleteTrack: () => {},
  duplicateClip: () => {},
  duplicateTrack: () => {},
  getTrackCurrentValue: () => 0,
  handleDelete: () => {},
  insertClips: () => {},
  pasteClip: () => {},
  pasteNode: () => {},
  setLane: () => {},
  setTrack: () => {},
  skipToEnd: () => {},
  skipToStart: () => {},
  splitClip: () => {},
  toggleMuteClip: () => {},
  updateTimelineSettings: () => {},
  
  // Add plugin related defaults
  plugins: [],
  registerPlugin: () => {},
  unregisterPlugin: () => {},
  getPlugin: () => undefined,
  saveWorkstation: async () => "",
  loadWorkstation: async () => false,
  listWorkstations: async () => [],
};

export const WorkstationContext = createContext<WorkstationContextType>(defaultContextValue);

export const WorkstationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentWorkstation, setCurrentWorkstation] = useState<string | null>(null);
  const [allowMenuAndShortcuts, setAllowMenuAndShortcuts] = useState<boolean>(true);
  const [fxChainPresets, setFXChainPresets] = useState<FXChainPreset[]>([]);
  const [isLooping, setIsLooping] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [masterTrack, setMasterTrack] = useState<Track>({ id: '', name: 'Master', type: TrackType.AUDIO });
  const [metronome, setMetronome] = useState<boolean>(false);
  const [mixerHeight, setMixerHeight] = useState<number>(200);
  const [numMeasures, setNumMeasures] = useState<number>(4);
  const [playheadPos, setPlayheadPos] = useState<TimelinePosition>({ measures: 0, beats: 0, fraction: 0 });
  const [scrollToItem, setScrollToItem] = useState<ScrollToItem | null>(null);
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null);
  const [showMixer, setShowMixer] = useState<boolean>(true);
  const [showTimeRuler, setShowTimeRuler] = useState<boolean>(true);
  const [songRegion, setSongRegion] = useState<Region | null>(null);
  const [snapGridSize, setSnapGridSize] = useState<{ measures: number; beats: number; fraction: number }>({
    measures: 0,
    beats: 1,
    fraction: 0
  });
  const [snapGridSizeOption, setSnapGridSizeOption] = useState<SnapGridSizeOption>(SnapGridSizeOption.BEAT);
  const [stretchAudio, setStretchAudio] = useState<boolean>(false);
  const [trackRegion, setTrackRegion] = useState<{ region: Region; trackId: string } | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [verticalScale, setVerticalScale] = useState<number>(1);
  const [timelineSettings, setTimelineSettings] = useState<TimelineSettings>({ 
    timeSigNumerator: 4, 
    timeSigDenominator: 4, 
    bpm: 120 
  });

  // Add state for plugins
  const [plugins, setPlugins] = useState<WorkstationPlugin[]>([]);

  // Plugin registration
  const registerPlugin = (plugin: WorkstationPlugin) => {
    // Check if plugin already exists
    if (plugins.some(p => p.metadata.id === plugin.metadata.id)) {
      console.warn(`Plugin ${plugin.metadata.id} is already registered`);
      return;
    }
    
    // Add plugin to state
    setPlugins(prev => [...prev, plugin]);
    
    // Initialize the plugin with current context
    try {
      plugin.initialize(contextValue);
      console.log(`Plugin ${plugin.metadata.name} initialized successfully`);
    } catch (error) {
      console.error(`Failed to initialize plugin ${plugin.metadata.name}:`, error);
    }
  };
  
  const unregisterPlugin = (pluginId: string) => {
    const plugin = plugins.find(p => p.metadata.id === pluginId);
    if (!plugin) return;
    
    try {
      // Run cleanup for the plugin
      plugin.cleanup();
      console.log(`Plugin ${plugin.metadata.name} cleanup completed`);
    } catch (error) {
      console.error(`Error during plugin ${plugin.metadata.name} cleanup:`, error);
    }
    
    // Remove plugin from state
    setPlugins(prev => prev.filter(p => p.metadata.id !== pluginId));
  };
  
  const getPlugin = (pluginId: string) => {
    return plugins.find(p => p.metadata.id === pluginId);
  };
  
  // Storage methods that use plugins with storageConnector capability
  const saveWorkstation = async (name?: string): Promise<string> => {
    // Find first plugin with storage capability
    const storagePlugin = plugins.find(p => p.storageConnector);
    
    if (!storagePlugin?.storageConnector) {
      console.error("No storage plugin available");
      return "";
    }
    
    try {
      // Create a serializable representation of the workstation
      const workstationData = {
        name: name || currentWorkstation,
        timelineSettings,
        tracks,
        // Add other relevant state to save
      };
      
      // Use the plugin to save data
      const id = await storagePlugin.storageConnector.save(workstationData);
      return id;
    } catch (error) {
      console.error("Failed to save workstation:", error);
      return "";
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
      const data = await storagePlugin.storageConnector.load(id);
      if (!data) return false;
      
      // Update state with loaded data
      if (data.name) setCurrentWorkstation(data.name);
      if (data.timelineSettings) setTimelineSettings(data.timelineSettings);
      if (data.tracks) setTracks(data.tracks);
      // Add other state updates
      
      return true;
    } catch (error) {
      console.error("Failed to load workstation:", error);
      return false;
    }
  };
  
  const listWorkstations = async (): Promise<{id: string, name: string}[]> => {
    // Find first plugin with storage capability
    const storagePlugin = plugins.find(p => p.storageConnector);
    
    if (!storagePlugin?.storageConnector) {
      console.error("No storage plugin available");
      return [];
    }
    
    try {
      const ids = await storagePlugin.storageConnector.list();
      
      // For each ID, load basic metadata
      const workstations = await Promise.all(
        ids.map(async (id) => {
          try {
            const data = await storagePlugin.storageConnector!.load(id);
            return { id, name: data.name || id };
          } catch {
            return { id, name: id };
          }
        })
      );
      
      return workstations;
    } catch (error) {
      console.error("Failed to list workstations:", error);
      return [];
    }
  };

  // Implement the actual context methods
  const addNode = (track: Track, lane: AutomationLane, node: AutomationNode) => {
    // Implementation here
    console.log("Adding node", { track, lane, node });
  };

  const addTrack = (type: TrackType) => {
    const newTrack: Track = {
      id: `track-${Date.now()}`,
      name: `New ${type} Track`,
      type,
    };
    setTracks([...tracks, newTrack]);
  };

  const adjustNumMeasures = (pos?: TimelinePosition) => {
    if (pos) {
      const newNumMeasures = calculateNumMeasures(pos);
      setNumMeasures(Math.max(numMeasures, newNumMeasures));
    }
  };

  const calculateNumMeasures = (pos: TimelinePosition): number => {
    return pos.measures + 1;
  };

  const consolidateClip = (clip: Clip) => {
    console.log("Consolidating clip", clip);
  };

  const consolidateClipAudio = (clip: Clip): ClipAudio | null => {
    console.log("Consolidating clip audio", clip);
    return null;
  };

  const createAudioClip = async (buffer: AudioBuffer, start: number, end: number): Promise<Clip> => {
    return {
      id: `clip-${Date.now()}`,
      start: { measures: start, beats: 0, fraction: 0 },
      end: { measures: end, beats: 0, fraction: 0 },
    };
  };

  const createClipFromTrackRegion = () => {
    console.log("Creating clip from track region");
  };

  const deleteClip = (clip: Clip) => {
    console.log("Deleting clip", clip);
  };

  const deleteNode = (node: AutomationNode) => {
    console.log("Deleting node", node);
  };

  const deleteTrack = (track: Track) => {
    setTracks(tracks.filter(t => t.id !== track.id));
  };

  const duplicateClip = (clip: Clip) => {
    console.log("Duplicating clip", clip);
  };

  const duplicateTrack = (track: Track) => {
    const newTrack = { ...track, id: `track-${Date.now()}`, name: `${track.name} (Copy)` };
    setTracks([...tracks, newTrack]);
  };

  const getTrackCurrentValue = (track: Track, lane: AutomationLane, pos: TimelinePosition): number => {
    return 0; // Default implementation
  };

  const handleDelete = () => {
    if (selectedClipId) {
      // Delete selected clip logic
      console.log("Deleting selected clip", selectedClipId);
    }
  };

  const insertClips = (newClips: Clip[], track: Track) => {
    console.log("Inserting clips", { newClips, track });
  };

  const pasteClip = (pos: TimelinePosition, targetTrack?: Track) => {
    console.log("Pasting clip", { pos, targetTrack });
  };

  const pasteNode = (pos: TimelinePosition, targetLane?: AutomationLane) => {
    console.log("Pasting node", { pos, targetLane });
  };

  const setLane = (track: Track, lane: AutomationLane) => {
    console.log("Setting lane", { track, lane });
  };

  const setTrack = (track: Track) => {
    setTracks(tracks.map(t => t.id === track.id ? track : t));
  };

  const skipToEnd = () => {
    setPlayheadPos({ measures: numMeasures - 1, beats: 0, fraction: 0 });
  };

  const skipToStart = () => {
    setPlayheadPos({ measures: 0, beats: 0, fraction: 0 });
  };

  const splitClip = (clip: Clip, pos: TimelinePosition) => {
    console.log("Splitting clip", { clip, pos });
  };

  const toggleMuteClip = (clip: Clip) => {
    console.log("Toggling mute for clip", clip);
  };

  const updateTimelineSettings = (newTimelineSettings: TimelineSettings) => {
    setTimelineSettings(newTimelineSettings);
  };

  const contextValue: WorkstationContextType = {
    currentWorkstation,
    setCurrentWorkstation,
    allowMenuAndShortcuts,
    setAllowMenuAndShortcuts,
    fxChainPresets,
    setFXChainPresets,
    isLooping,
    setIsLooping,
    isPlaying,
    setIsPlaying,
    isRecording,
    setIsRecording,
    masterTrack,
    setMasterTrack,
    metronome,
    setMetronome,
    mixerHeight,
    setMixerHeight,
    numMeasures,
    setNumMeasures,
    playheadPos,
    setPlayheadPos,
    scrollToItem,
    setScrollToItem,
    selectedClipId,
    setSelectedClipId,
    showMixer,
    setShowMixer,
    showTimeRuler,
    setShowTimeRuler,
    songRegion,
    setSongRegion,
    snapGridSize,
    setSnapGridSize,
    snapGridSizeOption,
    setSnapGridSizeOption,
    stretchAudio,
    setStretchAudio,
    trackRegion,
    setTrackRegion,
    tracks,
    setTracks,
    verticalScale,
    setVerticalScale,
    timelineSettings,
    setTimelineSettings,
    addNode,
    addTrack,
    adjustNumMeasures,
    calculateNumMeasures,
    consolidateClip,
    consolidateClipAudio,
    createAudioClip,
    createClipFromTrackRegion,
    deleteClip,
    deleteNode,
    deleteTrack,
    duplicateClip,
    duplicateTrack,
    getTrackCurrentValue,
    handleDelete,
    insertClips,
    pasteClip,
    pasteNode,
    setLane,
    setTrack,
    skipToEnd,
    skipToStart,
    splitClip,
    toggleMuteClip,
    updateTimelineSettings,

    // Add plugin management to context value
    plugins,
    registerPlugin,
    unregisterPlugin,
    getPlugin,
    saveWorkstation,
    loadWorkstation,
    listWorkstations,
  };

  return (
    <WorkstationContext.Provider value={contextValue}>
      {children}
    </WorkstationContext.Provider>
  );
};

// Improved useWorkstation hook with better error handling and explicit return type
export const useWorkstation = (): WorkstationContextType => {
  const context = useContext(WorkstationContext);
  
  if (context === undefined) {
    throw new Error('useWorkstation must be used within a WorkstationProvider');
  }
  
  return context;
};
