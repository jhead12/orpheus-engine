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
  const updateTimelineSettings = useCallback((updater: (prev: typeof timelineSettings) => typeof timelineSettings) => {
    setTimelineSettings((prev) => updater(prev));
  }, []);

  const addTrack = useCallback(
    (type?: string) => {
      const trackType = type === "midi" ? TrackType.Midi : TrackType.Audio;
      const trackTypeStr = trackType === TrackType.Midi ? "MIDI" : "Audio";
      const trackNumber = tracks.filter(t => t.type === trackType).length + 1;
      
      const newTrack: Track = {
        id: `track-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: `${trackTypeStr} Track ${trackNumber}`,
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
  };

  return (
    <WorkstationContext.Provider value={contextValue}>
      {children}
    </WorkstationContext.Provider>
  );
};

export default WorkstationContext;
