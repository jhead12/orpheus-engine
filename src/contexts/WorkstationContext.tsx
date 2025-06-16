import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import {
  TimelinePosition,
  Track,
  Clip,
  TrackType,
  AutomationMode,
  AutomationLane,  
  AutomationNode,
  TimelineSettings,
} from "../types/core";

export interface WorkstationContextType {
  addNode: (track: Track, lane: AutomationLane, node: AutomationNode) => void;
  addTrack: (type: TrackType) => void;
  adjustNumMeasures: (pos?: TimelinePosition) => void;
  allowMenuAndShortcuts?: boolean;
  consolidateClip?: (clip: Clip) => void;
  createAudioClip: (file: File | Blob, position?: TimelinePosition) => Promise<Clip | null>;
  createClipFromTrackRegion: () => void;
  deleteClip?: (clip: Clip) => void;
  deleteNode?: (track: Track, lane: AutomationLane, node: AutomationNode) => void;
  deleteTrack?: (track: Track) => void;
  duplicateClip?: (clip: Clip) => void;
  duplicateTrack?: (trackId: string) => void;
  getTrackCurrentValue?: (track: Track) => number;
  insertClips: (clips: Clip[], trackId: string, position?: TimelinePosition) => void;
  isLooping?: boolean;
  isPlaying: boolean;
  isRecording?: boolean;
  masterTrack: Track;
  maxPos: TimelinePosition;
  numMeasures: number;
  pasteClip?: (trackId: string, position: TimelinePosition) => void;
  pasteNode: (pos: TimelinePosition, lane: AutomationLane) => void;
  playheadPos: TimelinePosition;
  scrollToItem?: string | null;
  selectedClipId?: string | null;
  selectedNodeId?: string | null;
  selectedTrackId: string | null;
  setAllowMenuAndShortcuts?: (allow: boolean) => void;
  setIsLooping?: (isLooping: boolean) => void;
  setIsPlaying?: (isPlaying: boolean) => void;
  setIsRecording?: (isRecording: boolean) => void;
  setLane: (track: Track, lane: AutomationLane) => void;
  setMetronome?: (value: boolean) => void;
  setPlayheadPos: (pos: TimelinePosition) => void;
  setScrollToItem?: (id: string | null) => void;
  setSelectedClipId?: (id: string | null) => void;
  setSelectedNodeId?: (id: string | null) => void;
  setSelectedTrackId: (id: string | null) => void;
  setShowTimeRuler?: (show: boolean) => void;
  setSnapGridSizeOption?: (option: string) => void;
  setSongRegion?: (region: any | null) => void;
  setStretchAudio?: (stretch: boolean) => void;
  setTimeSignature?: (timeSignature: { beats: number; noteValue: number }) => void;
  setTrack: (track: Track) => void;
  setTrackRegion?: (region: any | null, trackId?: string) => void;
  setTracks: (tracks: Track[]) => void;
  setVerticalScale?: (scale: number) => void;
  showMaster: boolean;
  showTimeRuler?: boolean;
  skipToEnd?: () => void;
  skipToStart?: () => void;
  snapGridSize: TimelinePosition;
  snapGridSizeOption?: string;
  songRegion?: any | null;
  splitClip?: (clip: Clip, position: TimelinePosition) => void;
  stretchAudio?: boolean;
  timelineSettings: TimelineSettings;
  toggleMuteClip?: (clipId: string) => void;
  trackRegion: any | null;
  tracks: Track[];
  updateTimelineSettings: (updater: (prev: TimelineSettings) => TimelineSettings) => void;
  verticalScale: number;
}

export const WorkstationContext = createContext<WorkstationContextType | null>(null);

export const useWorkstation = (): WorkstationContextType => {
  const context = useContext(WorkstationContext);
  if (!context) {
    throw new Error("useWorkstation must be used within a WorkstationProvider");
  }
  return context;
};

interface WorkstationProviderProps {
  children: ReactNode;
}

export const WorkstationProvider: React.FC<WorkstationProviderProps> = ({
  children,
}) => {
  // State management
  const [tracks, setTracks] = useState<Track[]>([]);
  const [masterTrack] = useState<Track>({
    id: "master",
    name: "Master",
    type: TrackType.Audio,
    color: "#444",
    volume: { value: 1, isAutomated: false },
    pan: { value: 0, isAutomated: false },
    mute: false,
    solo: false,
    armed: false,
    clips: [],
    effects: [],
    automationLanes: [],
    automation: false,
    automationMode: AutomationMode.Read,
    fx: {
      preset: null,
      selectedEffectIndex: 0,
      effects: [],
    },
  });
  const [playheadPos, setPlayheadPos] = useState<TimelinePosition>(
    new TimelinePosition(0, 0, 0)
  );
  const [isPlaying] = useState<boolean>(false);
  const [numMeasures, setNumMeasures] = useState<number>(32);
  const [maxPos, setMaxPos] = useState<TimelinePosition>(
    new TimelinePosition(32, 0, 0)
  );
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  const [verticalScale] = useState<number>(1);
  const [showMaster] = useState<boolean>(true);
  const [timelineSettings, setTimelineSettings] = useState<TimelineSettings>({
    tempo: 120,
    beatWidth: 48,
    timeSignature: { beats: 4, noteValue: 4 },
    horizontalScale: 1,
    snap: true,
    snapUnit: "beat"
  });
  const [snapGridSize] = useState<TimelinePosition>(new TimelinePosition(0, 1, 0));
  const [trackRegion] = useState<any | null>(null);

  // Callbacks
  const setTrack = useCallback((track: Track) => {
    const newTracks = [...tracks];
    const index = newTracks.findIndex(t => t.id === track.id);
    if (index !== -1) {
      newTracks[index] = track;
      setTracks(newTracks);
    }
  }, [tracks]);

  const addNode = useCallback((track: Track, lane: AutomationLane, node: AutomationNode) => {
    const updatedTrack = { ...track };
    const laneIndex = updatedTrack.automationLanes.findIndex(l => l.id === lane.id);
    if (laneIndex > -1) {
      updatedTrack.automationLanes[laneIndex] = {
        ...lane,
        nodes: [...(lane.nodes || []), node].sort((a, b) => a.pos.compareTo(b.pos))
      };
      setTrack(updatedTrack);
    }
  }, [setTrack]);

  const pasteNode = useCallback((/* pos: TimelinePosition, lane: AutomationLane */) => {
    // Implementation for pasting automation nodes
    // This will be implemented when clipboard functionality is needed
  }, []);

  const setLane = useCallback((track: Track, lane: AutomationLane) => {
    const updatedTrack = { ...track };
    const laneIndex = updatedTrack.automationLanes.findIndex(l => l.id === lane.id);
    if (laneIndex > -1) {
      updatedTrack.automationLanes[laneIndex] = lane;
      setTrack(updatedTrack);
    }
  }, [setTrack]);

  const updateTimelineSettings = useCallback((updater: (prev: TimelineSettings) => TimelineSettings) => {
    setTimelineSettings(updater);
  }, []);

  // Context value
  const value: WorkstationContextType = {
    addNode,
    adjustNumMeasures: (pos?: TimelinePosition) => {
      if (pos) {
        setNumMeasures(pos.measure + 1);
        setMaxPos(new TimelinePosition(pos.measure + 1, 0, 0));
      }
    },
    createAudioClip: async (/* file: File | Blob, position?: TimelinePosition */) => {
      // Implementation for creating audio clips
      return null;
    },
    createClipFromTrackRegion: () => {
      // Implementation for creating clips from track region
    },
    insertClips: (/* clips: Clip[], track: Track */) => {
      // Implementation for inserting clips
    },
    isPlaying,
    masterTrack,
    maxPos,
    numMeasures,
    pasteNode,
    playheadPos,
    selectedTrackId,
    setLane,
    setPlayheadPos,
    setSelectedTrackId,
    setTrack,
    setTracks,
    showMaster,
    snapGridSize,
    timelineSettings,
    trackRegion,
    tracks,
    updateTimelineSettings,
    verticalScale,
  };

  return (
    <WorkstationContext.Provider value={value}>
      {children}
    </WorkstationContext.Provider>
  );
};
