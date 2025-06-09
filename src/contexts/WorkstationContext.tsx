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
} from "../types/core";

// Define types for better type safety
type WorkstationSettings = {
  tempo: number;
  timeSignature: { beats: number; noteValue: number };
  snap: boolean;
  snapUnit: string;
  horizontalScale: number;
};

type WorkstationSelection = {
  tracks: string[];
  clips: string[];
  region: { start: TimelinePosition; end: TimelinePosition } | null;
};

type ScrollToItem = {
  type: string;
  params: Record<string, unknown>;
};

type ClipboardData = {
  tracks?: Track[];
  clips?: Clip[];
  region?: { start: TimelinePosition; end: TimelinePosition } | null;
};

export interface WorkstationContextType {
  adjustNumMeasures: (pos?: TimelinePosition) => void;
  allowMenuAndShortcuts: boolean;
  consolidateClip: (clip: Clip) => void;
  deleteClip: (clip: Clip) => void;
  duplicateClip: (clip: Clip) => void;
  playheadPos: TimelinePosition;
  scrollToItem: ScrollToItem | null;
  selectedClipId: string | null;
  setAllowMenuAndShortcuts: (allow: boolean) => void;
  setScrollToItem: (item: ScrollToItem | null) => void;
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
    file: File | Blob,
    position?: TimelinePosition
  ) => Promise<Clip | null>;
  insertClips: (clips: Clip[], track: Track) => void;
  masterTrack: Track;
  maxPos: TimelinePosition;
  numMeasures: number;
  setPlayheadPos: (pos: TimelinePosition) => void;
  setTracks: (tracks: Track[]) => void;
  setVerticalScale: (scale: number | ((prev: number) => number)) => void;
  songRegion: { start: TimelinePosition; end: TimelinePosition } | null;
  trackRegion: { start: TimelinePosition; end: TimelinePosition } | null;
  updateTimelineSettings: (
    updater: (prev: {
      beatWidth: number;
      timeSignature: { beats: number; noteValue: number };
      horizontalScale: number;
    }) => {
      beatWidth: number;
      timeSignature: { beats: number; noteValue: number };
      horizontalScale: number;
    }
  ) => void;
  isPlaying: boolean;

  // Missing methods for track management
  removeTrack: (trackId: string) => void;
  updateTrack: (trackId: string, updates: Partial<Track>) => void;
  duplicateTrack: (trackId: string) => void;
  deleteTrack: (track: Track) => void;
  setTrack: (track: Track) => void;
  getTrackCurrentValue: (
    track: Track,
    lane?: AutomationLane
  ) => { value: number; isAutomated: boolean };

  // Missing methods for playback control
  play: () => void;
  pause: () => void;
  stop: () => void;
  metronome: boolean;
  setMetronome: (enabled: boolean) => void;

  // Missing methods for settings
  settings: WorkstationSettings;
  setSettings: (settings: Partial<WorkstationSettings>) => void;

  // Missing methods for zoom controls
  zoomIn: () => void;
  zoomOut: () => void;
  zoomToFit: () => void;

  // Missing methods for selection
  selection: WorkstationSelection;
  setSelection: (selection: Partial<WorkstationSelection>) => void;

  // Missing methods for clipboard operations
  clipboard: ClipboardData | null;
  copy: () => void;
  paste: () => void;
  cut: () => void;
  deleteSelection: () => void;

  // Missing methods for undo/redo
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;

  // Missing properties for mixer/track components
  selectedTrackId: string | null;
  setSelectedTrackId: (id: string | null) => void;
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
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
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
    params: Record<string, unknown>;
  } | null>(null);
  const [allowMenuAndShortcuts, setAllowMenuAndShortcuts] =
    useState<boolean>(true);
  const [verticalScale, setVerticalScale] = useState<number>(1);
  const [timelineSettings, setTimelineSettings] = useState({
    beatWidth: 60,
    timeSignature: { beats: 4, noteValue: 4 },
    horizontalScale: 1,
  });
  const snapGridSize = new TimelinePosition(0, 1, 0); // Default: one beat

  // Additional state for missing functionality
  const [settings, setSettingsState] = useState({
    tempo: 120,
    timeSignature: { beats: 4, noteValue: 4 },
    snap: true,
    snapUnit: "beat",
    horizontalScale: 1,
  });
  const [selection, setSelectionState] = useState({
    tracks: [] as string[],
    clips: [] as string[],
    region: null as { start: TimelinePosition; end: TimelinePosition } | null,
  });
  const [undoStack, setUndoStack] = useState<Record<string, unknown>[]>([]);
  const [redoStack, setRedoStack] = useState<Record<string, unknown>[]>([]);
  const [clipboard, setClipboard] = useState<ClipboardData | null>(null);
  const [metronome, setMetronome] = useState<boolean>(false);

  // Methods
  const updateTimelineSettings = useCallback(
    (updater: (prev: typeof timelineSettings) => typeof timelineSettings) => {
      setTimelineSettings((prev) => updater(prev));
    },
    []
  );

  // Settings methods
  const setSettings = useCallback(
    (newSettings: Partial<WorkstationSettings>) => {
      setSettingsState((prev) => ({ ...prev, ...newSettings }));

      // Update timeline settings if horizontalScale changed
      if (newSettings.horizontalScale !== undefined) {
        setTimelineSettings((prev) => ({
          ...prev,
          horizontalScale: newSettings.horizontalScale!,
        }));
      }
    },
    []
  );

  // Track management methods
  const removeTrack = useCallback((trackId: string) => {
    setTracks((prev) => prev.filter((track) => track.id !== trackId));
  }, []);

  const updateTrack = useCallback(
    (trackId: string, updates: Partial<Track>) => {
      setTracks((prevTracks) =>
        prevTracks.map((track) =>
          track.id === trackId ? { ...track, ...updates } : track
        )
      );
    },
    []
  );

  const duplicateTrack = useCallback((trackId: string) => {
    setTracks((prevTracks) => {
      const trackToDuplicate = prevTracks.find((t) => t.id === trackId);
      if (!trackToDuplicate) return prevTracks;

      const newTrack: Track = {
        ...trackToDuplicate,
        id: `track-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: `${trackToDuplicate.name} Copy`,
        clips: trackToDuplicate.clips.map((clip: Clip) => ({
          ...clip,
          id: `clip-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        })),
      };

      return [...prevTracks, newTrack];
    });
  }, []);

  const deleteTrack = useCallback(
    (track: Track) => {
      removeTrack(track.id);
    },
    [removeTrack]
  );

  const setTrack = useCallback(
    (track: Track) => {
      updateTrack(track.id, track);
    },
    [updateTrack]
  );

  const getTrackCurrentValue = useCallback(
    (
      track: Track,
      lane?: AutomationLane
    ): { value: number; isAutomated: boolean } => {
      if (!lane) {
        return {
          value:
            typeof track.volume === "object"
              ? track.volume.value
              : track.volume,
          isAutomated:
            typeof track.volume === "object" ? track.volume.isAutomated : false,
        };
      }
      // Simplified implementation - in real app would calculate from automation
      return {
        value:
          typeof track.volume === "object" ? track.volume.value : track.volume,
        isAutomated:
          typeof track.volume === "object" ? track.volume.isAutomated : false,
      };
    },
    []
  );

  // Playback control methods
  const play = useCallback(() => {
    setIsPlaying(true);
  }, []);

  const pause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const stop = useCallback(() => {
    setIsPlaying(false);
    setPlayheadPos(new TimelinePosition(0, 0, 0));
  }, []);

  // Zoom control methods
  const zoomIn = useCallback(() => {
    setSettings({
      horizontalScale: Math.min(10, settings.horizontalScale * 1.2),
    });
  }, [settings.horizontalScale, setSettings]);

  const zoomOut = useCallback(() => {
    setSettings({
      horizontalScale: Math.max(0.1, settings.horizontalScale / 1.2),
    });
  }, [settings.horizontalScale, setSettings]);

  const zoomToFit = useCallback(() => {
    // Calculate appropriate zoom to fit all content
    tracks.reduce((max, track) => {
      const trackMax = track.clips.reduce((clipMax: number, clip: Clip) => {
        return clip.end.bar > clipMax ? clip.end.bar : clipMax;
      }, 0);
      return trackMax > max ? trackMax : max;
    }, numMeasures);

    // Set zoom to fit content (simplified calculation)
    setSettings({ horizontalScale: Math.max(0.1, Math.min(2, 1)) });
  }, [tracks, numMeasures, setSettings]);

  // Selection methods
  const setSelection = useCallback(
    (newSelection: Partial<WorkstationSelection>) => {
      setSelectionState((prev) => ({ ...prev, ...newSelection }));
    },
    []
  );

  // Clipboard operations
  const copy = useCallback(() => {
    const selectedTracks = tracks.filter((track) =>
      selection.tracks.includes(track.id)
    );
    const selectedClips = tracks.flatMap((track) =>
      track.clips.filter((clip: Clip) => selection.clips.includes(clip.id))
    );

    setClipboard({
      tracks: selectedTracks,
      clips: selectedClips,
      region: selection.region,
    });
  }, [tracks, selection]);

  const deleteSelection = useCallback(() => {
    // Remove selected tracks
    setTracks((prev) =>
      prev.filter((track) => !selection.tracks.includes(track.id))
    );

    // Remove selected clips
    setTracks((prev) =>
      prev.map((track) => ({
        ...track,
        clips: track.clips.filter(
          (clip: Clip) => !selection.clips.includes(clip.id)
        ),
      }))
    );

    // Clear selection
    setSelectionState({
      tracks: [],
      clips: [],
      region: null,
    });
  }, [selection]);

  const paste = useCallback(() => {
    if (!clipboard) return;

    if (clipboard.tracks) {
      clipboard.tracks.forEach((track) => {
        const newTrack: Track = {
          ...track,
          id: `track-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: `${track.name} Copy`,
          clips: track.clips.map((clip: Clip) => ({
            ...clip,
            id: `clip-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          })),
        };
        setTracks((prev) => [...prev, newTrack]);
      });
    }
  }, [clipboard]);

  const cut = useCallback(() => {
    copy();
    deleteSelection();
  }, [copy, deleteSelection]);

  // Undo/Redo history management
  const addToHistory = useCallback(() => {
    const currentState = {
      tracks,
      settings,
      selection,
      playheadPos,
      selectedClipId,
      selectedTrackId,
      songRegion,
      trackRegion,
      numMeasures,
    };
    
    setUndoStack((prev) => [...prev, currentState]);
    setRedoStack([]); // Clear redo stack when new action is performed
  }, [tracks, settings, selection, playheadPos, selectedClipId, selectedTrackId, songRegion, trackRegion, numMeasures]);

  // Additional helper methods
  const canUndo = undoStack.length > 0;
  const canRedo = redoStack.length > 0;

  const undo = useCallback(() => {
    if (undoStack.length === 0) return;

    const lastState = undoStack[undoStack.length - 1];
    const currentState = {
      tracks,
      settings,
      selection,
      playheadPos,
      selectedClipId,
      selectedTrackId,
      songRegion,
      trackRegion,
      numMeasures,
    };
    
    setRedoStack((prev) => [...prev, currentState]);
    setUndoStack((prev) => prev.slice(0, -1));

    // Restore state
    if (lastState.tracks) {
      setTracks(lastState.tracks as Track[]);
    }
    if (lastState.settings) {
      setSettingsState(lastState.settings as WorkstationSettings);
    }
    if (lastState.selection) {
      setSelectionState(lastState.selection as WorkstationSelection);
    }
    if (lastState.playheadPos) {
      setPlayheadPos(lastState.playheadPos as TimelinePosition);
    }
    if (lastState.selectedClipId !== undefined) {
      setSelectedClipId(lastState.selectedClipId as string | null);
    }
    if (lastState.selectedTrackId !== undefined) {
      setSelectedTrackId(lastState.selectedTrackId as string | null);
    }
    if (lastState.songRegion !== undefined) {
      setSongRegion(lastState.songRegion as { start: TimelinePosition; end: TimelinePosition } | null);
    }
    if (lastState.trackRegion !== undefined) {
      setTrackRegion(lastState.trackRegion as { start: TimelinePosition; end: TimelinePosition } | null);
    }
    if (lastState.numMeasures) {
      setNumMeasures(lastState.numMeasures as number);
    }
  }, [undoStack, tracks, settings, selection, playheadPos, selectedClipId, selectedTrackId, songRegion, trackRegion, numMeasures]);

  const redo = useCallback(() => {
    if (redoStack.length === 0) return;

    const nextState = redoStack[redoStack.length - 1];
    const currentState = {
      tracks,
      settings,
      selection,
      playheadPos,
      selectedClipId,
      selectedTrackId,
      songRegion,
      trackRegion,
      numMeasures,
    };
    
    setUndoStack((prev) => [...prev, currentState]);
    setRedoStack((prev) => prev.slice(0, -1));

    // Restore state
    if (nextState.tracks) {
      setTracks(nextState.tracks as Track[]);
    }
    if (nextState.settings) {
      setSettingsState(nextState.settings as WorkstationSettings);
    }
    if (nextState.selection) {
      setSelectionState(nextState.selection as WorkstationSelection);
    }
    if (nextState.playheadPos) {
      setPlayheadPos(nextState.playheadPos as TimelinePosition);
    }
    if (nextState.selectedClipId !== undefined) {
      setSelectedClipId(nextState.selectedClipId as string | null);
    }
    if (nextState.selectedTrackId !== undefined) {
      setSelectedTrackId(nextState.selectedTrackId as string | null);
    }
    if (nextState.songRegion !== undefined) {
      setSongRegion(nextState.songRegion as { start: TimelinePosition; end: TimelinePosition } | null);
    }
    if (nextState.trackRegion !== undefined) {
      setTrackRegion(nextState.trackRegion as { start: TimelinePosition; end: TimelinePosition } | null);
    }
    if (nextState.numMeasures) {
      setNumMeasures(nextState.numMeasures as number);
    }
  }, [redoStack, tracks, settings, selection, playheadPos, selectedClipId, selectedTrackId, songRegion, trackRegion, numMeasures]);

  const addTrack = useCallback(
    (type?: string) => {
      const trackType = type === "midi" ? TrackType.Midi : TrackType.Audio;
      const trackTypeStr = trackType === TrackType.Midi ? "MIDI" : "Audio";

      // Count existing tracks of the same type for proper numbering
      const existingTracksOfType = tracks.filter((t) => t.type === trackType);
      const trackNumber = existingTracksOfType.length + 1;

      const newTrack: Track = {
        id: `track-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: `${trackTypeStr} Track ${trackNumber}`,
        type: trackType,
        color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
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
      };
      
      // Record current state before making changes
      addToHistory();
      
      setTracks((prev) => [...prev, newTrack]);
    },
    [tracks, addToHistory]
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
    async (
      file: File | Blob,
      position: TimelinePosition = new TimelinePosition(0, 0, 0)
    ): Promise<Clip | null> => {
      // Placeholder implementation
      const fileName = (file as File).name || "New Clip";
      console.log(
        `Creating audio clip from ${fileName} at position ${
          position || "undefined"
        }`
      );
      // In a real implementation, this would process the audio file and create a clip
      const newClip: Clip = {
        id: `clip-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: fileName,
        type: TrackType.Audio,
        start: position,
        end: new TimelinePosition(
          position.bar + 1,
          position.beat,
          position.tick
        ),
        loopEnd: new TimelinePosition(
          position.bar + 1,
          position.beat,
          position.tick
        ),
        muted: false,
      };
      return newClip;
    },
    []
  );

  const insertClips = useCallback((clips: Clip[], track: Track) => {
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
  }, []);

  const deleteClip = useCallback((clip: Clip) => {
    setTracks((prevTracks) =>
      prevTracks.map((track) => ({
        ...track,
        clips: track.clips.filter((c: Clip) => c.id !== clip.id),
      }))
    );
  }, []);

  const duplicateClip = useCallback((clip: Clip) => {
    setTracks((prevTracks) =>
      prevTracks.map((track) => {
        const foundClip = track.clips.find((c: Clip) => c.id === clip.id);
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
        clips: track.clips.map((c: Clip) =>
          c.id === clip.id ? { ...c, muted: !c.muted } : c
        ),
      }))
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
    trackRegion,
    updateTimelineSettings,
    isPlaying,
    // New methods
    removeTrack,
    updateTrack,
    duplicateTrack,
    deleteTrack,
    setTrack,
    getTrackCurrentValue,
    play,
    pause,
    stop,
    metronome,
    setMetronome,
    settings,
    setSettings,
    zoomIn,
    zoomOut,
    zoomToFit,
    selection,
    setSelection,
    clipboard,
    copy,
    paste,
    cut,
    deleteSelection,
    canUndo,
    canRedo,
    undo,
    redo,
    selectedTrackId,
    setSelectedTrackId,
  };

  return (
    <WorkstationContext.Provider value={contextValue}>
      {children}
    </WorkstationContext.Provider>
  );
};

export default WorkstationContext;
