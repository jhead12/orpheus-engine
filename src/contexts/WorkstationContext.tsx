import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { TimelinePosition, Track, Clip, TrackType, AutomationMode } from "../types/core";

interface ScrollToItem {
  type: string;
  params: Record<string, unknown>;
}

interface TimelineSettingsType {
  beatWidth: number;
  timeSignature: { beats: number; noteValue: number };
  horizontalScale: number;
}

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
  timelineSettings: TimelineSettingsType;
  toggleMuteClip: (clip: Clip) => void;
  tracks: Track[];
  verticalScale: number;

  // Track management
  addTrack: (type?: string) => void;
  createAudioClip: (
    file: File,
    position: TimelinePosition
  ) => Promise<Clip | null>;
  insertClips: (
    clips: Clip[],
    track: Track
  ) => void;
  masterTrack: Track;
  selectTrack: (trackId: string) => void;
  selectedTrackId: string | null;
  setSelectedTrackId: (id: string | null) => void;
  updateTrack: (trackId: string, updates: Partial<Track>) => void;
  deleteTrack: (trackId: string) => void;

  // Project management
  exportProject: () => Promise<void>;
  importProject: (file: File) => Promise<void>;
  newProject: () => void;
  openProject: (file: File) => Promise<void>;
  projectFile: File | null;
  projectName: string;
  saveProject: () => Promise<void>;
  saveProjectAs: (name: string) => Promise<void>;
  setProjectName: (name: string) => void;

  // Playback controls
  isPlaying: boolean;
  isRecording: boolean;
  pause: () => void;
  play: () => void;
  record: () => void;
  stop: () => void;

  // Tempo and timing
  tempo: number;
  setTempo: (tempo: number) => void;
  metronomeEnabled: boolean;
  setMetronomeEnabled: (enabled: boolean) => void;
  recordingEnabled: boolean;
  setRecordingEnabled: (enabled: boolean) => void;

  // Timeline management
  maxPos: TimelinePosition;
  numMeasures: number;
  setPlayheadPos: (pos: TimelinePosition) => void;
  setTracks: (tracks: Track[]) => void;
  setVerticalScale: (scale: number | ((prev: number) => number)) => void;
  setMaxPos: (pos: TimelinePosition) => void;
  setNumMeasures: (num: number) => void;
  setMaxPosFromClips: () => void;
  songRegion: { start: TimelinePosition; end: TimelinePosition } | null;
  trackRegion: { start: TimelinePosition; end: TimelinePosition } | null;
  updateTimelineSettings: (updater: (prev: TimelineSettingsType) => TimelineSettingsType) => void;
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
  const [scrollToItem, setScrollToItem] = useState<ScrollToItem | null>(null);
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
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [tempo, setTempo] = useState<number>(120);
  const [metronomeEnabled, setMetronomeEnabled] = useState<boolean>(false);
  const [recordingEnabled, setRecordingEnabled] = useState<boolean>(false);
  const [projectFile, setProjectFile] = useState<File | null>(null);
  const [projectName, setProjectName] = useState<string>("Untitled");

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
    async (file: File, position: TimelinePosition): Promise<Clip | null> => {
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

  // Track management functions
  const selectTrack = useCallback((trackId: string) => {
    setSelectedTrackId(trackId);
  }, []);

  const updateTrack = useCallback((trackId: string, updates: Partial<Track>) => {
    setTracks((prevTracks) =>
      prevTracks.map((track) =>
        track.id === trackId ? { ...track, ...updates } : track
      )
    );
  }, []);

  const deleteTrack = useCallback((trackId: string) => {
    setTracks((prevTracks) => prevTracks.filter((track) => track.id !== trackId));
    if (selectedTrackId === trackId) {
      setSelectedTrackId(null);
    }
  }, [selectedTrackId]);

  // Project management functions
  const exportProject = useCallback(async () => {
    console.log('Exporting project...');
    // Placeholder implementation
  }, []);

  const importProject = useCallback(async (file: File) => {
    console.log('Importing project:', file.name);
    setProjectFile(file);
    // Placeholder implementation
  }, []);

  const newProject = useCallback(() => {
    setTracks([]);
    setSelectedClipId(null);
    setSelectedTrackId(null);
    setProjectName('Untitled');
    setProjectFile(null);
    setPlayheadPos(new TimelinePosition(0, 0, 0));
  }, []);

  const openProject = useCallback(async (file: File) => {
    console.log('Opening project:', file.name);
    setProjectFile(file);
    // Placeholder implementation
  }, []);

  const saveProject = useCallback(async () => {
    console.log('Saving project...');
    // Placeholder implementation
  }, []);

  const saveProjectAs = useCallback(async (name: string) => {
    console.log('Saving project as:', name);
    setProjectName(name);
    // Placeholder implementation
  }, []);

  // Playback controls
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

  const record = useCallback(() => {
    setIsRecording(true);
    setIsPlaying(true);
  }, []);

  // Timeline management functions
  const setMaxPosFromClips = useCallback(() => {
    let maxPosition = new TimelinePosition(0, 0, 0);
    tracks.forEach(track => {
      track.clips.forEach(clip => {
        if (clip.end.toSeconds() > maxPosition.toSeconds()) {
          maxPosition = clip.end;
        }
      });
    });
    setMaxPos(maxPosition);
  }, [tracks]);

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
    
    // Track management
    addTrack,
    createAudioClip,
    insertClips,
    masterTrack,
    selectTrack,
    selectedTrackId,
    setSelectedTrackId,
    updateTrack,
    deleteTrack,

    // Project management
    exportProject,
    importProject,
    newProject,
    openProject,
    projectFile,
    projectName,
    saveProject,
    saveProjectAs,
    setProjectName,

    // Playback controls
    isPlaying,
    isRecording,
    pause,
    play,
    record,
    stop,

    // Tempo and timing
    tempo,
    setTempo,
    metronomeEnabled,
    setMetronomeEnabled,
    recordingEnabled,
    setRecordingEnabled,

    // Timeline management
    maxPos,
    numMeasures,
    setPlayheadPos,
    setTracks,
    setVerticalScale,
    setMaxPos,
    setNumMeasures,
    setMaxPosFromClips,
    songRegion,
    trackRegion,
    updateTimelineSettings,
  };

  return (
    <WorkstationContext.Provider value={contextValue}>
      {children}
    </WorkstationContext.Provider>
  );
};

export default WorkstationContext;
