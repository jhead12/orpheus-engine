import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Core enums and types
export enum AudioAnalysisType {
  Spectral = "spectral",
  Waveform = "waveform", 
  Features = "features"
}

export enum TrackType {
  Audio = "audio",
  MIDI = "midi",
  Bus = "bus",
  Master = "master"
}

export interface TimeSignature {
  beats: number;
  noteValue: number;
}

export interface TimelineSettings {
  tempo: number;
  timeSignature: TimeSignature;
  snap: boolean;
  snapUnit: 'beat' | 'bar' | 'sixteenth';
  horizontalScale: number;
}

// Storage and Plugin types
export interface StorageConnector {
  type: string;
  save: (data: any) => Promise<string>;
  load: (id: string) => Promise<any>;
  list: () => Promise<string[]>;
  delete: (id: string) => Promise<boolean>;
}

export interface PluginMetadata {
  id: string;
  name: string;
  version: string;
  category?: 'storage' | 'blockchain' | 'dapp' | 'utility' | 'export' | 'cloud' | 'local';
  supportedFormats?: string[];
  tags?: string[];
  author?: string;
  description?: string;
  homepage?: string;
  license?: string;
  icon?: string;
}

export interface WorkstationData {
  name: string;
  tracks: Track[];
  timelineSettings?: TimelineSettings;
  timestamp?: number;
  id?: string;
  metadata?: Record<string, any>;
  [key: string]: any;
}

export class TimelinePosition {
  static defaultSettings: TimelineSettings = {
    tempo: 120,
    timeSignature: { beats: 4, noteValue: 4 },
    snap: true,
    snapUnit: 'beat',
    horizontalScale: 1
  };

  constructor(
    public bar: number = 0,
    public beat: number = 0,
    public tick: number = 0
  ) {}

  get sixteenth(): number {
    return Math.floor(this.tick / 120);
  }

  set sixteenth(value: number) {
    this.tick = value * 120;
  }

  get fraction(): number {
    return this.sixteenth;
  }

  add(bars: number, beats: number, ticks: number): TimelinePosition {
    let resultTick = this.tick + ticks;
    let resultBeat = this.beat + beats;
    let resultBar = this.bar + bars;
    
    if (resultTick >= 480) {
      resultBeat += Math.floor(resultTick / 480);
      resultTick %= 480;
    }
    
    if (resultBeat >= 4) {
      resultBar += Math.floor(resultBeat / 4);
      resultBeat %= 4;
    }
    
    return new TimelinePosition(resultBar, resultBeat, resultTick);
  }

  copy(): TimelinePosition {
    return new TimelinePosition(this.bar, this.beat, this.tick);
  }

  compareTo(other: TimelinePosition): number {
    if (this.bar !== other.bar) return this.bar - other.bar;
    if (this.beat !== other.beat) return this.beat - other.beat;
    return this.tick - other.tick;
  }

  equals(other: TimelinePosition): boolean {
    return this.bar === other.bar && 
           this.beat === other.beat && 
           this.tick === other.tick;
  }

  toTicks(): number {
    return (this.bar * 4 * 480) + (this.beat * 480) + this.tick;
  }

  toMargin(): number {
    return this.toTicks();
  }

  diffInMargin(other: TimelinePosition): number {
    return this.toMargin() - other.toMargin();
  }

  snap(gridSize: any, direction?: string): TimelinePosition {
    // Basic snap implementation
    return this.copy();
  }
}

export interface AudioData {
  type: 'audio';
  buffer: AudioBuffer;
  waveform: number[];
}

export interface MIDIData {
  type: 'midi';
  notes: MIDINote[];
}

export interface MIDINote {
  pitch: number;
  velocity: number;
  start: TimelinePosition;
  duration: TimelinePosition;
}

export interface Clip {
  id: string;
  trackId: string;
  name?: string;
  start: TimelinePosition;
  length: TimelinePosition;
  end?: TimelinePosition;
  data: AudioData | MIDIData;
  fadeIn?: number;
  fadeOut?: number;
  gain?: number;
  mute?: boolean;
  effects?: Array<{ type: string, parameters: Record<string, any> }>;
  metadata?: Record<string, any>;
}

export interface Track {
  id: string;
  name: string;
  type: TrackType;
  clips: Clip[];
  mute: boolean;
  solo: boolean;
  volume: number;
  pan: number;
  color?: string;
  expanded?: boolean;
  effects?: any[];
  armed?: boolean;
}

export interface Region {
  start: TimelinePosition;
  end: TimelinePosition;
}

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
}

// Comprehensive WorkstationContext interface
export interface WorkstationContextType {
  // Core state
  tracks: Track[];
  currentTrack: Track | null;
  currentClip: Clip | null;
  isPlaying: boolean;
  isRecording: boolean;
  playheadPos: TimelinePosition;
  maxPos: TimelinePosition;
  numMeasures: number;
  timelineSettings: TimelineSettings;
  verticalScale: number;
  mixerHeight: number;
  showMixer: boolean;
  
  // Audio and playback
  audioContext: AudioContext | null;
  audioService: {
    play: (buffer?: AudioBuffer) => void;
    stop: () => void;
    getWaveformData: () => Promise<Float32Array>;
    getFrequencyData: () => Promise<Float32Array>;
  };
  
  // Timeline and positioning
  scrollToItem: {type: string; params?: any} | null;
  songRegion: Region | null;
  snapGridSize: any;
  
  // Track management
  masterTrack: Track;
  addTrack: (type: TrackType) => void;
  removeTrack: (trackId: string) => void;
  setTracks: (tracks: Track[]) => void;
  setCurrentTrack: (track: Track | null) => void;
  
  // Clip management
  createAudioClip: (data: any, pos: TimelinePosition) => Promise<Clip>;
  insertClips: (clips: Clip[], track: Track) => void;
  addClip: (trackId: string, clip: Clip) => void;
  removeClip: (trackId: string, clipId: string) => void;
  setCurrentClip: (clip: Clip | null) => void;
  
  // Playback controls
  startPlayback: (startPosition?: TimelinePosition) => void;
  stopPlayback: () => void;
  togglePlayback: () => void;
  startRecording: (trackId: string, deviceId?: string) => Promise<void>;
  stopRecording: () => Promise<Clip | null>;
  
  // Timeline controls
  setPlayheadPos: (pos: TimelinePosition) => void;
  setPosition: (position: TimelinePosition) => void;
  adjustNumMeasures: (pos?: TimelinePosition) => void;
  setSongRegion: (region: Region | null) => void;
  setScrollToItem: (item: {type: string; params?: any} | null) => void;
  updateTimelineSettings: (updater: TimelineSettings | ((settings: TimelineSettings) => TimelineSettings)) => void;
  setVerticalScale: (scale: number) => void;
  setMixerHeight: (height: number) => void;
  
  // UI controls
  setAllowMenuAndShortcuts: (allow: boolean) => void;
  
  // Plugin system
  plugins: WorkstationPlugin[];
  registerPlugin: (plugin: WorkstationPlugin) => void;
  unregisterPlugin: (pluginId: string) => void;
  
  // Project management
  saveWorkstation: (name: string) => Promise<string>;
  loadWorkstation: (id: string) => Promise<boolean>;
  listWorkstations: () => Promise<any[]>;
  exportProject: (options?: any) => Promise<void>;
}

// Create context with proper type safety
export const WorkstationContext = createContext<WorkstationContextType | null>(null);

// Custom hook for using the workstation context
export const useWorkstation = (): WorkstationContextType => {
  const context = useContext(WorkstationContext);
  if (!context) {
    throw new Error('useWorkstation must be used within a WorkstationProvider');
  }
  return context;
};

// Comprehensive WorkstationProvider implementation
export const WorkstationProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  // Core state
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [currentClip, setCurrentClip] = useState<Clip | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [playheadPos, setPlayheadPos] = useState(new TimelinePosition());
  const [maxPos] = useState(new TimelinePosition(16, 0, 0));
  const [numMeasures, setNumMeasures] = useState(16);
  const [verticalScale, setVerticalScale] = useState(1);
  const [mixerHeight, setMixerHeight] = useState(200);
  const [showMixer, setShowMixer] = useState(true);
  const [scrollToItem, setScrollToItem] = useState<{type: string; params?: any} | null>(null);
  const [songRegion, setSongRegion] = useState<Region | null>(null);
  const [plugins, setPlugins] = useState<WorkstationPlugin[]>([]);
  
  // Timeline settings
  const [timelineSettings, setTimelineSettings] = useState<TimelineSettings>({
    tempo: 120,
    timeSignature: { beats: 4, noteValue: 4 },
    snap: true,
    snapUnit: 'beat',
    horizontalScale: 1
  });

  // Audio context and services
  const [audioContext] = useState<AudioContext | null>(() => {
    try {
      return new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch {
      return null;
    }
  });

  // Master track
  const masterTrack: Track = {
    id: 'master',
    name: 'Master',
    type: TrackType.Master,
    clips: [],
    mute: false,
    solo: false,
    volume: 1,
    pan: 0,
    color: '#ff6b6b'
  };

  // Audio service implementation
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
      return new Float32Array(1024);
    },
    getFrequencyData: async (): Promise<Float32Array> => {
      return new Float32Array(1024);
    }
  };

  // Track management
  const addTrack = (type: TrackType) => {
    const newTrack: Track = {
      id: `track_${Date.now()}`,
      name: `${type} Track ${tracks.length + 1}`,
      type,
      clips: [],
      mute: false,
      solo: false,
      volume: 1,
      pan: 0,
      color: type === TrackType.Audio ? '#4ecdc4' : '#ffe66d'
    };
    setTracks(prev => [...prev, newTrack]);
  };

  const removeTrack = (trackId: string) => {
    setTracks(prev => prev.filter(t => t.id !== trackId));
  };

  // Clip management
  const createAudioClip = async (data: any, pos: TimelinePosition): Promise<Clip> => {
    const clip: Clip = {
      id: `clip_${Date.now()}`,
      trackId: currentTrack?.id || '',
      name: 'Audio Clip',
      start: pos,
      length: new TimelinePosition(1, 0, 0),
      data: {
        type: 'audio',
        buffer: data.buffer || data.audioBuffer,
        waveform: data.waveform || []
      }
    };
    return clip;
  };

  const insertClips = (clips: Clip[], track: Track) => {
    setTracks(prev => prev.map(t => 
      t.id === track.id 
        ? { ...t, clips: [...t.clips, ...clips] }
        : t
    ));
  };

  const addClip = (trackId: string, clip: Clip) => {
    setTracks(prev => prev.map(t => 
      t.id === trackId 
        ? { ...t, clips: [...t.clips, { ...clip, trackId }] }
        : t
    ));
  };

  const removeClip = (trackId: string, clipId: string) => {
    setTracks(prev => prev.map(t => 
      t.id === trackId 
        ? { ...t, clips: t.clips.filter(c => c.id !== clipId) }
        : t
    ));
  };

  // Playback controls
  const startPlayback = (startPosition?: TimelinePosition) => {
    if (startPosition) setPlayheadPos(startPosition);
    setIsPlaying(true);
    if (audioContext?.state === 'suspended') {
      audioContext.resume();
    }
  };

  const stopPlayback = () => {
    setIsPlaying(false);
    if (audioContext) {
      audioContext.suspend();
    }
  };

  const togglePlayback = () => {
    if (isPlaying) {
      stopPlayback();
    } else {
      startPlayback();
    }
  };

  const startRecording = async (trackId: string, deviceId?: string): Promise<void> => {
    setIsRecording(true);
    // Recording implementation would go here
  };

  const stopRecording = async (): Promise<Clip | null> => {
    setIsRecording(false);
    // Return recorded clip
    return null;
  };

  // Timeline controls
  const setPosition = (position: TimelinePosition) => {
    setPlayheadPos(position);
  };

  const adjustNumMeasures = (pos?: TimelinePosition) => {
    if (pos && pos.bar >= numMeasures) {
      setNumMeasures(pos.bar + 4);
    }
  };

  const updateTimelineSettings = (updater: TimelineSettings | ((settings: TimelineSettings) => TimelineSettings)) => {
    if (typeof updater === 'function') {
      setTimelineSettings(updater);
    } else {
      setTimelineSettings(updater);
    }
  };

  // Plugin management
  const registerPlugin = (plugin: WorkstationPlugin) => {
    setPlugins(prev => [...prev.filter(p => p.id !== plugin.id), plugin]);
    if (plugin.initialize) {
      plugin.initialize(contextValue);
    }
  };

  const unregisterPlugin = (pluginId: string) => {
    const plugin = plugins.find(p => p.id === pluginId);
    if (plugin?.cleanup) {
      plugin.cleanup();
    }
    setPlugins(prev => prev.filter(p => p.id !== pluginId));
  };

  // Project management
  const saveWorkstation = async (name: string): Promise<string> => {
    const projectData = {
      name,
      tracks,
      timelineSettings,
      timestamp: Date.now()
    };
    // Save to localStorage for now
    const id = `project_${Date.now()}`;
    localStorage.setItem(id, JSON.stringify(projectData));
    return id;
  };

  const loadWorkstation = async (id: string): Promise<boolean> => {
    try {
      const data = localStorage.getItem(id);
      if (data) {
        const projectData = JSON.parse(data);
        setTracks(projectData.tracks || []);
        setTimelineSettings(projectData.timelineSettings || timelineSettings);
        return true;
      }
    } catch (error) {
      console.error('Failed to load workstation:', error);
    }
    return false;
  };

  const listWorkstations = async (): Promise<any[]> => {
    const projects = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('project_')) {
        try {
          const data = JSON.parse(localStorage.getItem(key) || '{}');
          projects.push({ id: key, ...data });
        } catch (error) {
          console.error('Failed to parse project:', error);
        }
      }
    }
    return projects;
  };

  const exportProject = async (options?: any): Promise<void> => {
    // Export implementation would go here
    console.log('Exporting project with options:', options);
  };

  // Context value
  const contextValue: WorkstationContextType = {
    // Core state
    tracks,
    currentTrack,
    currentClip,
    isPlaying,
    isRecording,
    playheadPos,
    maxPos,
    numMeasures,
    timelineSettings,
    verticalScale,
    mixerHeight,
    showMixer,
    audioContext,
    audioService,
    scrollToItem,
    songRegion,
    snapGridSize: {},
    masterTrack,
    plugins,

    // Track management
    addTrack,
    removeTrack,
    setTracks,
    setCurrentTrack,

    // Clip management
    createAudioClip,
    insertClips,
    addClip,
    removeClip,
    setCurrentClip,

    // Playback controls
    startPlayback,
    stopPlayback,
    togglePlayback,
    startRecording,
    stopRecording,

    // Timeline controls
    setPlayheadPos,
    setPosition,
    adjustNumMeasures,
    setSongRegion,
    setScrollToItem,
    updateTimelineSettings,
    setVerticalScale,
    setMixerHeight,

    // UI controls
    setAllowMenuAndShortcuts: () => {},

    // Plugin system
    registerPlugin,
    unregisterPlugin,

    // Project management
    saveWorkstation,
    loadWorkstation,
    listWorkstations,
    exportProject
  };

  return (
    <WorkstationContext.Provider value={contextValue}>
      {children}
    </WorkstationContext.Provider>
  );
};

export default WorkstationContext;
