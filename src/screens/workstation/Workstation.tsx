import { useMemo, useState } from "react";
import Editor, { AudioAnalysisProvider } from "./Editor";
import WorkstationContext, { WorkstationContextType, WorkstationPlugin } from "../../contexts/WorkstationContext";
import { useTheme } from "@mui/material";
import { SidePanel } from "../../components/workstation";
import { TimelinePosition, Track } from "../../services/types/types";

export default function Workstation() {
  const theme = useTheme();
  const [activeTrack, setActiveTrack] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [plugins, setPlugins] = useState<WorkstationPlugin[]>([]);
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);

  const workspaceStyle = useMemo(
    () => ({
      display: "flex",
      height: "100vh",
      width: "100vw",
      backgroundColor: theme.palette.background.default,
    }),
    [theme]
  );

  const workstationValue = useMemo<WorkstationContextType>(
    () => ({
      activeTrack,
      isPlaying,
      plugins,
      setActiveTrack,
      setIsPlaying,
      registerPlugin: (plugin: WorkstationPlugin) => {
        setPlugins(current => [...current, plugin]);
      },
      unregisterPlugin: (pluginId: string) => {
        setPlugins(current => current.filter(p => p.metadata?.id !== pluginId));
      },
      getPlugin: (pluginId: string) => plugins.find(p => p.metadata?.id === pluginId),
      hasPlugin: (pluginId: string) => plugins.some(p => p.metadata?.id === pluginId),
      getPlugins: () => plugins,
      clearPlugins: () => setPlugins([]),
      
      // Additional required properties from WorkstationContextType
      masterTrack: {} as Track,
      maxPos: new TimelinePosition(),
      numMeasures: 4,
      playheadPos: new TimelinePosition(),
      scrollToItem: null,
      setAllowMenuAndShortcuts: () => {},
      setPlayheadPos: () => {},
      setScrollToItem: () => {},
      setSongRegion: () => {},
      setTracks: () => {},
      setVerticalScale: () => {},
      snapGridSize: 0,
      songRegion: null,
      timelineSettings: { horizontalScale: 1, timeSignature: { beats: 4, noteValue: 4 }, tempo: 120 },
      tracks: [],
      updateTimelineSettings: () => {},
      verticalScale: 1,
      addTrack: () => {},
      adjustNumMeasures: () => {},
      createAudioClip: async () => null,
      insertClips: () => {},
      mixerHeight: 300,
      setMixerHeight: () => {},
      showMixer: true,
      setShowMixer: () => {},
      storageConnectors: {},
      currentWorkstation: null,
      saveWorkstation: async () => null,
      loadWorkstation: async () => false,
      listWorkstations: async () => [],
      createNewWorkstation: () => {},
      
      // Adding the missing properties
      deleteTrack: () => {},
      duplicateTrack: () => {},
      getTrackCurrentValue: () => 0,
      selectedTrackId,
      setSelectedTrackId,
      setTrack: () => {},
      showMaster: true,
      
      // Missing properties for Metronome
      metronome: false,
      setMetronome: () => {},
      
      // Missing properties for Timeline
      autoGridSize: 16,
      showTimeRuler: true,
      snapGridSizeOption: 'quarter',
    }),
    [activeTrack, isPlaying, plugins, selectedTrackId]
  );

  return (
    <WorkstationContext.Provider value={workstationValue}>
      <AudioAnalysisProvider>
        <div style={workspaceStyle}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <Editor />
          </div>
          <SidePanel />
        </div>
      </AudioAnalysisProvider>
    </WorkstationContext.Provider>
  );
}