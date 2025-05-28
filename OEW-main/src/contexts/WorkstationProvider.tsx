import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react";
import type { ReactNode } from "react";
import {
  AutomationLane,
  AutomationLaneEnvelope,
  AutomationNode,
  Clip,
  ContextMenuType,
  FXChainPreset,
  Region,
  SnapGridSizeOption,
  TimelinePosition,
  TimelineSettings,
  TimeSignature,
  Track,
  TrackType,
  WorkstationAudioInputFile,
} from "../services/types/types";
import data from "../tempData";
import {
  ClipboardContext,
  ClipboardItemType,
  PreferencesContext,
  ScrollToItem,
} from ".";
import { v4 } from "uuid";
import {
  clipAtPos,
  preservePosMargin,
  BASE_BEAT_WIDTH,
  sliceClip,
  getRandomTrackColor,
  volumeToNormalized,
  normalizedToVolume,
  preserveTrackMargins,
  getMaxMeasures,
  removeAllClipOverlap,
  preserveClipMargins,
  copyClip,
  automatedValueAtPos,
  GRID_MIN_INTERVAL_WIDTH,
} from "../services/utils/utils";
import {
  audioBufferToBuffer,
  audioContext,
  concatAudioBuffer,
} from "../services/utils/audio";
import { electronAPI, openContextMenu } from "../services/electron/utils";
import {
  clamp,
  cmdOrCtrl,
  inverseLerp,
  isMacOS,
  lerp,
} from "../services/utils/general";
import {
  TOGGLE_MASTER_TRACK,
  TOGGLE_MIXER,
  ADD_TRACK,
  OPEN_PREFERENCES,
} from "../services/electron/channels";

// Define the missing types and functions
/**
 * Represents the audio content of a clip
 */
interface ClipAudio {
  audioBuffer: AudioBuffer | null;
  buffer: ArrayBuffer;
  end: TimelinePosition;
  start: TimelinePosition;
  sourceDuration: number;
  type: string;
}

/**
 * Creates a new master track with default settings
 * @returns A master track instance
 */
function getBaseMasterTrack(): Track {
  return {
    id: "master-track",
    name: "Master",
    type: TrackType.Master,
    clips: [],
    volume: 1,
    pan: 0,
    solo: false,
    mute: false,
    armed: false,
    automation: false,
    automationLanes: [],
    color: "#e53935", // Default master track color - red
    fx: {
      preset: null,
      effects: [],
      selectedEffectIndex: 0,
    },
  };
}

/**
 * Creates a base track with default settings
 * @returns A track instance with default properties
 */
function getBaseTrack(): Track {
  return {
    id: v4(),
    name: "Track",
    type: TrackType.Audio,
    clips: [],
    volume: 1,
    pan: 0,
    solo: false,
    mute: false,
    armed: false,
    automation: false,
    automationLanes: [],
    color: getRandomTrackColor(),
    fx: {
      preset: null,
      effects: [],
      selectedEffectIndex: 0,
    },
  };
}

// Define interface for ClipboardContext
interface ClipboardContextType {
  clipboardItem: any;
  copy: (item: any) => void;
}

// Define interface for PreferencesContext with all required properties
interface PreferencesContextType {
  setShowPreferences: (show: boolean) => void;
  darkMode: boolean;
  preferences: any;
  savePreferences: (prefs: any) => void;
  savedPreferences: any;
  // Add other properties needed by the context
  // These are placeholders until actual types are known
  showPreferences: boolean;
  setDarkMode: (dark: boolean) => void;
}

// Define WorkstationContextType interface
interface WorkstationContextType {
  addNode: (track: Track, lane: AutomationLane, node: AutomationNode) => void;
  addTrack: (type: TrackType) => void;
  adjustNumMeasures: (pos?: TimelinePosition) => void;
  allowMenuAndShortcuts: boolean;
  autoGridSize: { measures: number; beats: number; fraction: number };
  consolidateClip: (clip: Clip) => void;
  createAudioClip: (file: WorkstationAudioInputFile, pos: TimelinePosition) => Promise<Clip | null>;
  createClipFromTrackRegion: () => void;
  deleteClip: (clip: Clip) => void;
  deleteNode: (node: AutomationNode) => void;
  deleteTrack: (track: Track) => void;
  duplicateClip: (clip: Clip) => void;
  duplicateTrack: (track: Track) => void;
  fxChainPresets: FXChainPreset[];
  getTrackCurrentValue: (track: Track, lane: AutomationLane | undefined) => { isAutomated: boolean; value: any };
  insertClips: (newClips: Clip[], track: Track) => void;
  isLooping: boolean;
  isPlaying: boolean;
  isRecording: boolean;
  masterTrack: Track;
  maxPos: TimelinePosition;
  metronome: boolean;
  mixerHeight: number;
  numMeasures: number;
  pasteClip: (pos: TimelinePosition, targetTrack?: Track) => void;
  pasteNode: (pos: TimelinePosition, targetLane?: AutomationLane) => void;
  playheadPos: TimelinePosition;
  scrollToItem: ScrollToItem | null;
  selectedClipId: string | null;
  selectedNodeId: string | null;
  selectedTrackId: string | null;
  setAllowMenuAndShortcuts: React.Dispatch<React.SetStateAction<boolean>>;
  setFXChainPresets: React.Dispatch<React.SetStateAction<FXChainPreset[]>>;
  setIsLooping: React.Dispatch<React.SetStateAction<boolean>>;
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  setIsRecording: React.Dispatch<React.SetStateAction<boolean>>;
  setLane: (track: Track, lane: AutomationLane) => void;
  setMetronome: React.Dispatch<React.SetStateAction<boolean>>;
  setMixerHeight: React.Dispatch<React.SetStateAction<number>>;
  setNumMeasures: React.Dispatch<React.SetStateAction<number>>;
  setPlayheadPos: React.Dispatch<React.SetStateAction<TimelinePosition>>;
  setScrollToItem: React.Dispatch<React.SetStateAction<ScrollToItem | null>>;
  setSelectedClipId: React.Dispatch<React.SetStateAction<string | null>>;
  setSelectedNodeId: React.Dispatch<React.SetStateAction<string | null>>;
  setSelectedTrackId: React.Dispatch<React.SetStateAction<string | null>>;
  setShowMaster: React.Dispatch<React.SetStateAction<boolean>>;
  setShowMixer: React.Dispatch<React.SetStateAction<boolean>>;
  setShowTimeRuler: React.Dispatch<React.SetStateAction<boolean>>;
  setSnapGridSize: React.Dispatch<React.SetStateAction<{ measures: number; beats: number; fraction: number }>>;
  setSnapGridSizeOption: React.Dispatch<React.SetStateAction<SnapGridSizeOption>>;
  setSongRegion: React.Dispatch<React.SetStateAction<Region | null>>;
  setStretchAudio: React.Dispatch<React.SetStateAction<boolean>>;
  setTimeSignature: (timeSignature: TimeSignature) => void;
  setTrack: (track: Track) => void;
  setTrackRegion: React.Dispatch<React.SetStateAction<{ region: Region; trackId: string } | null>>;
  setTracks: React.Dispatch<React.SetStateAction<Track[]>>;
  setVerticalScale: React.Dispatch<React.SetStateAction<number>>;
  showMaster: boolean;
  showMixer: boolean;
  showTimeRuler: boolean;
  skipToEnd: () => void;
  skipToStart: () => void;
  snapGridSize: { measures: number; beats: number; fraction: number };
  snapGridSizeOption: SnapGridSizeOption;
  songRegion: Region | null;
  splitClip: (clip: Clip, pos: TimelinePosition) => void;
  stretchAudio: boolean;
  trackRegion: { region: Region; trackId: string } | null;
  timelineSettings: TimelineSettings;
  toggleMuteClip: (clip: Clip) => void;
  tracks: Track[];
  updateTimelineSettings: (settings: TimelineSettings | ((prev: TimelineSettings) => TimelineSettings)) => void;
  verticalScale: number;
}

// Update the context creation with explicit React namespace to avoid type conflicts
export const WorkstationContext = createContext<WorkstationContextType | null>(null);

/**
 * WorkstationProvider Component
 * 
 * This component provides the central state management for the digital audio workstation.
 * It maintains state for tracks, clips, playback controls, editing functions, and all UI interactions.
 * 
 * @param children - React child components that will have access to the workstation context
 */
export function WorkstationProvider({ children }: PropsWithChildren<{}>) {
  // Type assertion with unknown first to avoid the TypeScript error
  const { clipboardItem, copy } = useContext(ClipboardContext as unknown as React.Context<ClipboardContextType>);
  const { setShowPreferences } = useContext(PreferencesContext as unknown as React.Context<PreferencesContextType>);

  const [allowMenuAndShortcuts, setAllowMenuAndShortcuts] = useState(true);
  const [fxChainPresets, setFXChainPresets] = useState<FXChainPreset[]>(
    JSON.parse(localStorage.getItem("fx-chain-presets") || "[]")
  );
  const [isLooping, setIsLooping] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [masterTrack, setMasterTrack] = useState(getBaseMasterTrack());
  const [metronome, setMetronome] = useState(true);
  const [mixerHeight, setMixerHeight] = useState(225);
  const [numMeasures, setNumMeasures] = useState(100);
  const [playheadPos, setPlayheadPos] = useState(TimelinePosition.start.copy());
  const [scrollToItem, setScrollToItem] = useState<ScrollToItem | null>(null);
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  const [showMaster, setShowMaster] = useState(false);
  const [showMixer, setShowMixer] = useState(false);
  const [showTimeRuler, setShowTimeRuler] = useState(false);
  const [songRegion, setSongRegion] = useState<Region | null>(null);
  const [snapGridSize, setSnapGridSize] = useState({
    measures: 0,
    beats: 0,
    fraction: 0,
  });
  const [snapGridSizeOption, setSnapGridSizeOption] =
    useState<SnapGridSizeOption>(SnapGridSizeOption.Auto);
  const [stretchAudio, setStretchAudio] = useState(false);
  const [trackRegion, setTrackRegion] = useState<{
    region: Region;
    trackId: string;
  } | null>(null);
  const [tracks, setTracks] = useState(data);
  const [verticalScale, setVerticalScale] = useState(1);
  const [timelineSettings, setTimelineSettings] = useState<TimelineSettings>({
    horizontalScale: 1,
    timeSignature: { beats: 4, noteValue: 4 },
    tempo: 120,
  });

  const allTracks = useMemo(
    () => [masterTrack, ...tracks],
    [masterTrack, tracks]
  );

  const autoGridSize = useMemo(() => {
    const { horizontalScale, timeSignature } = timelineSettings;
    const beatWidth =
      BASE_BEAT_WIDTH * horizontalScale * (4 / timeSignature.noteValue);
    const measureWidth = beatWidth * timeSignature.beats;

    if (measureWidth < GRID_MIN_INTERVAL_WIDTH * 2) {
      const measures =
        2 ** Math.ceil(Math.log2(GRID_MIN_INTERVAL_WIDTH / measureWidth));
      return { measures, beats: 0, fraction: 0 };
    } else {
      let fraction = 1000;

      if (
        beatWidth < GRID_MIN_INTERVAL_WIDTH &&
        Math.log2(timeSignature.beats) % 1 !== 0
      ) {
        for (let i = 2; i < timeSignature.beats; i++) {
          if (timeSignature.beats % i === 0) {
            fraction = i * 1000;
            if (beatWidth * i >= GRID_MIN_INTERVAL_WIDTH) break;
          }
        }
      } else {
        fraction =
          2 ** Math.ceil(Math.log2(GRID_MIN_INTERVAL_WIDTH / beatWidth)) * 1000;
      }

      return TimelinePosition.fractionToSpan(
        fraction < 2 ** -5 * 1000 ? 0 : fraction
      );
    }
  }, [timelineSettings.horizontalScale, timelineSettings.timeSignature]);

  const maxPos = useMemo(() => {
    const maxMeasures = getMaxMeasures(timelineSettings.timeSignature);
    return new TimelinePosition(maxMeasures + 1, 1, 0);
  }, [timelineSettings.timeSignature]);

  const farthestPositions = useMemo(() => {
    let editorFarthestPos = TimelinePosition.start;

    for (const track of allTracks) {
      for (const clip of track.clips) {
        if (clip.end.compareTo(editorFarthestPos) > 0)
          editorFarthestPos = clip.end;

        if (clip.loopEnd && clip.loopEnd?.compareTo(editorFarthestPos) > 0)
          editorFarthestPos = clip.loopEnd;
      }

      for (const lane of track.automationLanes) {
        if (lane.nodes) {
          for (const node of lane.nodes)
            if (node.pos.compareTo(editorFarthestPos) > 0)
              editorFarthestPos = node.pos;
        }
      }
    }

    editorFarthestPos = TimelinePosition.min(editorFarthestPos, maxPos);

    let farthestPos = TimelinePosition.max(editorFarthestPos, playheadPos);

    if (songRegion && songRegion.end.compareTo(editorFarthestPos) > 0)
      farthestPos = songRegion.end;

    if (trackRegion && trackRegion.region.end.compareTo(farthestPos) > 0)
      farthestPos = trackRegion.region.end;

    return {
      editorFarthestPos,
      farthestPos: TimelinePosition.min(farthestPos, maxPos),
    };
  }, [allTracks, songRegion, trackRegion, playheadPos]);

  const selectedClip = useMemo(() => {
    return tracks
      .map((track: Track) => track.clips)
      .flat()
      .find((clip: Clip) => clip.id === selectedClipId);
  }, [selectedClipId, tracks]);

  const selectedNode = useMemo(() => {
    return allTracks
      .map((track: Track) => track.automationLanes.map((lane: AutomationLane) => 
        lane.nodes ? lane.nodes : []).flat())
      .flat()
      .find((node: AutomationNode | undefined) => node && node.id === selectedNodeId);
  }, [selectedNodeId, allTracks]);

  const selectedTrack = useMemo(() => {
    return allTracks.find((track: Track) => track.id === selectedTrackId);
  }, [selectedTrackId, allTracks]);

  const playbackInterval = useRef<NodeJS.Timeout | null>(null);
  const playbackStartTime = useRef<number | null>(null);
  const playbackInitialPos = useRef<TimelinePosition | null>(null);

  useEffect(() => {
    if (isPlaying) {
      playbackStartTime.current = Date.now();
      playbackInitialPos.current = playheadPos.copy();

      function tick() {
        if (!isPlaying) return;
        const start = playbackStartTime.current!;
        const initialPos = playbackInitialPos.current!;
        const elapsed = (Date.now() - start) / 1000;
        const tempo = timelineSettings.tempo;
        const beatsPerSecond = tempo / 60;
        const beatsElapsed = elapsed * beatsPerSecond;
        let newPos = initialPos.add(0, beatsElapsed, 0, false);

        if (isLooping && songRegion) {
          if (newPos.compareTo(songRegion.end) >= 0) {
            // Calculate overshoot and add to start
            const overshoot = newPos.diff(songRegion.end);
            newPos = songRegion.start
              .copy()
              .add(
                overshoot.measures,
                overshoot.beats,
                overshoot.fraction,
                false
              );
            setPlayheadPos(newPos);
            // Reset timer and position for next loop
            playbackStartTime.current = Date.now();
            playbackInitialPos.current = songRegion.start.copy();
            playbackInterval.current = setTimeout(tick, 20);
            return;
          } else {
            setPlayheadPos(newPos);
            playbackInterval.current = setTimeout(tick, 20);
            return;
          }
        } else {
          setPlayheadPos(TimelinePosition.min(newPos, maxPos));
          if (newPos.compareTo(maxPos) < 0 && isPlaying) {
            playbackInterval.current = setTimeout(tick, 20);
          } else {
            setIsPlaying(false);
          }
        }
      }
      tick();

      return () => {
        if (playbackInterval.current) clearTimeout(playbackInterval.current);
      };
    } else {
      if (playbackInterval.current) clearTimeout(playbackInterval.current);
    }
    // eslint-disable-next-line
  }, [isPlaying]);

  useEffect(() => {
    function onCopy() {
      if (
        document.activeElement?.nodeName !== "INPUT" &&
        allowMenuAndShortcuts
      ) {
        if (selectedClip) {
          copy({ item: selectedClip, type: ClipboardItemType.Clip });
        } else if (selectedNode) {
          const lane = allTracks
            .map((track: Track) => track.automationLanes)
            .flat()
            .find((lane: AutomationLane) =>
              lane.nodes?.map((node: AutomationNode) => node.id).includes(selectedNode.id)
            );
          if (lane)
            copy({
              item: { node: selectedNode, lane },
              type: ClipboardItemType.Node,
            });
        }
      }
    }

    function onCut() {
      if (
        document.activeElement?.nodeName !== "INPUT" &&
        allowMenuAndShortcuts
      ) {
        onCopy();

        if (selectedClip) deleteClip(selectedClip);
        else if (selectedNode) deleteNode(selectedNode);
      }
    }

    function onKeyDown(e: KeyboardEvent) {
      if (allowMenuAndShortcuts) {
        const activeTagName = document.activeElement?.nodeName;
        const editableElementActive =
          activeTagName && ["INPUT", "TEXTAREA"].includes(activeTagName);

        switch (e.code) {
          case "KeyA":
            if (!editableElementActive) {
              if (e.shiftKey) {
                if (selectedTrack)
                  setTrack({ ...selectedTrack, armed: !selectedTrack.armed });
              } else {
                if (selectedTrack)
                  setTrack({
                    ...selectedTrack,
                    automation: !selectedTrack.automation,
                  });
              }
            }
            break;
          case "KeyC":
            if (cmdOrCtrl(e)) {
              if (e.altKey) {
                if (trackRegion) createClipFromTrackRegion();
              } else if (e.shiftKey) {
                if (selectedClip) consolidateClip(selectedClip);
              }
            }
            break;
          case "KeyD":
            if (cmdOrCtrl(e)) {
              if (selectedClip) duplicateClip(selectedClip);
              else if (selectedTrack) duplicateTrack(selectedTrack);
            }
            break;
          case "KeyM":
            if (!editableElementActive) {
              if (cmdOrCtrl(e)) {
                if (e.shiftKey) {
                  if (selectedClip) toggleMuteClip(selectedClip);
                }
              } else {
                if (selectedTrack)
                  setTrack({ ...selectedTrack, mute: !selectedTrack.mute });
              }
            }
            break;
          case "KeyP":
            if (!editableElementActive) setStretchAudio(!stretchAudio);
            break;
          case "KeyR":
            if (!editableElementActive) setIsRecording(true);
            break;
          case "KeyS":
            if (cmdOrCtrl(e)) {
              if (e.altKey) {
                if (selectedClip) splitClip(selectedClip, playheadPos);
              }
            } else {
              if (!editableElementActive) {
                if (selectedTrack)
                  setTrack({ ...selectedTrack, solo: !selectedTrack.solo });
              }
            }
            break;
          case "KeyT":
            if (!editableElementActive) setMetronome(!metronome);
            break;
          case "ArrowLeft":
            if (isMacOS() && e.metaKey && !editableElementActive) skipToStart();
            break;
          case "ArrowRight":
            if (isMacOS() && e.metaKey && !editableElementActive) skipToEnd();
            break;
          case "Backspace":
            if (!editableElementActive) handleDelete();
            break;
          case "Delete":
            if (!editableElementActive) handleDelete();
            break;
          case "End":
            if (!editableElementActive) skipToEnd();
            break;
          case "Home":
            if (!editableElementActive) skipToStart();
            break;
          case "Space":
            if (!editableElementActive) {
              e.preventDefault();

              if (isRecording) {
                setIsRecording(false);
                skipToStart();
              } else {
                setIsPlaying(!isPlaying);
              }
            }
        }
      }
    }

    function onPaste() {
      if (
        document.activeElement?.nodeName !== "INPUT" &&
        clipboardItem &&
        allowMenuAndShortcuts
      ) {
        switch (clipboardItem.type) {
          case ClipboardItemType.Clip:
            pasteClip(playheadPos);
            break;
          case ClipboardItemType.Node:
            pasteNode(playheadPos);
            break;
        }
      }
    }

    window.addEventListener("copy", onCopy);
    window.addEventListener("cut", onCut);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("paste", onPaste);

    return () => {
      window.removeEventListener("copy", onCopy);
      window.removeEventListener("cut", onCut);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("paste", onPaste);
    };
  });

  useEffect(() => {
    TimelinePosition.timelineSettings = timelineSettings;
  }, []);

  useEffect(() => {
    function handleContextMenuCapture(e: MouseEvent) {
      if (allowMenuAndShortcuts) {
        const activeNameTag = document.activeElement?.nodeName;

        if (activeNameTag && ["INPUT", "TEXTAREA"].includes(activeNameTag)) {
          const selectedText = window.getSelection()?.toString();
          openContextMenu(ContextMenuType.Text, { selectedText }, () => {});
        }
      } else {
        e.stopPropagation();
      }
    }

    function handleMouseEventCapture(e: MouseEvent) {
      if (!allowMenuAndShortcuts) e.stopPropagation();
    }

    document.addEventListener("contextmenu", handleContextMenuCapture, {
      capture: true,
    });
    document.addEventListener("mousedown", handleMouseEventCapture, {
      capture: true,
    });
    document.addEventListener("click", handleMouseEventCapture, {
      capture: true,
    });

    return () => {
      document.removeEventListener("contextmenu", handleContextMenuCapture, {
        capture: true,
      });
      document.removeEventListener("mousedown", handleMouseEventCapture, {
        capture: true,
      });
      document.removeEventListener("click", handleMouseEventCapture, {
        capture: true,
      });
    };
  }, [allowMenuAndShortcuts]);

  useEffect(() => {
    if (allowMenuAndShortcuts && electronAPI && electronAPI.ipcRenderer) {
      electronAPI.ipcRenderer.on(OPEN_PREFERENCES, () =>
        setShowPreferences(true)
      );
      electronAPI.ipcRenderer.on(TOGGLE_MASTER_TRACK, () =>
        setShowMaster((prev) => !prev)
      );
      electronAPI.ipcRenderer.on(TOGGLE_MIXER, () =>
        setShowMixer((prev) => !prev)
      );
      electronAPI.ipcRenderer.on(ADD_TRACK, (track: TrackType) =>
        addTrack(track)
      );
    }

    return () => {
      if (electronAPI && electronAPI.ipcRenderer) {
        electronAPI.ipcRenderer.removeAllListeners(OPEN_PREFERENCES);
        electronAPI.ipcRenderer.removeAllListeners(TOGGLE_MASTER_TRACK);
        electronAPI.ipcRenderer.removeAllListeners(TOGGLE_MIXER);
        electronAPI.ipcRenderer.removeAllListeners(ADD_TRACK);
      }
    };
  }, [allowMenuAndShortcuts, setShowPreferences, setShowMaster, setShowMixer, addTrack]);

  useEffect(() => adjustNumMeasures(), [farthestPositions.farthestPos]);

  useEffect(
    () =>
      localStorage.setItem("fx-chain-presets", JSON.stringify(fxChainPresets)),
    [fxChainPresets]
  );

  useEffect(() => {
    if (snapGridSizeOption === SnapGridSizeOption.Auto) {
      setSnapGridSize(autoGridSize);
    } else {
      let snapGridSize = { measures: 0, beats: 0, fraction: 0 };

      switch (snapGridSizeOption) {
        case SnapGridSizeOption.EightMeasures:
          snapGridSize = { measures: 8, beats: 0, fraction: 0 };
          break;
        case SnapGridSizeOption.FourMeasures:
          snapGridSize = { measures: 4, beats: 0, fraction: 0 };
          break;
        case SnapGridSizeOption.TwoMeasures:
          snapGridSize = { measures: 2, beats: 0, fraction: 0 };
          break;
        case SnapGridSizeOption.Measure:
          snapGridSize = { measures: 1, beats: 0, fraction: 0 };
          break;
        case SnapGridSizeOption.Beat:
          snapGridSize = { measures: 0, beats: 1, fraction: 0 };
          break;
        case SnapGridSizeOption.HalfBeat:
          snapGridSize = { measures: 0, beats: 0, fraction: 500 };
          break;
        case SnapGridSizeOption.QuarterBeat:
          snapGridSize = { measures: 0, beats: 0, fraction: 250 };
          break;
        case SnapGridSizeOption.EighthBeat:
          snapGridSize = { measures: 0, beats: 0, fraction: 125 };
          break;
        case SnapGridSizeOption.SixteenthBeat:
          snapGridSize = { measures: 0, beats: 0, fraction: 62.5 };
          break;
        case SnapGridSizeOption.ThirtySecondBeat:
          snapGridSize = { measures: 0, beats: 0, fraction: 31.25 };
          break;
        case SnapGridSizeOption.SixtyFourthBeat:
          snapGridSize = { measures: 0, beats: 0, fraction: 15.625 };
          break;
        case SnapGridSizeOption.HundredTwentyEighthBeat:
          snapGridSize = { measures: 0, beats: 0, fraction: 7.8125 };
          break;
      }

      setSnapGridSize(snapGridSize);
    }
  }, [snapGridSizeOption, autoGridSize]);

  /**
   * Adds an automation node to a track's automation lane
   * 
   * @param track - The track to add the node to
   * @param lane - The automation lane where the node should be added
   * @param node - The automation node to add
   */
  function addNode(track: Track, lane: AutomationLane, node: AutomationNode) {
    const existingNodes = lane.nodes || [];
    const nodes = [...existingNodes, node].sort((a, b) => a.pos.compareTo(b.pos));
    setLane(track, { ...lane, nodes });
    setScrollToItem({ type: "node", params: { nodeId: node.id } });
  }

  /**
   * Adds a new track to the session
   * 
   * @param type - The type of track to add (audio, midi, etc.)
   */
  function addTrack(type: TrackType) {
    const track = {
      ...getBaseTrack(),
      name: `Track ${tracks.length + 1}`,
      type,
    };
    setTracks([...tracks, track]);
    setScrollToItem({ type: "track", params: { trackId: track.id } });
  }

  /**
   * Adjusts the number of measures in the timeline based on the farthest position of clips and nodes
   * 
   * @param pos - An optional position to adjust the measures to
   */
  function adjustNumMeasures(pos?: TimelinePosition) {
    if (pos) {
      const timelineEditorWindow = document.querySelector(
        "#timeline-editor-window"
      );

      if (timelineEditorWindow) {
        const newNumMeasures = calculateNumMeasures(
          TimelinePosition.max(pos, farthestPositions.farthestPos)
        );
        const end =
          timelineEditorWindow.scrollLeft + timelineEditorWindow.clientWidth;
        const timelineEditorWindowEndPos = TimelinePosition.fromMargin(end);
        const timelineEditorWindowNumMeasures = calculateNumMeasures(
          timelineEditorWindowEndPos
        );

        if (newNumMeasures >= timelineEditorWindowNumMeasures)
          setNumMeasures(newNumMeasures);
        else if (newNumMeasures < numMeasures)
          setNumMeasures(timelineEditorWindowNumMeasures);
      }
    } else {
      setNumMeasures(calculateNumMeasures(farthestPositions.farthestPos));
    }
  }

  /**
   * Calculates the number of measures required to display a given position in the timeline
   * 
   * @param pos - The position to calculate the number of measures for
   * @returns The calculated number of measures
   */
  function calculateNumMeasures(pos: TimelinePosition) {
    const BASE_CHUNK_MEASURES = 100;

    const { noteValue, beats } = timelineSettings.timeSignature;
    const measureUnitSize = Math.ceil(
      (BASE_CHUNK_MEASURES / (4 / noteValue)) * (4 / beats)
    );
    const measures =
      measureUnitSize *
      Math.max(1, Math.ceil(pos.measure / (measureUnitSize * 0.94)));
    const maxMeasures = getMaxMeasures(timelineSettings.timeSignature);

    return Math.min(measures, maxMeasures);
  }

  /**
   * Consolidates an audio clip, merging any loops into a single clip
   * 
   * @param clip - The clip to consolidate
   * @returns ClipAudio object with consolidated audio data or null if consolidation fails
   */
  function consolidateClip(clip: Clip) {
    const track = tracks.find((t: Track) =>
      t.clips.find((c: Clip) => c.id === clip.id)
    );

    if (track) {
      const clips = track.clips.slice();

      const newClip = {
        ...clip,
        startLimit: clip.startLimit ? clip.start : undefined,
        start: clip.start,
        endLimit: clip.endLimit ? clip.loopEnd || clip.end : undefined,
        end: clip.loopEnd || clip.end,
        loopEnd: undefined,
      };

      if (clip.type === TrackType.Audio && clip.audio) {
        const audio = consolidateClipAudio(clip);
        if (audio) newClip.audio = audio;
      }

      const clipIndex = clips.findIndex((c) => c.id === clip.id);

      if (clipIndex > -1) {
        clips[clipIndex] = newClip as Clip;
        setTrack({ ...track, clips });

        if (selectedClipId !== clip.id) setSelectedClipId(newClip.id);
      }
    }
  }

  /**
   * Consolidates the audio of a clip into a single audio buffer, merging loops and applying transformations
   * 
   * @param clip - The clip to consolidate audio for
   * @returns A ClipAudio object containing the consolidated audio buffer and metadata, or null if consolidation fails
   */
  function consolidateClipAudio(clip: Clip): ClipAudio | null {
    if (clip.audio && clip.audio.audioBuffer) {
      const { numberOfChannels, sampleRate, length } = clip.audio.audioBuffer;
      let audioBuffer: AudioBuffer | null = null;

      const fullWidth = (clip.loopEnd || clip.end).diffInMargin(clip.start);
      const width = clip.end.diffInMargin(clip.start);
      const audioWidth = clip.audio.end.diffInMargin(clip.audio.start);
      const audioStartOffset = clip.start.diffInMargin(clip.audio.start);
      const audioEndOffset = audioStartOffset + width;
      const repetitions = Math.ceil(fullWidth / width);

      const audioStartOffsetPercentange = Math.max(
        0,
        audioStartOffset / audioWidth
      );
      const audioEndOffsetPercentange = audioEndOffset / audioWidth;
      const start = Math.floor(audioStartOffsetPercentange * length);
      const end = Math.floor(audioEndOffsetPercentange * length);
      const offset =
        audioStartOffset < 0
          ? Math.ceil((Math.abs(audioStartOffset) / audioWidth) * length)
          : 0;

      for (let i = 0; i < repetitions; i++) {
        const repetitionWidth = Math.min(width, fullWidth - width * i);
        const repetitionScale = repetitionWidth / audioWidth;
        const newBufferLength = Math.ceil(repetitionScale * length);
        const newBuffer = audioContext.createBuffer(
          numberOfChannels,
          newBufferLength,
          sampleRate
        );

        for (let i = 0; i < numberOfChannels; i++) {
          let channel = newBuffer.getChannelData(i);

          if (newBufferLength > offset) {
            channel.set(
              clip.audio.audioBuffer
                .getChannelData(i)
                .slice(start, end)
                .slice(0, newBufferLength - offset),
              offset
            );
          }
        }

        audioBuffer = audioBuffer
          ? concatAudioBuffer(audioBuffer, newBuffer)
          : newBuffer;
      }

      if (audioBuffer) {
        const durationMultiplier =
          audioBuffer.length / clip.audio.audioBuffer.length;

        return {
          ...clip.audio,
          audioBuffer,
          buffer: audioBufferToBuffer(audioBuffer),
          end: (clip.loopEnd || clip.end).copy(),
          sourceDuration: clip.audio.sourceDuration * durationMultiplier,
          start: clip.start.copy(),
        };
      }
    }

    return null;
  }

  /**
   * Creates an audio clip from a file with proper positioning in the timeline
   * 
   * @param file - Audio file data to create the clip from
   * @param pos - Position in the timeline where the clip should start
   * @returns Promise resolving to a new Clip object or null if creation fails
   */
  function createAudioClip(
    file: WorkstationAudioInputFile,
    pos: TimelinePosition
  ): Promise<Clip | null> {
    return new Promise((resolve) => {
      // Cast file to include buffer and type properties that might be added elsewhere
      const audioFile = file as any;
      const url = URL.createObjectURL(
        new Blob([audioFile.buffer], { type: audioFile.type })
      );
      const audio = new Audio();

      audio.src = url;

      audio.onloadedmetadata = async () => {
        const { measures, beats, fraction } = TimelinePosition.durationToSpan(
          audio.duration
        );

        const clip: Clip = {
          end: pos.add(measures, beats, fraction, false),
          endLimit: undefined,
          id: v4(),
          loopEnd: undefined,
          muted: false,
          name: audioFile.name,
          start: pos,
          startLimit: pos,
          audio: {
            audioBuffer: null,
            buffer: audioFile.buffer,
            end: pos.add(measures, beats, fraction, false),
            start: pos,
            sourceDuration: audio.duration,
            type: audioFile.type,
          },
          type: TrackType.Audio,
        };

        audio.remove();
        resolve(clip);
      };

      audio.onerror = () => {
        audio.remove();
        resolve(null);
      };
    });
  }

  /**
   * Creates a clip from a selected region in a track
   * Converts the currently active track region into a clip
   */
  function createClipFromTrackRegion() {
    if (trackRegion) {
      const track = tracks.find((track: Track) => track.id === trackRegion.trackId);

      if (track) {
        const newClip = {
          id: v4(),
          name: "Untitled",
          start: trackRegion.region.start,
          end: trackRegion.region.end,
          startLimit: undefined,
          endLimit: undefined,
          loopEnd: undefined,
          muted: false,
          type: track.type,
        } as Clip;

        insertClips([newClip], track);
        setTrackRegion(null);
        setSelectedClipId(newClip.id);
      }
    }
  }

  /**
   * Deletes a clip from the session
   * 
   * @param clip - The clip to delete
   */
  function deleteClip(clip: Clip) {
    const track = tracks.find((t: Track) =>
      t.clips.find((c: Clip) => c.id === clip.id)
    );

    if (track) {
      const newClips = track.clips.filter((c: Clip) => c.id !== clip.id);
      setTrack({ ...track, clips: newClips });
    }

    if (clip.id === selectedClipId) setSelectedClipId(null);
  }

  /**
   * Deletes an automation node from its containing track and lane
   * 
   * @param node - The node to delete
   */
  function deleteNode(node: AutomationNode) {
    const track = allTracks.find((t: Track) =>
      t.automationLanes.find((l: AutomationLane) =>
        l.nodes?.find((n: AutomationNode) => n.id === node.id)
      )
    );

    if (track) {
      const automationLanes = track.automationLanes.slice();
      const laneIndex = automationLanes.findIndex((lane: AutomationLane) =>
        lane.nodes?.find((n: AutomationNode) => n.id === node.id)
      );

      if (laneIndex > -1) {
        const nodes = automationLanes[laneIndex].nodes?.filter(
          (n: AutomationNode) => n.id !== node.id
        ) || [];
        automationLanes[laneIndex] = { ...automationLanes[laneIndex], nodes };
        setTrack({ ...track, automationLanes });
      }
    }

    if (node.id === selectedNodeId) setSelectedNodeId(null);
  }

  /**
   * Deletes a track from the session
   * 
   * @param track - The track to delete
   */
  function deleteTrack(track: Track) {
    if (track.id !== masterTrack.id) {
      setTracks(tracks.filter((t: Track) => t.id !== track.id));
      if (selectedTrackId === track.id) setSelectedTrackId(null);
    }
  }

  /**
   * Duplicates a clip, creating a copy at the same position in the timeline
   * 
   * @param clip - The clip to duplicate
   */
  function duplicateClip(clip: Clip) {
    const track = tracks.find((t: Track) =>
      t.clips.find((c: Clip) => c.id === clip.id)
    );

    if (track) {
      const newClip = clipAtPos(clip.loopEnd || clip.end, copyClip(clip));
      insertClips([newClip], track);
      setSelectedClipId(newClip.id);
    }
  }

  /**
   * Duplicates a track, including all its clips, automation, and effects
   * 
   * @param track - The track to duplicate
   */
  function duplicateTrack(track: Track) {
    if (track.id !== masterTrack.id) {
      const duplicate = { ...track, id: v4(), name: `${track.name} (Copy)` };

      duplicate.color = getRandomTrackColor();
      duplicate.clips = duplicate.clips.map((clip: Clip) => copyClip(clip));
      duplicate.fx.effects = duplicate.fx.effects.map((effect: any) => {
        return { ...effect, id: v4() };
      });
      duplicate.automationLanes = duplicate.automationLanes.map((lane: AutomationLane) => ({
        ...lane,
        id: v4(),
        nodes: lane.nodes ? lane.nodes.map((node: AutomationNode) => ({
          ...node,
          id: v4(),
          pos: node.pos.copy(),
        })) : []
      }));

      const newTracks: Track[] = tracks.slice();
      const trackIndex = newTracks.findIndex((t) => t.id === track.id);
      newTracks.splice(trackIndex + 1, 0, duplicate);

      setTracks(newTracks);
      setSelectedTrackId(duplicate.id);
      setScrollToItem({ type: "track", params: { trackId: duplicate.id } });
    }
  }

  /**
   * Retrieves the current automation value for a track parameter
   * 
   * This function determines the current value of a track parameter based on:
   * 1. If automation is active (lane has multiple nodes), it calculates the interpolated value at playhead position
   * 2. Otherwise, it returns the static value stored in the track
   * 
   * @param track - The track containing the parameter
   * @param lane - The automation lane to evaluate (volume, pan, etc.)
   * @returns An object containing:
   *   - isAutomated: boolean - Whether the parameter is currently being automated
   *   - value: number - The current value at playhead position (or static value if not automated)
   */
  function getTrackCurrentValue(
    track: Track,
    lane: AutomationLane | undefined
  ) {
    let value = null,
      isAutomated = false;

    if (lane) {
      if (lane.nodes && lane.nodes.length > 1) {
        value = automatedValueAtPos(playheadPos, lane);
        isAutomated = true;
      } else {
        switch (lane.envelope) {
          case AutomationLaneEnvelope.Volume:
            value = track.volume;
            break;
          case AutomationLaneEnvelope.Pan:
            value = track.pan;
            break;
          case AutomationLaneEnvelope.Tempo:
            value = timelineSettings.tempo;
            break;
        }
      }
    }

    return { isAutomated, value };
  }

  function handleDelete() {
    if (selectedClip) deleteClip(selectedClip);
    else if (selectedNode) deleteNode(selectedNode);
    else if (selectedTrack) deleteTrack(selectedTrack);
  }

  function insertClips(newClips: Clip[], track: Track) {
    if (newClips.length > 0) {
      let clips = track.clips.slice();

      for (const clip of newClips) {
        if (clip.start.compareTo(maxPos) < 0)
          clips.push(sliceClip(clip, maxPos)[0]);
      }

      setTrack({ ...track, clips: removeAllClipOverlap(clips) });
      setScrollToItem({ type: "clip", params: { clipId: newClips[0].id } });
    }
  }

  function pasteClip(pos: TimelinePosition, targetTrack?: Track) {
    navigator.clipboard.readText().then((text) => {
      if (
        !text &&
        clipboardItem &&
        clipboardItem.type === ClipboardItemType.Clip
      ) {
        const clip = clipboardItem.item;
        const track = targetTrack || selectedTrack;

        if (track && track.type === clip.type) {
          const newClip = { ...clipAtPos(pos, clip), id: v4() };
          insertClips([newClip], track);
          setSelectedClipId(newClip.id);
        }
      }
    });
  }

  function pasteNode(pos: TimelinePosition, targetLane?: AutomationLane) {
    navigator.clipboard.readText().then((text) => {
      if (
        !text &&
        clipboardItem &&
        clipboardItem.type === ClipboardItemType.Node
      ) {
        const item = clipboardItem.item;
        const node = item.node;
        const lane =
          targetLane ||
          selectedTrack?.automationLanes.find(
            (lane: AutomationLane) => lane.envelope === item.lane.envelope
          );
        const track = allTracks.find((track: Track) =>
          track.automationLanes.find((l: AutomationLane) => l.id === lane?.id)
        );

        if (track && lane) {
          const normalized =
            item.lane.envelope === AutomationLaneEnvelope.Volume
              ? volumeToNormalized(node.value)
              : inverseLerp(node.value, item.lane.minValue, item.lane.maxValue);
          const value =
            lane.envelope === AutomationLaneEnvelope.Volume
              ? normalizedToVolume(normalized)
              : lerp(normalized, lane.minValue, lane.maxValue);
          const newNode = {
            id: v4(),
            pos,
            value: clamp(value, lane.minValue, lane.maxValue),
          };

          addNode(track, lane, newNode);
          setSelectedNodeId(newNode.id);
        }
      }
    });
  }

  function setLane(track: Track, lane: AutomationLane) {
    const automationLanes = track.automationLanes.slice();
    const index = automationLanes.findIndex((l: AutomationLane) => l.id === lane.id);

    if (index > -1) {
      automationLanes[index] = lane;
      setTrack({ ...track, automationLanes });
    }
  }

  function setTimeSignature(timeSignature: TimeSignature) {
    const newTimelineSettings = { ...timelineSettings, timeSignature };

    setMasterTrack(preserveTrackMargins(masterTrack, newTimelineSettings));
    setTracks(
      tracks.map((track: Track) => preserveTrackMargins(track, newTimelineSettings))
    );
    setPlayheadPos(preservePosMargin(playheadPos, newTimelineSettings));

    if (songRegion) {
      const newSongRegion = {
        start: preservePosMargin(songRegion.start, newTimelineSettings),
        end: preservePosMargin(songRegion.end, newTimelineSettings),
      };

      setSongRegion(
        newSongRegion.end.compareTo(newSongRegion.start) > 0
          ? newSongRegion
          : null
      );
    }

    if (trackRegion) {
      const newTrackRegion = {
        start: preservePosMargin(trackRegion.region.start, newTimelineSettings),
        end: preservePosMargin(trackRegion.region.end, newTimelineSettings),
      };

      setTrackRegion(
        newTrackRegion.end.compareTo(newTrackRegion.start) > 0
          ? { ...trackRegion, region: newTrackRegion }
          : null
      );
    }

    if (clipboardItem) {
      const { item, type } = clipboardItem;

      switch (type) {
        case ClipboardItemType.Clip:
          copy({
            ...clipboardItem,
            item: preserveClipMargins(item, newTimelineSettings),
          });
          break;
        case ClipboardItemType.Node:
          const node = {
            ...item.node,
            pos: preservePosMargin(item.node.pos, newTimelineSettings),
          };
          copy({ ...clipboardItem, item: { ...item, node } });
          break;
      }
    }

    updateTimelineSettings(newTimelineSettings);
  }

  function setTrack(track: Track) {
    if (track.id === masterTrack.id) setMasterTrack(track);
    else setTracks(tracks.map((t: Track) => (t.id === track.id ? track : t)));
  }

  function skipToEnd() {
    const notAtSongRegionEnd =
      songRegion && !playheadPos.equals(songRegion.end);
    setPlayheadPos(
      notAtSongRegionEnd ? songRegion.end : farthestPositions.editorFarthestPos
    );
    setScrollToItem({ type: "cursor", params: { alignment: "center" } });
  }

  function skipToStart() {
    const notAtSongRegionStart =
      songRegion && !playheadPos.equals(songRegion.start);
    setPlayheadPos(
      notAtSongRegionStart ? songRegion.start : TimelinePosition.start
    );
    setScrollToItem({ type: "cursor", params: { alignment: "center" } });
  }

  function splitClip(clip: Clip, pos: TimelinePosition) {
    const track = tracks.find((t: Track) => t.clips.find((c: Clip) => c.id === clip.id));

    if (track && pos.compareTo(clip.start) > 0) {
      const clipSlices = sliceClip(clip, pos);
      setTrack({
        ...track,
        clips: track.clips.filter((c: Clip) => c.id !== clip.id).concat(clipSlices),
      });
    }
  }

  function toggleMuteClip(clip: Clip) {
    const track = tracks.find((t: Track) => t.clips.find((c: Clip) => c.id === clip.id));

    if (track) {
      const newClip = { ...clip, muted: !clip.muted };
      setTrack({
        ...track,
        clips: track.clips.map((c: Clip) => (c.id === clip.id ? newClip : c)),
      });
    }
  }

  function updateTimelineSettings(
    settings: TimelineSettings | ((prev: TimelineSettings) => TimelineSettings)
  ) {
    setTimelineSettings((prev: TimelineSettings) => {
      TimelinePosition.timelineSettings =
        typeof settings === "function" ? settings(prev) : settings;
      return TimelinePosition.timelineSettings;
    });
  }

  // Create value object
  const contextValue: WorkstationContextType = {
    addNode,
    addTrack,
    adjustNumMeasures,
    allowMenuAndShortcuts,
    autoGridSize,
    consolidateClip,
    createAudioClip,
    createClipFromTrackRegion,
    deleteClip,
    deleteNode,
    deleteTrack,
    duplicateClip,
    duplicateTrack,
    fxChainPresets,
    getTrackCurrentValue,
    insertClips,
    isLooping,
    isPlaying,
    isRecording,
    masterTrack,
    maxPos,
    metronome,
    mixerHeight,
    numMeasures,
    pasteClip,
    pasteNode,
    playheadPos,
    scrollToItem,
    selectedClipId,
    selectedNodeId,
    selectedTrackId,
    setAllowMenuAndShortcuts,
    setFXChainPresets,
    setIsLooping,
    setIsPlaying,
    setIsRecording,
    setLane,
    setMetronome,
    setMixerHeight,
    setNumMeasures,
    setPlayheadPos,
    setScrollToItem,
    setSelectedClipId,
    setSelectedNodeId,
    setSelectedTrackId,
    setShowMaster,
    setShowMixer,
    setShowTimeRuler,
    setSnapGridSize,
    setSnapGridSizeOption,
    setSongRegion,
    setStretchAudio,
    setTimeSignature,
    setTrack,
    setTrackRegion,
    setTracks,
    setVerticalScale,
    showMaster,
    showMixer,
    showTimeRuler,
    skipToEnd,
    skipToStart,
    snapGridSize,
    snapGridSizeOption,
    songRegion,
    splitClip,
    stretchAudio,
    trackRegion,
    timelineSettings,
    toggleMuteClip,
    tracks,
    updateTimelineSettings,
    verticalScale,
  };

  return React.createElement(
    WorkstationContext.Provider,
    { value: contextValue },
    children
  );
}
