import React, { HTMLAttributes, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Buffer } from "buffer";
import { v4 } from "uuid"; // Add import for v4 UUID generator
import {
  IconButton,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Tabs,
  Tab,
} from "@mui/material";
import { useResizeDetector } from "react-resize-detector";
import {
  SyncScroll,
  SyncScrollPane,
  Scrollbar,
  WindowAutoScroll,
} from "..";
import {
  TrackComponent,
  RegionComponent,
  TimelineRulerGrid,
  Lane,
  ZoomControls,
  AudioAnalysisPanel,
} from "./components";
import { Playhead as PlayheadIcon, TrackIcon } from "../icons";
import { SortableList, SortableListItem } from "../widgets";
import { WorkstationContext, AnalysisContext } from "../../contexts";
import {
  Clip,
  ContextMenuType,
  TimelinePosition,
  Track,
  TrackType,
  AudioAnalysisType,
} from "../../services/types/types";
import {
  BASE_BEAT_WIDTH,
  BASE_HEIGHT,
  isValidAudioTrackFileFormat,
  isValidTrackFileFormat,
  scrollToAndAlign,
  timelineEditorWindowScrollThresholds,
  waitForScrollWheelStop,
} from "../../services/utils/utils";
import {
  SortData,
  clamp,
  cmdOrCtrl,
  isMacOS,
  openContextMenu,
  debounce
} from "./editor-utils";

// Define getBaseTrack locally since it's not exported from utils
const getBaseTrack = (type = "audio") => ({
  id: "track-" + Math.random().toString(36).substring(2, 11),
  name: `New ${type.charAt(0).toUpperCase() + type.substring(1)} Track`,
  automationLanes: [],
  clips: [],
  color: "#" + Math.floor(Math.random() * 16777215).toString(16),
  effects: [],
  expanded: true,
  pan: 0,
  solo: false,
  muted: false,
  type: type === "midi" ? TrackType.Midi : TrackType.Audio, // Use TrackType enum instead of raw numbers
  volume: 0,
  // Add missing properties required by Track type with correct structure
  fx: {
    preset: null,
    effects: [],
    selectedEffectIndex: 0
  },
  mute: false,
  armed: false
});

export interface EditorDragData {
  items: { kind: string; type: string }[];
  target: { track: Track | null; incompatible?: boolean } | null;
}

// New interface for Audio Analysis Provider
export interface AudioAnalysisProviderProps {
  children: React.ReactNode;
}

// Create a new audio analysis context provider
export function AudioAnalysisProvider({ children }: AudioAnalysisProviderProps) {
  const [analysisType, setAnalysisType] = useState<AudioAnalysisType>(AudioAnalysisType.Spectral);
  const [selectedClip, setSelectedClip] = useState<Clip | null>(null);
  const [analysisResults, setAnalysisResults] = useState<any>(null);

  const runAudioAnalysis = async (audioBuffer: AudioBuffer, type: AudioAnalysisType) => {
    let results = null;
    
    switch (type) {
      case AudioAnalysisType.Spectral:
        // Perform spectral analysis
        results = await performSpectralAnalysis(audioBuffer);
        break;
      case AudioAnalysisType.Waveform:
        // Perform waveform analysis
        results = await performWaveformAnalysis(audioBuffer);
        break;
      case AudioAnalysisType.Features:
        // Extract audio features
        results = await extractAudioFeatures(audioBuffer);
        break;
    }
    
    setAnalysisResults(results);
    return results;
  };
  
  // Mock implementation of analysis functions
  const performSpectralAnalysis = async (_audioBuffer: AudioBuffer) => {
    // Implementation would connect to Python backend for FFT analysis
    return { type: 'spectral', data: [/* frequency data */] };
  };
  
  const performWaveformAnalysis = async (_audioBuffer: AudioBuffer) => {
    // Implementation would analyze amplitude characteristics
    return { type: 'waveform', data: [/* amplitude data */] };
  };
  
  const extractAudioFeatures = async (_audioBuffer: AudioBuffer) => {
    // Implementation would extract MFCCs, onset detection, etc.
    return { type: 'features', data: { /* feature data */ } };
  };

  const value = {
    analysisType,
    setAnalysisType,
    selectedClip,
    setSelectedClip,
    analysisResults,
    runAudioAnalysis,
  };

  return <AnalysisContext.Provider value={value}>{children}</AnalysisContext.Provider>;
}

export default function Editor() {
  const {
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
  } = useContext(WorkstationContext)!;
  
  const analysis = useContext(AnalysisContext)!;

  const { height: editorHeight, ref: editorRightRef } = useResizeDetector();

  const [dragData, setDragData] = useState<EditorDragData>({
    items: [],
    target: null,
  });
  const [lockScrolling, setLockScrolling] = useState(false);
  const [resetDragState, setResetDragState] = useState(false);
  const [scrollToBottom, setScrollToBottom] = useState(false);
  const [trackReorderData, setTrackReorderData] = useState({
    sourceIndex: -1,
    edgeIndex: -1,
  });

  const playheadRef = useRef<HTMLDivElement>(null);
  const timelineEditorWindowRef = useRef<HTMLDivElement>(null);
  const tracksSectionRef = useRef<HTMLDivElement>(null);

  const cmdCtrlPressedBeforeWheel = useRef(false);
  const dragEnter = useRef(false);
  const macOSCtrlPressed = useRef(false);
  const wheelTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const zoomAnchorPos = useRef<TimelinePosition | null>(null);
  const zoomAnchorWindowAlignment = useRef(0);

  useEffect(() => {
    function handleBlur() {
      cmdCtrlPressedBeforeWheel.current = false;
      setLockScrolling(false);
      setResetDragState(true);
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (cmdOrCtrl(e) && !cmdCtrlPressedBeforeWheel.current) {
        cmdCtrlPressedBeforeWheel.current = wheelTimeout.current === null;
        setLockScrolling(cmdCtrlPressedBeforeWheel.current);
      }

      if (e.ctrlKey) macOSCtrlPressed.current = isMacOS();
    }

    function handleKeyUp(e: KeyboardEvent) {
      if (!cmdOrCtrl(e)) {
        cmdCtrlPressedBeforeWheel.current = false;
        setLockScrolling(false);
      }
      if (!e.ctrlKey) macOSCtrlPressed.current = false;
    }

    window.addEventListener("blur", handleBlur);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      setAllowMenuAndShortcuts(true);
    };
  }, []);

  useEffect(() => {
    function handleDragEnter(e: DragEvent) {
      e.preventDefault();

      if (!dragEnter.current && e.dataTransfer) {
        const items = Array.from(e.dataTransfer.items).map((item) => ({
          kind: item.kind,
          type: item.type,
        }));
        const { clientHeight, scrollHeight, scrollTop } =
          timelineEditorWindowRef.current!;

        setDragData({
          items: items.filter((item) => isValidTrackFileFormat(item.type)),
          target: null,
        });
        setScrollToBottom(scrollTop >= scrollHeight - clientHeight);
        setAllowMenuAndShortcuts(false);
      }

      dragEnter.current = true;
    }

    function handleDragLeave(e: DragEvent) {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const outOfBounds =
        e.x <= rect.left ||
        e.x >= rect.right ||
        e.y <= rect.top ||
        e.y >= rect.bottom;
      setResetDragState(outOfBounds || !e.relatedTarget);
    }

    function handleDragOver(e: DragEvent) {
      e.preventDefault();
      if (e.dataTransfer)
        e.dataTransfer.dropEffect =
          !dragData.target || dragData.target.incompatible ? "none" : "copy";
    }

    document.body.addEventListener("dragenter", handleDragEnter, {
      capture: true,
    });
    document.body.addEventListener("dragleave", handleDragLeave);
    document.body.addEventListener("dragover", handleDragOver);

    return () => {
      document.body.removeEventListener("dragenter", handleDragEnter, {
        capture: true,
      });
      document.body.removeEventListener("dragleave", handleDragLeave);
      document.body.removeEventListener("dragover", handleDragOver);
    };
  }, [dragData.target]);

  useEffect(() => {
    if (resetDragState) {
      dragEnter.current = false;

      setDragData({ items: [], target: null });
      adjustNumMeasures();
      setAllowMenuAndShortcuts(true);
      setResetDragState(false);
    }
  }, [resetDragState]);

  useEffect(() => {
    if (zoomAnchorPos.current) {
      scrollToAndAlign(
        timelineEditorWindowRef.current!,
        { left: zoomAnchorPos.current.toMargin() },
        { left: zoomAnchorWindowAlignment.current }
      );

      zoomAnchorPos.current = null;
    }
  }, [timelineSettings.horizontalScale]);

  useEffect(() => {
    if (scrollToBottom) {
      timelineEditorWindowRef.current!.scrollTop =
        timelineEditorWindowRef.current!.clientHeight;
      setScrollToBottom(false);
    }
  }, [scrollToBottom]);

  useEffect(() => {
    if (scrollToItem?.type === "cursor") {
      const timelineEditorWindow = timelineEditorWindowRef.current!;

      waitForScrollWheelStop(timelineEditorWindow, () => {
        switch (scrollToItem.params?.alignment) {
          case "center":
            centerOnPlayhead();
            break;
          case "scrollIntoView":
            const playheadEl = playheadRef.current!;

            if (playheadEl.offsetLeft < timelineEditorWindow.scrollLeft)
              scrollToAndAlign(
                timelineEditorWindow,
                { left: playheadEl.offsetLeft },
                { left: 0.2 }
              );
            else if (
              playheadEl.offsetLeft >
              timelineEditorWindow.scrollLeft +
                timelineEditorWindow.clientWidth -
                12
            )
              scrollToAndAlign(
                timelineEditorWindow,
                { left: playheadEl.offsetLeft },
                { left: 0.8 }
              );

            break;
        }

        setScrollToItem(null);
      });
    }
  }, [scrollToItem]);

  function centerOnPlayhead() {
    scrollToAndAlign(
      timelineEditorWindowRef.current!,
      { left: playheadRef.current!.offsetLeft },
      { left: 0.5 }
    );
  }

  function changePlayheadPos(e: React.MouseEvent<HTMLDivElement>) {
    if (e.button === 0) {
      const x = e.clientX - e.currentTarget.getBoundingClientRect().x;
      const pos = TimelinePosition.fromMargin(x).snap(snapGridSize);
      setPlayheadPos(
        TimelinePosition.max(
          TimelinePosition.start,
          TimelinePosition.min(maxPos, pos)
        )
      );
    }
  }

  function dropzoneProps(
    track: Track | null
  ): Partial<HTMLAttributes<HTMLElement>> {
    const isDragTarget = track
      ? dragData.target?.track?.id === track.id
      : !dragData.target?.track;

    return {
      className:
        "dropzone" +
        (isDragTarget && dragData.target?.incompatible
          ? " invalid-track-type"
          : ""),
      onDragEnter: (e) => handleDropzoneDragEnter(e, track),
      onDragLeave: handleDropzoneDragLeave,
      onDragOver: (e) => e.preventDefault(),
      onDrop: handleDropzoneDrop,
    };
  }

  function getTrackClass(idx: number) {
    let className = "";

    const sorting =
      trackReorderData.sourceIndex > -1 && trackReorderData.edgeIndex > -1;
    const isSortTarget = sorting && trackReorderData.sourceIndex === idx;

    if (trackReorderData.edgeIndex === idx + 1) className += "sort-indicator";
    else if (trackReorderData.edgeIndex === 0 && idx === 0)
      className += "sort-indicator sort-indicator-top";

    if (isSortTarget || dragData.target?.track?.id === tracks[idx].id)
      className += " overlay-1";

    return className;
  }

  const handleDropzoneDragEnter = debounce(
    (e: React.DragEvent, track: Track | null) => {
      e.preventDefault();

      if (dragData.items.length > 0 && dragEnter.current) {
        if (!dragData.target || dragData.target.track?.id !== track?.id) {
          let incompatible = false;

          if (track) {
            switch (track.type) {
              case TrackType.Audio:
                incompatible = !dragData.items.filter((file) =>
                  isValidAudioTrackFileFormat(file.type)
                ).length;
                break;
              case TrackType.Midi:
                incompatible = !dragData.items.filter(
                  (file) => file.type === "audio/midi"
                ).length;
                break;
              default:
                incompatible = true;
            }
          }

          setDragData({ ...dragData, target: { track, incompatible } });
        }
      }
    },
    25
  );

  function handleDropzoneDragLeave(e: React.DragEvent<HTMLElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const outOfBounds =
      e.clientX < rect.left + 1 ||
      e.clientX > rect.right - 1 ||
      e.clientY < rect.top + 1 ||
      e.clientY > rect.bottom - 1;

    if (outOfBounds) {
      if (
        !e.relatedTarget ||
        !(e.relatedTarget as HTMLElement).closest(".dropzone")
      ) {
        handleDropzoneDragEnter.cancel();
        setDragData({ ...dragData, target: null });
      }
    }
  }

  async function handleDropzoneDrop(e: React.DragEvent) {
    e.preventDefault();

    if (dragData.target) {
      const files = e.dataTransfer.files;
      const clips: Clip[] = [];

      const timelineEditorWindow = timelineEditorWindowRef.current!;
      const rect = timelineEditorWindow.getBoundingClientRect();
      const margin =
        timelineEditorWindow.scrollLeft + Math.max(e.clientX - rect.left, 0);
      let pos = TimelinePosition.fromMargin(margin).snap(snapGridSize);

      for (let i = 0; i < files.length; i++) {
        if (isValidAudioTrackFileFormat(files[i].type)) {
          if (
            !dragData.target.track ||
            dragData.target.track.type === TrackType.Audio
          ) {
            const name = files[i].name.split(".")[0];
            const buffer = Buffer.from(await files[i].arrayBuffer());
            const clip = await createAudioClip(
              { 
                id: v4(), // Generate unique ID
                name, 
                path: files[i].name, 
                duration: 0, // Duration will be calculated in createAudioClip
                buffer, // If createAudioClip needs this, we'll need to update WorkstationAudioInputFile
                type: files[i].type // Same here - add to the interface if needed
              } as any, // Temporary cast to any to avoid TypeScript errors
              pos
            );

            if (clip) {
              clips.push(clip);
              if (dragData.target.track)
                pos = clip.end.copy().snap(snapGridSize, "ceil");
            }
          }
        } else if (files[i].type === "audio/midi") {
          if (
            !dragData.target.track ||
            dragData.target.track.type === TrackType.Midi
          ) {
            /* TODO */
          }
        }
      }

      if (dragData.target.track) {
        insertClips(clips, dragData.target.track);
      } else if (clips.length > 0) {
        const newTracks = clips.map((clip) => ({
          ...getBaseTrack(),
          name: clip.name || `New ${clip.type || 'Audio'} Track`, // Ensure name is never undefined
          clips: [clip],
        }));

        setTracks([...tracks, ...newTracks]);

        if (
          timelineEditorWindow.scrollTop >=
          timelineEditorWindow.scrollHeight - timelineEditorWindow.clientHeight
        )
          setScrollToItem({
            type: "track",
            params: { trackId: newTracks[newTracks.length - 1].id },
          });
      }
    }

    setAllowMenuAndShortcuts(true);
    dragEnter.current = false;
    setDragData({ items: [], target: null });
  }

  function handleSongRegionContextMenu() {
    openContextMenu(ContextMenuType.Region, {}, (params: any) => {
      switch (params.action) {
        case 1:
          setSongRegion(null);
          break;
      }
    });
  }

  function handleSortEnd(_: MouseEvent, data: SortData) {
    if (data.destIndex > -1 && data.sourceIndex !== data.destIndex) {
      const newTracks = tracks.slice();
      const [removed] = newTracks.splice(data.sourceIndex, 1);

      newTracks.splice(data.destIndex, 0, removed);

      setTracks(newTracks);
      setScrollToItem({
        type: "track",
        params: { trackId: newTracks[data.destIndex].id },
      });
    }

    setTrackReorderData({ sourceIndex: -1, edgeIndex: -1 });
    setAllowMenuAndShortcuts(true);
  }

  function handleSortStart(_: React.MouseEvent, data: SortData) {
    setTrackReorderData({
      sourceIndex: data.sourceIndex,
      edgeIndex: data.edgeIndex,
    });
    setAllowMenuAndShortcuts(false);
  }

  function handleWheel(e: React.WheelEvent) {
    if (wheelTimeout.current) clearTimeout(wheelTimeout.current);

    zoomByWheel(e);

    wheelTimeout.current = setTimeout(() => {
      wheelTimeout.current = null;
      if (!cmdCtrlPressedBeforeWheel.current) setLockScrolling(false);
    }, 250);
  }

  function handleZoom(vertical: boolean) {
    if (!vertical) {
      const timelineEditorWindow = timelineEditorWindowRef.current!;
      const playheadRect = playheadRef.current!.getBoundingClientRect();
      const windowRect = timelineEditorWindow.getBoundingClientRect();
      const playheadInWindow =
        playheadRect.right >= windowRect.left &&
        playheadRect.left <= windowRect.right;

      if (playheadInWindow) {
        zoomAnchorPos.current = playheadPos;
        zoomAnchorWindowAlignment.current = 0.5;
      } else {
        zoomAnchorPos.current = TimelinePosition.fromMargin(
          timelineEditorWindow.scrollLeft
        );
        zoomAnchorWindowAlignment.current = 0;
      }
    }
  }

  const zoomByWheel = debounce((e: React.WheelEvent) => {
    const pinch =
      e.ctrlKey &&
      !macOSCtrlPressed.current &&
      !cmdCtrlPressedBeforeWheel.current;

    if (pinch) setLockScrolling(true);

    if (dragData.items.length === 0) {
      if (cmdCtrlPressedBeforeWheel.current || pinch) {
        if (e.shiftKey || pinch || Math.abs(e.deltaX) >= Math.abs(e.deltaY)) {
          const delta =
            Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;

          if (Math.abs(delta) > 2) {
            const timelineEditorWindow = timelineEditorWindowRef.current!;
            const rect = timelineEditorWindow.getBoundingClientRect();
            const margin =
              e.clientX - rect.left + timelineEditorWindow.scrollLeft;

            zoomAnchorPos.current = TimelinePosition.fromMargin(margin);
            zoomAnchorWindowAlignment.current =
              (e.clientX - rect.left) / timelineEditorWindow.clientWidth;

            updateTimelineSettings((prev: any) => {
              const sign = Math.sign(delta) * (e.shiftKey || pinch ? -1 : 1);
              const horizontalScale =
                prev.horizontalScale + prev.horizontalScale * 0.15 * sign;
              return {
                ...prev,
                horizontalScale: clamp(horizontalScale, 0.01, 50),
              };
            });
          }
        } else {
          if (Math.abs(e.deltaY) > 5)
            setVerticalScale((prev: number) =>
              clamp(prev + (e.deltaY < 0 ? 0.25 : -0.25), 0.75, 5)
            );
        }
      }
    }
  }, 15);

  const dropzonePlaceholderTracks = useMemo(() => {
    return dragData.items.map((item) => {
      const track = { ...getBaseTrack("placeholder"), name: "" };

      if (item.type === "audio/midi") track.type = TrackType.Midi;

      return track;
    });
  }, [dragData.items]);

  const { horizontalScale, timeSignature } = timelineSettings;
  const beatWidth =
    BASE_BEAT_WIDTH * horizontalScale * (4 / timeSignature.noteValue);
  const measureWidth = beatWidth * timeSignature.beats;
  const editorWidth = measureWidth * numMeasures;
  const maxEditorWidth = maxPos.toMargin();

  const placeholderDragTargetHeight =
    BASE_HEIGHT * verticalScale * dragData.items.length;

  const style = {
    container: {
      position: "relative",
      overflow: "hidden",
      backgroundColor: "var(--bg1)",
    },
    editorLeftTop: {
      position: "sticky",
      top: 0,
      height: 33,
      backgroundColor: "var(--bg2)",
      borderBottom: "1px solid var(--border1)",
      zIndex: 17,
    },
    speedDial: {
      boxShadow: "none",
      backgroundColor: "var(--color1)",
      width: 24,
      height: 24,
      minHeight: 0,
    },
    placeholderTrack: {
      display:
        !!dragData.target && dragData.target.track === null ? "flex" : "none",
      pointerEvents: "none",
    },
    editorRight: {
      position: "relative",
      flex: 1,
      overflow: "hidden",
      zIndex: 0,
    },
    timelineEditorWindow: {
      position: "relative",
      width: "100%",
      flex: 1,
      overflow: lockScrolling ? "hidden" : "scroll",
    },
    timelineEditorWindowInner: {
      width: editorWidth + 11,
      minWidth: "100%",
      minHeight: "100%",
    },
    timelineRegionContainer: {
      position: "sticky",
      top: 0,
      backgroundColor: "var(--bg2)",
      height: 12,
      borderBottom: "1px solid var(--border1)",
      zIndex: 19,
    },
    timelineRulerContainer: {
      position: "sticky",
      top: 12,
      zIndex: 17,
      height: 21,
      backgroundColor: "var(--bg2)",
    },
    placeholderLaneContainer: {
      maxWidth: maxEditorWidth,
      flex: 1,
      minHeight: placeholderDragTargetHeight,
    },
    playhead: {
      width: 2,
      top: 12,
      bottom: 0,
      left: playheadPos.toMargin() - 1,
      zIndex: 18,
      backgroundColor: "var(--color1)",
    },
    songRegionOverlay: {
      height: editorHeight ? editorHeight - 15 : undefined,
      backgroundColor: "var(--color1)",
      opacity: 0.15,
    },
    laneDropzoneStyle: {
      backgroundColor: "var(--bg3)",
      borderBottom: "1px solid var(--border1)",
      zIndex: 0,
    },
    timelineEditorWindowControlV: {
      display: "flex",
      flexDirection: "column",
      width: 12,
      backgroundColor: "var(--bg1)",
      borderLeft: "1px solid var,--border1",
      zIndex: 20,
      inset: "33px 0 11px auto",
    },
    timelineEditorWindowControlH: {
      height: 12,
      backgroundColor: "var(--bg1)",
      borderTop: "1px solid var(--border1)",
    },
  } as const;

  useEffect(() => {
    if (isPlaying) {
      centerOnPlayhead();
    }
  }, [playheadPos, isPlaying]);

  // New state for analysis panel
  const [showAnalysisPanel, setShowAnalysisPanel] = useState(false);
  const [analysisTabValue, setAnalysisTabValue] = useState(0);

  // Function to handle analysis tab change
  const handleAnalysisTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setAnalysisTabValue(newValue);
    
    if (analysis.selectedClip?.audio?.audioBuffer) {
      let analysisType: AudioAnalysisType;
      
      switch(newValue) {
        case 0:
          analysisType = AudioAnalysisType.Spectral;
          break;
        case 1:
          analysisType = AudioAnalysisType.Waveform;
          break;
        case 2:
          analysisType = AudioAnalysisType.Features;
          break;
        default:
          analysisType = AudioAnalysisType.Spectral;
      }
      
      analysis.setAnalysisType(analysisType);
      analysis.runAudioAnalysis(analysis.selectedClip.audio.audioBuffer, analysisType);
    }
  };

  return (
    <SyncScroll>
      <div className="d-flex h-100 flex-column" style={style.container}>
        <div className="d-flex flex-grow-1">
          <div
            style={{
              width: 224,
              height: "100%",
              borderRight: "1px solid var(--border1)",
            }}
          >
            <SyncScrollPane
              id="track-section"
              className="d-flex flex-column hide-scrollbar overflow-auto col-12"
              ref={tracksSectionRef}
              style={{
                height: "calc(100% - 11px)",
                borderBottom: "1px solid var(--border1)",
              }}
            >
              <div
                className="col-12 d-flex align-items-center px-1"
                style={style.editorLeftTop}
              >
                <SpeedDial
                  ariaLabel="Add track button"
                  direction="right"
                  icon={
                    <SpeedDialIcon
                      style={{
                        color: "var(--bg6)",
                        transform: "translate(0, -1.5px)",
                      }}
                    />
                  }
                  slotProps={{ transition: { style: style.speedDial } }}
                  sx={{
                    flex: 1,
                    "&:hover .MuiSpeedDial-actions": {
                      border: "1px solid var(--color1)",
                      borderRadius: "16px",
                    },
                    "&:has(button:focus) .MuiSpeedDial-actions": {
                      border: "1px solid var(--color1)",
                      borderRadius: "16px",
                    },
                    "& .MuiSpeedDial-actions": {
                      padding: "0 4px 0 19px ",
                      marginLeft: "-20px",
                    },
                    "& .MuiTouchRipple-root": { display: "none" },
                  }}
                >
                  {[TrackType.Audio, TrackType.Midi, TrackType.Sequencer].map(
                    (type) => (
                      <SpeedDialAction
                        className="hover-2 p-0 bg-transparent no-shadow"
                        key={type}
                        icon={
                          <span
                            style={{ display: "inline-flex" }}
                            title={`Create ${type} Track`}
                          >
                            <TrackIcon color="var(--color1)" type={type} />
                          </span>
                        }
                        onClick={() => addTrack(type)}
                        sx={{
                          width: 22,
                          height: 22,
                          minHeight: 0,
                          margin: "0 4px",
                        }}
                      />
                    )
                  )}
                </SpeedDial>
                <IconButton
                  className="btn-1 hover-1 p-0"
                  onClick={centerOnPlayhead}
                  title="Center on Playhead"
                >
                  <PlayheadIcon size={14} style={{ color: "var(--border6)" }} />
                </IconButton>
              </div>
              <div>
                {masterTrack && (
                  <div {...dropzoneProps(masterTrack)}>
                    <TrackComponent colorless track={masterTrack} />
                  </div>
                )}
                <SortableList
                  autoScroll={{
                    thresholds: timelineEditorWindowScrollThresholds,
                  }}
                  cancel=".stop-reorder"
                  onSortUpdate={(data: any) =>
                    setTrackReorderData({
                      ...trackReorderData,
                      edgeIndex: data.edgeIndex,
                    })
                  }
                  onStart={handleSortStart}
                  onEnd={handleSortEnd}
                >
                  {tracks.map((track: Track, idx: number) => (
                    <SortableListItem
                      className={"position-relative " + getTrackClass(idx)}
                      index={idx}
                      key={track.id}
                    >
                      <div {...dropzoneProps(track)}>
                        <TrackComponent order={idx + 1} track={track} />
                      </div>
                    </SortableListItem>
                  ))}
                </SortableList>
              </div>
              {dragData.items.length > 0 && (
                <div
                  {...dropzoneProps(null)}
                  style={{ flex: 1, minHeight: placeholderDragTargetHeight }}
                >
                  {dropzonePlaceholderTracks.map((track, idx) => (
                    <TrackComponent
                      colorless
                      key={idx}
                      order={tracks.length + idx + 1}
                      style={style.placeholderTrack}
                      track={track}
                    />
                  ))}
                </div>
              )}
            </SyncScrollPane>
            <div
              style={{ height: 12, width: "100%", backgroundColor: "var(--bg1)" }}
            />
          </div>
          <div
            className="d-flex flex-column h-100"
            ref={editorRightRef}
            style={style.editorRight}
          >
            <TimelineRulerGrid />
            <SyncScrollPane
              id="timeline-editor-window"
              onWheel={handleWheel}
              ref={timelineEditorWindowRef}
              style={style.timelineEditorWindow}
            >
              <div
                className="d-flex flex-column position-relative"
                style={style.timelineEditorWindowInner}
              >
                <div className="col-12" style={style.timelineRegionContainer}>
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      position: "relative",
                      maxWidth: maxEditorWidth,
                    }}
                  >
                    <RegionComponent
                      onContextMenu={handleSongRegionContextMenu}
                      onSetRegion={(region) => setSongRegion(region)}
                      region={songRegion}
                      style={{
                        zIndex: 13,
                        background: "var(--color1)",
                        borderBlock: "3px solid var(--bg1)",
                      }}
                    >
                      <div
                        className="position-absolute col-12 pe-none"
                        style={style.songRegionOverlay}
                      />
                    </RegionComponent>
                  </div>
                </div>
                <div
                  onMouseDown={changePlayheadPos}
                  style={style.timelineRulerContainer}
                />
                <div style={{ maxWidth: maxEditorWidth, position: "relative" }}>
                  {masterTrack && (
                    <div {...dropzoneProps(masterTrack)}>
                      <Lane
                        dragDataTarget={dragData.target}
                        track={masterTrack}
                      />
                    </div>
                  )}
                  <div className="d-flex flex-column position-relative">
                    {tracks.map((track: Track, idx: number) => (
                      <div {...dropzoneProps(track)} key={track.id}>
                        <Lane
                          className={getTrackClass(idx)}
                          dragDataTarget={dragData.target}
                          track={track}
                        />
                      </div>
                    ))}
                  </div>
                </div>
                {dragData.items.length > 0 && (
                  <div
                    {...dropzoneProps(null)}
                    style={style.placeholderLaneContainer}
                  >
                    {dropzonePlaceholderTracks.map((track, idx) => (
                      <Lane
                        dragDataTarget={dragData.target}
                        key={idx}
                        track={track}
                        style={{
                          display:
                            dragData.target && !dragData.target.track
                              ? "flex"
                              : "none",
                        }}
                      />
                    ))}
                  </div>
                )}
                <div
                  className="position-absolute pe-none"
                  ref={playheadRef}
                  style={style.playhead}
                />
              </div>
              {dragData.items.length > 0 && (
                <WindowAutoScroll
                  active
                  eventType="drag"
                  thresholds={timelineEditorWindowScrollThresholds}
                  withinBounds
                />
              )}
            </SyncScrollPane>
            <div
              className="position-absolute"
              style={style.timelineEditorWindowControlV}
            >
              <Scrollbar
                axis="y"
                style={{ width: "100%", flex: 1, padding: "3px 0" }}
                targetEl={timelineEditorWindowRef.current}
                thumbStyle={{
                  backgroundColor: "var(--border1)",
                  borderInline: "3px solid var(--bg1)",
                }}
              />
              <ZoomControls vertical />
            </div>
            <div
              className="d-flex col-12"
              style={style.timelineEditorWindowControlH}
            >
              <Scrollbar
                axis="x"
                style={{ height: "100%", flex: 1, padding: "0 3px" }}
                targetEl={timelineEditorWindowRef.current}
                thumbStyle={{
                  backgroundColor: "var(--border1)",
                  borderBlock: "3px solid var(--bg1)",
                }}
              />
              <ZoomControls onZoom={handleZoom} />
              <div style={{ width: 11, height: "100%" }} />
            </div>
          </div>
        </div>
        
        {showAnalysisPanel && (
          <div style={{ height: '300px', borderTop: '1px solid var(--border1)' }}>
            <div className="d-flex justify-content-between align-items-center p-1" 
                 style={{ backgroundColor: 'var(--bg2)', borderBottom: '1px solid var(--border1)' }}>
              <Tabs value={analysisTabValue} onChange={handleAnalysisTabChange}>
                <Tab label="Spectral Analysis" />
                <Tab label="Waveform Analysis" />
                <Tab label="Feature Extraction" />
              </Tabs>
              <IconButton onClick={() => setShowAnalysisPanel(false)} size="small">
                &times;
              </IconButton>
            </div>
            
            <div className="p-2">
              <AudioAnalysisPanel 
                type={analysis.analysisType} 
                results={analysis.analysisResults}
                clip={analysis.selectedClip}
              />
            </div>
          </div>
        )}
      </div>
    </SyncScroll>
  );
}