import React, {
  HTMLAttributes,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Buffer } from "buffer";
import { v4 } from "uuid";
import {
  IconButton,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Tabs,
  Tab,
  Box,
  Drawer,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
} from "@mui/material";
import {
  Input as InputIcon,
  Close as CloseIcon,
  Extension as PluginIcon,
  ZoomIn,
  ZoomOut,
  CenterFocusStrong,
  PlayArrow,
  Pause,
  Stop,
  MusicNote,
} from "@mui/icons-material";
import { useResizeDetector } from "react-resize-detector";
// Import from workstation contexts that exist
import { useWorkstation } from "../../contexts/WorkstationContext";
// Import shared components that exist
import TimelineRulerGrid from "./components/TimelineRulerGrid";
import Waveform from "./components/Waveform";
import AudioInputDeviceSelector from "../../components/AudioInputDeviceSelector";
import PluginMarketplace from "../../components/PluginMarketplace";
// Import new advanced components
import Metronome from "../../components/Metronome";
import TransportControls from "../../components/TransportControls";

// Define types locally for now
export enum TrackType {
  Audio = 0,
  Midi = 1,
}

export enum AudioAnalysisType {
  Spectral = 'spectral',
  Waveform = 'waveform',
  Features = 'features',
}

export interface Track {
  id: string;
  name: string;
  type: TrackType;
  clips: Clip[];
  volume: number;
  pan: number;
  muted: boolean;
  solo: boolean;
  armed: boolean;
  color: string;
  effects: any[];
  automationLanes: any[];
  expanded: boolean;
  fx: {
    preset: any;
    effects: any[];
    selectedEffectIndex: number;
  };
  mute: boolean;
}

export interface Clip {
  id: string;
  name: string;
  start: number;
  duration: number;
  offset: number;
  trackId: string;
  audioBuffer?: AudioBuffer;
  path?: string;
}

export interface TimelinePosition {
  beats: number;
  measures: number;
  seconds: number;
  samples: number;
  
  snap(gridSize: number): TimelinePosition;
}

// Create TimelinePosition implementation
export class TimelinePositionImpl implements TimelinePosition {
  beats: number = 0;
  measures: number = 0;
  seconds: number = 0;
  samples: number = 0;

  static fromMargin(margin: number): TimelinePosition {
    const instance = new TimelinePositionImpl();
    // Convert margin to timeline position (simplified)
    instance.beats = margin / 100; // Assuming 100px per beat
    instance.measures = Math.floor(instance.beats / 4);
    return instance;
  }

  snap(gridSize: number): TimelinePosition {
    this.beats = Math.round(this.beats / gridSize) * gridSize;
    return this;
  }
}

// Audio Analysis Context
interface AudioAnalysisContextType {
  analysisType: AudioAnalysisType;
  setAnalysisType: (type: AudioAnalysisType) => void;
  selectedClip: Clip | null;
  setSelectedClip: (clip: Clip | null) => void;
  analysisResults: any;
  runAudioAnalysis: (audioBuffer: AudioBuffer, type: AudioAnalysisType) => Promise<any>;
}

const AudioAnalysisContext = React.createContext<AudioAnalysisContextType | undefined>(undefined);

// Define getBaseTrack locally since it's not exported from utils
const getBaseTrack = (type = "audio"): Track => ({
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
  type: type === "midi" ? TrackType.Midi : TrackType.Audio,
  volume: 0,
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

// Constants
const BASE_BEAT_WIDTH = 100;
const BASE_HEIGHT = 60;

// Utility functions
const isValidAudioTrackFileFormat = (type: string) => {
  return type.startsWith('audio/');
};

const debounce = (func: Function, wait: number) => {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

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
        results = await performSpectralAnalysis(audioBuffer);
        break;
      case AudioAnalysisType.Waveform:
        results = await performWaveformAnalysis(audioBuffer);
        break;
      case AudioAnalysisType.Features:
        results = await extractAudioFeatures(audioBuffer);
        break;
    }
    
    setAnalysisResults(results);
    return results;
  };
  
  // Mock implementation of analysis functions
  const performSpectralAnalysis = async (_audioBuffer: AudioBuffer) => {
    return { type: 'spectral', data: [/* frequency data */] };
  };
  
  const performWaveformAnalysis = async (_audioBuffer: AudioBuffer) => {
    return { type: 'waveform', data: [/* amplitude data */] };
  };
  
  const extractAudioFeatures = async (_audioBuffer: AudioBuffer) => {
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

  return <AudioAnalysisContext.Provider value={value}>{children}</AudioAnalysisContext.Provider>;
}

// Simplified Lane Component
const Lane: React.FC<{
  track: Track;
  dragDataTarget?: any;
  onClipContextMenu?: (clip: Clip, e: React.MouseEvent) => void;
  className?: string;
  style?: React.CSSProperties;
}> = ({ track, dragDataTarget, onClipContextMenu, className = "", style = {} }) => {
  return (
    <div className={`lane ${className}`} style={{ 
      height: BASE_HEIGHT, 
      backgroundColor: track.color + '20',
      borderBottom: '1px solid var(--border1)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 8px',
      ...style 
    }}>
      <div style={{ 
        minWidth: '120px', 
        fontWeight: 'bold',
        color: track.muted ? '#666' : '#fff' 
      }}>
        {track.name}
      </div>
      <div style={{ flex: 1, position: 'relative', height: '100%' }}>
        {track.clips.map((clip) => (
          <div
            key={clip.id}
            style={{
              position: 'absolute',
              left: clip.start * BASE_BEAT_WIDTH,
              width: clip.duration * BASE_BEAT_WIDTH,
              height: '80%',
              backgroundColor: track.color,
              borderRadius: '4px',
              border: '1px solid #333',
              top: '10%',
              cursor: 'pointer'
            }}
            onContextMenu={(e) => onClipContextMenu?.(clip, e)}
          >
            <div style={{ padding: '4px', fontSize: '12px', color: 'white' }}>
              {clip.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Simplified AudioAnalysisPanel Component
const AudioAnalysisPanel: React.FC<{
  type: AudioAnalysisType;
  clip: Clip | null;
}> = ({ type, clip }) => {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>
        {type.charAt(0).toUpperCase() + type.slice(1)} Analysis
        {clip && ` - ${clip.name}`}
      </div>
      <div style={{ 
        flex: 1, 
        backgroundColor: 'var(--bg3)', 
        border: '1px solid var(--border1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#666'
      }}>
        {clip ? `${type} analysis visualization would appear here` : 'Select a clip to analyze'}
      </div>
    </div>
  );
};

// Simplified ZoomControls Component
const ZoomControls: React.FC<{
  onZoom?: (vertical: boolean) => void;
  vertical?: boolean;
  timelineSettings?: any;
  updateTimelineSettings?: (settings: any) => void;
  verticalScale?: number;
  setVerticalScale?: (scale: number) => void;
}> = ({ onZoom, vertical = false, timelineSettings, updateTimelineSettings, verticalScale, setVerticalScale }) => {
  const handleZoomIn = () => {
    onZoom?.(vertical);
    if (vertical) {
      // Handle vertical zoom
      if (setVerticalScale && verticalScale) {
        const newScale = Math.min(verticalScale * 1.2, 5);
        setVerticalScale(newScale);
      }
    } else {
      // Handle horizontal zoom
      if (updateTimelineSettings && timelineSettings) {
        const newScale = Math.min(timelineSettings.horizontalScale * 1.2, 5);
        updateTimelineSettings({ ...timelineSettings, horizontalScale: newScale });
      }
    }
  };

  const handleZoomOut = () => {
    onZoom?.(vertical);
    if (vertical) {
      // Handle vertical zoom
      if (setVerticalScale && verticalScale) {
        const newScale = Math.max(verticalScale * 0.8, 0.1);
        setVerticalScale(newScale);
      }
    } else {
      // Handle horizontal zoom
      if (updateTimelineSettings && timelineSettings) {
        const newScale = Math.max(timelineSettings.horizontalScale * 0.8, 0.1);
        updateTimelineSettings({ ...timelineSettings, horizontalScale: newScale });
      }
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: vertical ? 'column' : 'row',
      gap: '4px',
      padding: '4px',
      border: '1px solid var(--border1)',
      borderRadius: '4px',
      backgroundColor: 'var(--bg2)'
    }}>
      <button 
        onClick={handleZoomIn}
        style={{
          padding: '4px 8px',
          border: '1px solid var(--border1)',
          backgroundColor: 'var(--bg1)',
          color: 'var(--text1)',
          cursor: 'pointer'
        }}
        title={`Zoom In ${vertical ? 'Vertically' : 'Horizontally'}`}
      >
        +
      </button>
      <button 
        onClick={handleZoomOut}
        style={{
          padding: '4px 8px',
          border: '1px solid var(--border1)',
          backgroundColor: 'var(--bg1)',
          color: 'var(--text1)',
          cursor: 'pointer'
        }}
        title={`Zoom Out ${vertical ? 'Vertically' : 'Horizontally'}`}
      >
        -
      </button>
    </div>
  );
};

export default function Editor() {
  // Mock workstation context for now - this should be replaced with actual context
  const workstation = {
    tracks: [] as Track[],
    addTrack: (track: Track) => {},
    masterTrack: null as Track | null,
    playheadPos: 0,
    setPlayheadPos: (pos: number) => {},
    isPlaying: false,
    setIsPlaying: (playing: boolean) => {},
    numMeasures: 16,
    snapGridSize: 0.25,
    songRegion: { start: 0, end: 16 },
    setSongRegion: (region: any) => {},
    timelineSettings: {
      horizontalScale: 1,
      tempo: 120,
      timeSignature: { beats: 4, noteValue: 4 }
    },
    updateTimelineSettings: (settings: any) => {},
    verticalScale: 1,
    setVerticalScale: (scale: number) => {},
    maxPos: 16,
    scrollToItem: null,
    setScrollToItem: (item: any) => {},
    setAllowMenuAndShortcuts: (allow: boolean) => {},
    setTracks: (tracks: Track[]) => {},
    adjustNumMeasures: (num: number) => {},
    createAudioClip: async (data: any): Promise<Clip> => ({
      id: v4(),
      name: data.name,
      start: 0,
      duration: 4,
      offset: 0,
      trackId: '',
      path: data.path
    }),
    insertClips: (clips: Clip[]) => {},
  };

  const { height: editorHeight, ref: editorRightRef } = useResizeDetector();

  const [dragData, setDragData] = useState<EditorDragData>({
    items: [],
    target: null,
  });
  const [showAnalysisPanel, setShowAnalysisPanel] = useState(false);
  const [showAudioInputPanel, setShowAudioInputPanel] = useState(false);
  const [showPluginMarketplace, setShowPluginMarketplace] = useState(false);
  const [analysisTabValue, setAnalysisTabValue] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [metronome, setMetronome] = useState(false);
  const [timelineSettings, setTimelineSettings] = useState({
    horizontalScale: 1,
    tempo: 120,
    timeSignature: { beats: 4, noteValue: 4 }
  });
  const [verticalScale, setVerticalScale] = useState(1);
  const [playheadPos, setPlayheadPos] = useState(0);
  const [currentPosition, setCurrentPosition] = useState({ bar: 0, beat: 0, fraction: 0 });
  const [tracks, setTracks] = useState<Track[]>([
    getBaseTrack("audio"),
    getBaseTrack("audio"),
    getBaseTrack("audio"),
  ]);

  const playheadRef = useRef<HTMLDivElement>(null);
  const timelineEditorWindowRef = useRef<HTMLDivElement>(null);

  // Create analysis context value
  const [analysisType, setAnalysisType] = useState<AudioAnalysisType>(AudioAnalysisType.Spectral);
  const [selectedClip, setSelectedClip] = useState<Clip | null>(null);
  const [analysisResults, setAnalysisResults] = useState<any>(null);

  const runAudioAnalysis = async (audioBuffer: AudioBuffer, type: AudioAnalysisType) => {
    return { type, data: [] };
  };

  const analysis = {
    analysisType,
    setAnalysisType,
    selectedClip,
    setSelectedClip,
    analysisResults,
    runAudioAnalysis,
  };

  // Advanced handlers
  const handleAnalysisTabChange = (_: any, newValue: number) => {
    setAnalysisTabValue(newValue);
    const types = [AudioAnalysisType.Spectral, AudioAnalysisType.Waveform, AudioAnalysisType.Features];
    setAnalysisType(types[newValue]);
  };

  const handleClipContextMenu = (clip: Clip, e: React.MouseEvent) => {
    e.preventDefault();
    setSelectedClip(clip);
    setShowAnalysisPanel(true);
  };

  const handleZoom = (vertical: boolean) => {
    console.log('Zoom:', vertical ? 'vertical' : 'horizontal');
  };

  const centerOnPlayhead = () => {
    if (timelineEditorWindowRef.current && playheadRef.current) {
      const container = timelineEditorWindowRef.current;
      const playhead = playheadRef.current;
      container.scrollLeft = playhead.offsetLeft - container.clientWidth / 2;
    }
  };

  const handleTogglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSetPosition = (position: { bar: number; beat: number; fraction: number }) => {
    setCurrentPosition(position);
    // Convert position to playhead pixel position
    const pixelPos = (position.bar * timelineSettings.timeSignature.beats + position.beat + position.fraction) * BASE_BEAT_WIDTH;
    setPlayheadPos(pixelPos);
  };

  const handleTempoChange = (tempo: number) => {
    setTimelineSettings(prev => ({ ...prev, tempo }));
  };

  const handleTimeSignatureChange = (timeSignature: { beats: number; noteValue: number }) => {
    setTimelineSettings(prev => ({ ...prev, timeSignature }));
  };

  const handleAddTrack = () => {
    const newTrack = getBaseTrack("audio");
    setTracks(prev => [...prev, newTrack]);
  };

  // Audio input handlers
  const handleAudioDeviceSelected = (device: any) => {
    console.log('Audio device selected:', device);
  };

  const handleAudioStreamStarted = (stream: any) => {
    console.log('Audio stream started:', stream);
    // Here you could create a new track or start recording
  };

  const handleAudioStreamStopped = () => {
    console.log('Audio stream stopped');
  };

  const handleAudioInputError = (error: string) => {
    console.error('Audio input error:', error);
  };

  const dropzoneProps = (track: Track | null) => ({
    onDragEnter: (e: React.DragEvent) => e.preventDefault(),
    onDragLeave: (e: React.DragEvent) => e.preventDefault(),
    onDragOver: (e: React.DragEvent) => e.preventDefault(),
    onDrop: async (e: React.DragEvent) => {
      e.preventDefault();
      const files = Array.from(e.dataTransfer.files);
      // Handle file drop logic here
    },
  });

  const maxEditorWidth = workstation.numMeasures * timelineSettings.timeSignature.beats * BASE_BEAT_WIDTH * timelineSettings.horizontalScale;

  const style = {
    container: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column' as const,
      backgroundColor: 'var(--bg1)',
      color: 'var(--text1)',
      height: '100vh',
      overflow: 'hidden'
    },
    timelineRulerContainer: {
      height: '30px',
      backgroundColor: 'var(--bg2)',
      borderBottom: '1px solid var(--border1)',
      position: 'sticky' as const,
      top: 0,
      zIndex: 15,
    },
    playhead: {
      position: 'absolute' as const,
      left: playheadPos,
      top: 0,
      width: '2px',
      height: '100%',
      backgroundColor: '#ff4444',
      zIndex: 1000,
      pointerEvents: 'none' as const,
    },
    timelineEditorWindow: {
      height: editorHeight ? `${editorHeight - 200}px` : '400px',
      overflow: 'auto',
      position: 'relative' as const,
      flex: 1,
    },
    editorControls: {
      display: 'flex',
      alignItems: 'center',
      padding: '8px',
      backgroundColor: 'var(--bg2)',
      borderTop: '1px solid var(--border1)',
      gap: '12px',
    },
    rightControls: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginLeft: 'auto',
    },
  };

  return (
    <AudioAnalysisContext.Provider value={analysis}>
      <Box sx={style.container}>
        {/* Transport Controls */}
        <TransportControls
          isPlaying={isPlaying}
          onTogglePlayback={handleTogglePlayback}
          currentPosition={currentPosition}
          onSetPosition={handleSetPosition}
          tempo={timelineSettings.tempo}
          onTempoChange={handleTempoChange}
          timeSignature={timelineSettings.timeSignature}
          onTimeSignatureChange={handleTimeSignatureChange}
          onAddTrack={handleAddTrack}
        />

        {/* Timeline Header */}
        <div style={style.timelineRulerContainer}>
          <TimelineRulerGrid />
        </div>

        {/* Main Editor Area */}
        <div 
          ref={timelineEditorWindowRef}
          style={style.timelineEditorWindow}
          {...dropzoneProps(null)}
        >
          <div style={{ position: 'relative', minWidth: maxEditorWidth, minHeight: '100%' }}>
            {/* Master Track */}
            {workstation.masterTrack && (
              <div {...dropzoneProps(workstation.masterTrack)}>
                <Lane
                  track={workstation.masterTrack}
                  onClipContextMenu={handleClipContextMenu}
                />
              </div>
            )}
            
            {/* Regular Tracks */}
            <div>
              {tracks.map((track: Track, idx: number) => (
                <div {...dropzoneProps(track)} key={track.id}>
                  <Lane
                    track={track}
                    onClipContextMenu={handleClipContextMenu}
                  />
                </div>
              ))}
            </div>

            {/* Playhead */}
            <div
              ref={playheadRef}
              style={style.playhead}
            />
          </div>

          {/* Zoom Controls - Vertical */}
          <div style={{
            position: 'absolute',
            top: 10,
            right: 10,
            zIndex: 100,
          }}>
            <ZoomControls
              vertical
              onZoom={handleZoom}
              verticalScale={verticalScale}
              setVerticalScale={setVerticalScale}
            />
          </div>
        </div>

        {/* Analysis Panel */}
        {showAnalysisPanel && (
          <div style={{ height: '300px', borderTop: '1px solid var(--border1)' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              padding: '8px',
              backgroundColor: 'var(--bg2)', 
              borderBottom: '1px solid var(--border1)' 
            }}>
              <Tabs value={analysisTabValue} onChange={handleAnalysisTabChange}>
                <Tab label="Spectral Analysis" />
                <Tab label="Waveform Analysis" />
                <Tab label="Feature Extraction" />
              </Tabs>
              <IconButton onClick={() => setShowAnalysisPanel(false)} size="small">
                <CloseIcon />
              </IconButton>
            </div>
            
            <div style={{ padding: '16px' }}>
              <AudioAnalysisPanel 
                type={analysis.analysisType} 
                clip={analysis.selectedClip}
              />
            </div>
          </div>
        )}

        {/* Editor Controls */}
        <div style={style.editorControls}>
          {/* Metronome */}
          <Metronome
            isPlaying={isPlaying}
            metronome={metronome}
            setMetronome={setMetronome}
            timelineSettings={timelineSettings}
          />

          {/* Zoom Controls - Horizontal */}
          <ZoomControls
            onZoom={handleZoom}
            timelineSettings={timelineSettings}
            updateTimelineSettings={setTimelineSettings}
          />

          {/* Center on Playhead */}
          <IconButton
            onClick={centerOnPlayhead}
            title="Center on Playhead"
            size="small"
            sx={{ border: '1px solid var(--border1)' }}
          >
            <CenterFocusStrong fontSize="small" />
          </IconButton>

          {/* Right Controls */}
          <div style={style.rightControls}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<InputIcon />}
              onClick={() => setShowAudioInputPanel(!showAudioInputPanel)}
              sx={{
                backgroundColor: showAudioInputPanel ? 'var(--color1)' : 'transparent',
                color: showAudioInputPanel ? 'white' : 'var(--text1)',
                borderColor: 'var(--border1)',
              }}
            >
              Audio Input
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<PluginIcon />}
              onClick={() => setShowPluginMarketplace(!showPluginMarketplace)}
              sx={{
                backgroundColor: showPluginMarketplace ? 'var(--color1)' : 'transparent',
                color: showPluginMarketplace ? 'white' : 'var(--text1)',
                borderColor: 'var(--border1)',
              }}
            >
              Plugins
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={() => setShowAnalysisPanel(!showAnalysisPanel)}
              sx={{
                backgroundColor: showAnalysisPanel ? 'var(--color1)' : 'transparent',
                color: showAnalysisPanel ? 'white' : 'var(--text1)',
                borderColor: 'var(--border1)',
              }}
            >
              Analysis
            </Button>
          </div>
        </div>

        {/* Audio Input Drawer */}
        <Drawer
          anchor="right"
          open={showAudioInputPanel}
          onClose={() => setShowAudioInputPanel(false)}
          sx={{
            '& .MuiDrawer-paper': {
              width: 400,
              maxWidth: '90vw',
            }
          }}
        >
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Audio Input Setup</Typography>
            <IconButton onClick={() => setShowAudioInputPanel(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Box sx={{ px: 2, pb: 2 }}>
            <AudioInputDeviceSelector
              onDeviceSelected={handleAudioDeviceSelected}
              onStreamStarted={handleAudioStreamStarted}
              onStreamStopped={handleAudioStreamStopped}
              onError={handleAudioInputError}
            />
          </Box>
        </Drawer>

        {/* Plugin Marketplace Drawer */}
        <Drawer
          anchor="right"
          open={showPluginMarketplace}
          onClose={() => setShowPluginMarketplace(false)}
          sx={{
            '& .MuiDrawer-paper': {
              width: 500,
              maxWidth: '90vw',
            }
          }}
        >
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Plugin Marketplace</Typography>
            <IconButton onClick={() => setShowPluginMarketplace(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Box sx={{ px: 2, pb: 2 }}>
            <PluginMarketplace />
          </Box>
        </Drawer>
      </Box>
    </AudioAnalysisContext.Provider>
  );
}
