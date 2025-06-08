import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { TimelinePosition, Track, Clip, TrackType, AutomationMode, AutomationLane } from "../types/core";
import { automatedValueAtPos } from "../services/utils/utils";

export interface WorkstationContextType {
  adjustNumMeasures: (pos?: TimelinePosition) => void;
  allowMenuAndShortcuts: boolean;
  consolidateClip: (clip: Clip) => void;
  deleteClip: (clip: Clip) => void;
  duplicateClip: (clip: Clip) => void;
  playheadPos: TimelinePosition;
  scrollToItem: { type: string; params: Record<string, any> } | null;
  selectedClipId: string | null;
  setAllowMenuAndShortcuts: (allow: boolean) => void;
  setScrollToItem: (
    item: { type: string; params: Record<string, any> } | null
  ) => void;
  setSelectedClipId: (id: string | null) => void;
  setSongRegion: (
    region: { start: TimelinePosition; end: TimelinePosition } | null
  ) => void;
  setTrackRegion: (
    region: { start: TimelinePosition; end: TimelinePosition } | null
  ) => void;
  snapGridSize: TimelinePosition;
  splitClip: (clip: Clip, position: TimelinePosition) => void;
  timelineSettings: {
    beatWidth: number;
    timeSignature: { beats: number; noteValue: number };
    horizontalScale: number;
  };
  toggleMuteClip: (clip: Clip) => void;
  tracks: Track[];
  verticalScale: number;

  // Additional properties needed by Editor
  addTrack: (type?: string) => void;
  createAudioClip: (
    file: any,
    position: TimelinePosition
  ) => Promise<Clip | null>;
  insertClips: (
    clips: Clip[],
    track: Track
  ) => void;
  masterTrack: Track;
  maxPos: TimelinePosition;
  numMeasures: number;
  setPlayheadPos: (pos: TimelinePosition) => void;
  setTracks: (tracks: Track[]) => void;
  setVerticalScale: (scale: number | ((prev: number) => number)) => void;
  songRegion: { start: TimelinePosition; end: TimelinePosition } | null;
  updateTimelineSettings: (updater: (prev: any) => any) => void;
  isPlaying: boolean;

  // Missing methods that tests expect
  removeTrack: (trackId: string) => void;
  updateTrack: (trackId: string, updates: Partial<Track>) => void;
  duplicateTrack: (trackId: string) => void;
  deleteTrack: (track: Track) => void;
  getTrackCurrentValue: (track: Track, lane?: any) => { value: number | null; isAutomated: boolean };
  selectedTrackId: string | null;
  setSelectedTrackId: (id: string | null) => void;
  setTrack: (track: Track) => void;
  play: () => void;
  pause: () => void;
  stop: () => void;
  settings: {
    tempo: number;
    timeSignature: { beats: number; noteValue: number };
    snap: boolean;
    snapUnit: string;
    horizontalScale: number;
  };
  setSettings: (updates: Partial<any>) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  zoomToFit: () => void;
  selection: {
    tracks: string[];
    clips: string[];
    region: { start: TimelinePosition; end: TimelinePosition } | null;
  };
  setSelection: (selection: {
    tracks: string[];
    clips: string[];
    region: { start: TimelinePosition; end: TimelinePosition } | null;
  }) => void;
  clearSelection: () => void;
  copySelection: () => void;
  pasteSelection: () => void;
  cutSelection: () => void;
  deleteSelection: () => void;
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
}

// Create the context with a default value of null
export const WorkstationContext = createContext<WorkstationContextType | null>(
  null
);

// Custom hook to use the context
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

// Provider component
export const WorkstationProvider: React.FC<WorkstationProviderProps> = ({
  children,
}) => {
  // State
  const [tracks, setTracks] = useState<Track[]>([]);
  const [masterTrack] = useState<Track>({
    id: "master",
    name: "Master",
    type: TrackType.Audio, // Use proper enum value
    color: "#444",
    volume: 1,
    pan: 0,
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
      effects: []
    }
  });
  const [playheadPos, setPlayheadPos] = useState<TimelinePosition>(
    new TimelinePosition(0, 0, 0)
  );
  const [isPlaying] = useState<boolean>(false);
  const [numMeasures, setNumMeasures] = useState<number>(32);
  const [maxPos, setMaxPos] = useState<TimelinePosition>(
    new TimelinePosition(32, 0, 0)
  );
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null);
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  const [songRegion, setSongRegion] = useState<{
    start: TimelinePosition;
    end: TimelinePosition;
  } | null>(null);
  const [trackRegion, setTrackRegion] = useState<{
    start: TimelinePosition;
    end: TimelinePosition;
  } | null>(null);
  const [scrollToItem, setScrollToItem] = useState<{
    type: string;
    params: Record<string, any>;
  } | null>(null);
  const [allowMenuAndShortcuts, setAllowMenuAndShortcuts] =
    useState<boolean>(true);
  const [verticalScale, setVerticalScale] = useState<number>(1);
  const [timelineSettings, setTimelineSettings] = useState({
    beatWidth: 60,
    timeSignature: { beats: 4, noteValue: 4 },
    horizontalScale: 1,
  });
  const [snapGridSize, setSnapGridSize] = useState<TimelinePosition>(
    new TimelinePosition(0, 1, 0)
  ); // Default: one beat

  // Additional state for missing functionality
  const [settings, setSettingsState] = useState({
    tempo: 120,
    timeSignature: { beats: 4, noteValue: 4 },
    snap: true,
    snapUnit: "beat",
    horizontalScale: 1,
  });
  const [selection, setSelection] = useState({
    tracks: [] as string[],
    clips: [] as string[],
    region: null as { start: TimelinePosition; end: TimelinePosition } | null,
  });
  const [undoStack, setUndoStack] = useState<any[]>([]);
  const [redoStack, setRedoStack] = useState<any[]>([]);
  const [clipboard, setClipboard] = useState<any>(null);

  // Methods
  const updateTimelineSettings = useCallback((updater: (prev: any) => any) => {
    setTimelineSettings((prev) => updater(prev));
  }, []);

  const addTrack = useCallback(
    (type?: string) => {
      const trackType = type === "midi" ? TrackType.Midi : TrackType.Audio;
      const newTrack: Track = {
        id: `track-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: `Track ${tracks.length + 1}`,
        type: trackType,
        color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
        volume: 1,
        pan: 0,
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
          effects: []
        }
      };
      setTracks((prev) => [...prev, newTrack]);
    },
    [tracks]
  );

  const adjustNumMeasures = useCallback(
    (pos?: TimelinePosition) => {
      if (!pos) return;

      const requiredMeasures = pos.bar + 1;
      if (requiredMeasures > numMeasures) {
        setNumMeasures(requiredMeasures);
        setMaxPos(new TimelinePosition(requiredMeasures, 0, 0));
      }
    },
    [numMeasures]
  );

  const createAudioClip = useCallback(
    async (file: any, position: TimelinePosition): Promise<Clip | null> => {
      // Placeholder implementation
      console.log(`Creating audio clip from ${file.name} at position ${position}`);
      // In a real implementation, this would process the audio file and create a clip
      const newClip: Clip = {
        id: `clip-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: file.name || 'New Clip',
        type: TrackType.Audio,
        start: position,
        end: new TimelinePosition(position.bar + 1, position.beat, position.tick),
        loopEnd: new TimelinePosition(position.bar + 1, position.beat, position.tick),
        muted: false
      };
      return newClip;
    },
    []
  );

  const insertClips = useCallback(
    (clips: Clip[], track: Track) => {
      setTracks((prevTracks) =>
        prevTracks.map((t) =>
          t.id === track.id
            ? {
                ...t,
                clips: [...t.clips, ...clips],
              }
            : t
        )
      );
    },
    []
  );

  const deleteClip = useCallback((clip: Clip) => {
    setTracks((prevTracks) =>
      prevTracks.map((track) => ({
        ...track,
        clips: track.clips.filter((c) => c.id !== clip.id),
      }))
    );
  }, []);

  const duplicateClip = useCallback((clip: Clip) => {
    setTracks((prevTracks) =>
      prevTracks.map((track) => {
        const foundClip = track.clips.find((c) => c.id === clip.id);
        if (!foundClip) return track;

        const newClip = {
          ...foundClip,
          id: `clip-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          start: new TimelinePosition(
            foundClip.end.bar,
            foundClip.end.beat,
            foundClip.end.tick
          ),
          end: new TimelinePosition(
            foundClip.end.bar + (foundClip.end.bar - foundClip.start.bar),
            foundClip.end.beat + (foundClip.end.beat - foundClip.start.beat),
            foundClip.end.tick + (foundClip.end.tick - foundClip.start.tick)
          ),
        };

        return {
          ...track,
          clips: [...track.clips, newClip],
        };
      })
    );
  }, []);

  const splitClip = useCallback((clip: Clip, position: TimelinePosition) => {
    // Placeholder implementation
    console.log(`Splitting clip ${clip.id} at position ${position}`);
  }, []);

  const consolidateClip = useCallback((clip: Clip) => {
    // Placeholder implementation
    console.log(`Consolidating clip ${clip.id}`);
  }, []);

  const toggleMuteClip = useCallback((clip: Clip) => {
    setTracks((prevTracks) =>
      prevTracks.map((track) => ({
        ...track,
        clips: track.clips.map((c) =>
          c.id === clip.id ? { ...c, muted: !c.muted } : c
        ),
      }))
    );
  }, []);

  // Missing method implementations
  const removeTrack = useCallback((trackId: string) => {
    setTracks((prev) => prev.filter((track) => track.id !== trackId));
  }, []);

  const updateTrack = useCallback((trackId: string, updates: Partial<Track>) => {
    setTracks((prev) =>
      prev.map((track) =>
        track.id === trackId ? { ...track, ...updates } : track
      )
    );
  }, []);

  const duplicateTrack = useCallback((trackId: string) => {
    setTracks((prev) => {
      const track = prev.find((t) => t.id === trackId);
      if (!track) return prev;
      
      const newTrack = {
        ...track,
        id: `track-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: `${track.name} Copy`,
        clips: track.clips.map((clip) => ({
          ...clip,
          id: `clip-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        })),
      };
      
      return [...prev, newTrack];
    });
  }, []);

  const getTrackCurrentValue = useCallback((track: Track, lane?: AutomationLane) => {
    if (!lane) {
      // Return default track values if no automation lane is provided
      return { value: track.volume, isAutomated: false };
    }

    try {
      const automatedValue = automatedValueAtPos(playheadPos, lane);
      const hasAutomation = lane.nodes && lane.nodes.length > 0;
      
      return {
        value: automatedValue,
        isAutomated: hasAutomation
      };
    } catch (error) {
      console.warn('Error getting track current value:', error);
      // Return fallback values based on track properties
      return { value: track.volume, isAutomated: false };
    }
  }, [playheadPos]);

  const play = useCallback(() => {
    console.log("Play");
    // In a real implementation, this would start audio playback
  }, []);

  const pause = useCallback(() => {
    console.log("Pause");
    // In a real implementation, this would pause audio playback
  }, []);

  const stop = useCallback(() => {
    console.log("Stop");
    // In a real implementation, this would stop audio playback and reset playhead
    setPlayheadPos(new TimelinePosition(0, 0, 0));
  }, []);

  const setSettings = useCallback((updates: Partial<typeof settings>) => {
    setSettingsState((prev) => ({ ...prev, ...updates }));
  }, []);

  const zoomIn = useCallback(() => {
    setTimelineSettings((prev) => ({
      ...prev,
      horizontalScale: Math.min(prev.horizontalScale * 1.2, 5),
    }));
  }, []);

  const zoomOut = useCallback(() => {
    setTimelineSettings((prev) => ({
      ...prev,
      horizontalScale: Math.max(prev.horizontalScale / 1.2, 0.2),
    }));
  }, []);

  const zoomToFit = useCallback(() => {
    setTimelineSettings((prev) => ({
      ...prev,
      horizontalScale: 1,
    }));
  }, []);

  const clearSelection = useCallback(() => {
    setSelection({
      tracks: [],
      clips: [],
      region: null,
    });
  }, []);

  const copySelection = useCallback(() => {
    setClipboard({
      type: "selection",
      data: {
        tracks: selection.tracks,
        clips: selection.clips,
        region: selection.region,
      },
    });
  }, [selection]);

  const pasteSelection = useCallback(() => {
    if (!clipboard || clipboard.type !== "selection") return;
    console.log("Paste selection", clipboard.data);
    // In a real implementation, this would paste the clipboard content
  }, [clipboard]);

  const cutSelection = useCallback(() => {
    copySelection();
    deleteSelection();
  }, [copySelection]);

  const deleteSelection = useCallback(() => {
    // Delete selected clips
    if (selection.clips.length > 0) {
      setTracks((prev) =>
        prev.map((track) => ({
          ...track,
          clips: track.clips.filter((clip) => !selection.clips.includes(clip.id)),
        }))
      );
    }
    
    // Delete selected tracks
    if (selection.tracks.length > 0) {
      setTracks((prev) => prev.filter((track) => !selection.tracks.includes(track.id)));
    }
    
    clearSelection();
  }, [selection, clearSelection]);

  const undo = useCallback(() => {
    if (undoStack.length === 0) return;
    
    const lastState = undoStack[undoStack.length - 1];
    setRedoStack((prev) => [tracks, ...prev]);
    setUndoStack((prev) => prev.slice(0, -1));
    setTracks(lastState);
  }, [undoStack, tracks]);

  const redo = useCallback(() => {
    if (redoStack.length === 0) return;
    
    const nextState = redoStack[0];
    setUndoStack((prev) => [...prev, tracks]);
    setRedoStack((prev) => prev.slice(1));
    setTracks(nextState);
  }, [redoStack, tracks]);

  const deleteTrack = useCallback((track: Track) => {
    setTracks((prev) => prev.filter((t) => t.id !== track.id));
    // Clear selection if the deleted track was selected
    if (selectedTrackId === track.id) {
      setSelectedTrackId(null);
    }
  }, [selectedTrackId]);

  const setTrack = useCallback((track: Track) => {
    setTracks((prev) =>
      prev.map((t) => (t.id === track.id ? track : t))
    );
  }, []);

  // Context value
  const contextValue: WorkstationContextType = {
    adjustNumMeasures,
    allowMenuAndShortcuts,
    consolidateClip,
    deleteClip,
    duplicateClip,
    playheadPos,
    scrollToItem,
    selectedClipId,
    setAllowMenuAndShortcuts,
    setScrollToItem,
    setSelectedClipId,
    setSongRegion,
    setTrackRegion,
    snapGridSize,
    splitClip,
    timelineSettings,
    toggleMuteClip,
    tracks,
    verticalScale,
    addTrack,
    createAudioClip,
    insertClips,
    masterTrack,
    maxPos,
    numMeasures,
    setPlayheadPos,
    setTracks,
    setVerticalScale,
    songRegion,
    updateTimelineSettings,
    isPlaying,
    // Missing methods
    removeTrack,
    updateTrack,
    duplicateTrack,
    deleteTrack,
    getTrackCurrentValue,
    selectedTrackId,
    setSelectedTrackId,
    setTrack,
    play,
    pause,
    stop,
    settings,
    setSettings,
    zoomIn,
    zoomOut,
    zoomToFit,
    selection,
    setSelection,
    clearSelection,
    copySelection,
    pasteSelection,
    cutSelection,
    deleteSelection,
    canUndo: undoStack.length > 0,
    canRedo: redoStack.length > 0,
    undo,
    redo,
  };

  return (
    <WorkstationContext.Provider value={contextValue}>
      {children}
    </WorkstationContext.Provider>
  );
};

export default WorkstationContext;
