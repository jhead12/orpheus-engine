import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom";
import type { Clip } from "@orpheus/types/core";
import { WorkstationContext } from "@orpheus/contexts/WorkstationContext";
import { ClipboardContext } from "@orpheus/contexts/ClipboardContext";

// Import the actual enums from types
import { TrackType, AutomationMode } from "@orpheus/types/core";

// Mock the required contexts
vi.mock("@orpheus/contexts/WorkstationContext", () => ({
  WorkstationContext: React.createContext({}),
}));

vi.mock("@orpheus/contexts/ClipboardContext", () => ({
  ClipboardContext: React.createContext({}),
}));

// Mock TimelinePosition
vi.mock("@orpheus/types/timeline", () => ({
  TimelinePosition: vi.fn().mockImplementation(() => ({
    ticks: 0,
    toMargin: () => 0,
    fromMargin: () => ({ ticks: 0 }),
    snap: () => ({ ticks: 0 }),
  })),
}));

// Mock electron utils
vi.mock("@orpheus/services/electron/utils", () => ({
  electronAPI: {
    ipcRenderer: {
      invoke: vi.fn(),
    },
  },
  openContextMenu: vi.fn(),
}));

// Mock utility functions
vi.mock("@orpheus/utils/utils", () => ({
  BASE_HEIGHT: 100,
  getLaneColor: vi.fn().mockReturnValue("#000000"),
  removeAllClipOverlap: (clips: Clip[]) => clips,
  timelineEditorWindowScrollThresholds: {
    top: { slow: 25, medium: 50, fast: 100 },
    right: { slow: 50, medium: 100, fast: 200 },
    bottom: { slow: 25, medium: 50, fast: 100 },
    left: { slow: 50, medium: 100, fast: 200 }
  },
  volumeToNormalized: vi.fn(),
  normalizedToVolume: vi.fn(),
  formatVolume: vi.fn(),
  getPanUnitValue: vi.fn(),
  formatPan: vi.fn(),
  formatAutomationValue: vi.fn(),
  formatAutomationValueDisplay: vi.fn(),
  convertToAutomationValue: vi.fn(),
}));

// Mock CSS variable utils
vi.mock("@orpheus/utils/general", () => ({
  getCSSVarValue: () => "#000000",
  normalizeHex: (hex: string) => hex,
}));

// Mock ResizeObserver
window.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock HTML Canvas and Audio APIs
Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  value: vi.fn().mockReturnValue({
    fillRect: vi.fn(),
    clearRect: vi.fn(),
    getImageData: vi.fn(),
    putImageData: vi.fn(),
    createImageData: vi.fn(),
    setTransform: vi.fn(),
    drawImage: vi.fn(),
    save: vi.fn(),
    fillText: vi.fn(),
    restore: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    closePath: vi.fn(),
    stroke: vi.fn(),
    translate: vi.fn(),
    scale: vi.fn(),
    rotate: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    measureText: vi.fn(() => ({ width: 100 })),
  }),
  writable: true,
});

// Mock global window electronAPI
Object.defineProperty(window, 'electronAPI', {
  value: {
    ipcRenderer: {
      invoke: vi.fn().mockResolvedValue([])
    }
  },
  writable: true
});

// Mock component imports from the index file
vi.mock("@orpheus/screens/workstation/components/index", () => ({
  AudioClipComponent: vi.fn(() => <div data-testid="audio-clip" />),
  AutomationLaneComponent: vi.fn(() => <div data-testid="automation-lane" />),
  ClipComponent: vi.fn(() => <div data-testid="clip" />),
  RegionComponent: vi.fn(() => <div data-testid="region" />)
}));

// Mock electron channels
vi.mock("@orpheus/services/electron/channels", () => ({
  TRACK_FILE_UPLOAD: 'track-file-upload'
}));

describe("Lane Component Import and Type Tests", () => {
  let Lane: any;
  
  beforeEach(async () => {
    vi.clearAllMocks();
    const LaneModule = await import("@orpheus/screens/workstation/components/Lane");
    Lane = LaneModule.default;
  });

  it("should be able to import Lane component", () => {
    expect(Lane).toBeDefined();
    expect(typeof Lane === "function" || typeof Lane === "object").toBe(true);
    
    // Check if it has React component markers
    const component = Lane as any;
    expect(
      component.$$typeof || 
      component.type || 
      component.render || 
      component.displayName
    ).toBeDefined();
  });

  it("should export LaneComponentProps interface", async () => {
    const LaneModule = await import("@orpheus/screens/workstation/components/Lane");
    // TypeScript interfaces don't exist at runtime, but we can test that the module structure is correct
    expect(LaneModule.default).toBeDefined();
    expect(typeof LaneModule.default).toBe('object'); // forwardRef returns an object
  });

  describe("Lane Component with Different Track Types", () => {
    const mockTimelinePosition: any = {
      bar: 0,
      beat: 0,
      tick: 0,
      sixteenth: 0,
      fraction: 0,
      measure: 0,
      ticks: 0,
      toMargin: () => 0,
      fromMargin: () => mockTimelinePosition,
      snap: () => mockTimelinePosition,
      diff: vi.fn(),
      fromTicks: vi.fn(),
      fromSpan: vi.fn(),
      fromSixteenths: vi.fn(),
      fromSeconds: vi.fn(),
      durationToSpan: vi.fn(() => 100),
      toSeconds: vi.fn(() => 1.0),
      toTicks: vi.fn(() => 0),
      diffInMargin: vi.fn(() => 0),
      toDisplayString: vi.fn(() => '0:00:00'),
      translate: vi.fn(() => mockTimelinePosition),
      toString: vi.fn(() => '0:00:00'),
      copy: vi.fn(() => mockTimelinePosition),
      equals: vi.fn(() => true),
      add: vi.fn(() => mockTimelinePosition),
      compareTo: vi.fn(() => 0),
    };

    const mockClipboardContext = {
      clipboardData: null,
      setClipboardData: vi.fn(),
      clipboardItem: null,
      setClipboardItem: vi.fn(),
    };

    const mockWorkstationContext = {
      tracks: [],
      masterTrack: {
        id: 'master-track',
        name: 'Master',
        type: TrackType.Audio,
        color: '#ffffff',
        mute: false,
        solo: false,
        armed: false,
        volume: { value: 0, min: -60, max: 12, default: 0, isAutomated: false },
        pan: { value: 0, min: -1, max: 1, default: 0, isAutomated: false },
        automation: false,
        automationMode: AutomationMode.Off,
        automationLanes: [],
        clips: [],
        fx: { preset: null, effects: [], selectedEffectIndex: 0 },
      },
      playheadPos: mockTimelinePosition,
      maxPos: mockTimelinePosition,
      numMeasures: 16,
      snapGridSize: mockTimelinePosition,
      songRegion: null,
      verticalScale: 1,
      showMaster: true,
      timelineSettings: {
        beatWidth: 80,
        timeSignature: { beats: 4, noteValue: 4 },
        horizontalScale: 1,
      },
      isPlaying: false,
      scrollToItem: null,
      allowMenuAndShortcuts: true,
      trackRegion: null,
      selectedTrackId: null,
      selectedClipId: null,
      autoGridSize: mockTimelinePosition,
      snapGridSizeOption: 'auto',
      showTimeRuler: true,
      metronomeSettings: { enabled: false, volume: 0.5, sound: 'click' },
      recordingSettings: { armed: false, inputGain: 0 },
      clipboardRegion: null,
      prerollAmount: 0,
      countInEnabled: false,
      loopEnabled: false,
      recordEnabled: false,
      overdubEnabled: false,
      automationWriteEnabled: false,
      // Required methods
      setTracks: vi.fn(),
      setPlayheadPos: vi.fn(),
      setSongRegion: vi.fn(),
      setVerticalScale: vi.fn(),
      setScrollToItem: vi.fn(),
      setAllowMenuAndShortcuts: vi.fn(),
      setSelectedTrackId: vi.fn(),
      setTrackRegion: vi.fn(),
      setSelectedClipId: vi.fn(),
      setAutoGridSize: vi.fn(),
      setSnapGridSizeOption: vi.fn(),
      setShowTimeRuler: vi.fn(),
      setMetronomeSettings: vi.fn(),
      setRecordingSettings: vi.fn(),
      setClipboardRegion: vi.fn(),
      setPrerollAmount: vi.fn(),
      setCountInEnabled: vi.fn(),
      setLoopEnabled: vi.fn(),
      setRecordEnabled: vi.fn(),
      setOverdubEnabled: vi.fn(),
      setAutomationWriteEnabled: vi.fn(),
      updateTimelineSettings: vi.fn(),
      removeTrack: vi.fn(),
      updateTrack: vi.fn(),
      duplicateTrack: vi.fn(),
      deleteTrack: vi.fn(),
      getTrackCurrentValue: vi.fn(),
      addTrack: vi.fn(),
      adjustNumMeasures: vi.fn(),
      createAudioClip: vi.fn(),
      createClipFromTrackRegion: vi.fn(),
      insertClips: vi.fn(),
      setTrack: vi.fn(),
      deleteClip: vi.fn(),
      duplicateClip: vi.fn(),
      splitClip: vi.fn(),
      consolidateClip: vi.fn(),
      toggleMuteClip: vi.fn(),
      skipToStart: vi.fn(),
      skipToEnd: vi.fn(),
      play: vi.fn(),
      pause: vi.fn(),
      stop: vi.fn(),
      record: vi.fn(),
      pasteClip: vi.fn(),
      setShowMaster: vi.fn(),
      // Missing required methods
      metronome: false,
      setMetronome: vi.fn(),
      settings: {
        tempo: 120,
        timeSignature: { beats: 4, noteValue: 4 },
        snap: true,
        snapUnit: '1/16',
        horizontalScale: 1,
      },
      setSettings: vi.fn(),
      zoomIn: vi.fn(),
      zoomOut: vi.fn(),
      zoomToFit: vi.fn(),
      selection: {
        tracks: [],
        clips: [],
        region: null,
      },
      setSelection: vi.fn(),
      clipboard: null,
      copy: vi.fn(),
      paste: vi.fn(),
      cut: vi.fn(),
      deleteSelection: vi.fn(),
      canUndo: false,
      canRedo: false,
      undo: vi.fn(),
      redo: vi.fn(),
      stretchAudio: false,
      setStretchAudio: vi.fn(),
      setTimeSignature: vi.fn(),
    };

    const createMockTrack = (type: typeof TrackType[keyof typeof TrackType]): any => ({
      id: `track-${type.toLowerCase()}`,
      name: `Test ${type} Track`,
      type,
      color: type === TrackType.Audio ? '#4CAF50' : '#FF9800',
      volume: 0.8,
      pan: 0,
      mute: false,
      solo: false,
      armed: false,
      automation: false,
      automationMode: AutomationMode.Read,
      clips: [],
      automationLanes: [],
      fx: {
        preset: null,
        effects: [],
        selectedEffectIndex: 0,
      },
    });

    const renderLaneWithContext = (track: any, additionalProps = {}) => {
      return render(
        React.createElement(WorkstationContext.Provider, { value: mockWorkstationContext },
          React.createElement(ClipboardContext.Provider, { value: mockClipboardContext },
            React.createElement(Lane, {
              dragDataTarget: null,
              track,
              onClipContextMenu: vi.fn(),
              ...additionalProps
            })
          )
        )
      );
    };

    it("should render Audio track lane", () => {
      const audioTrack = createMockTrack(TrackType.Audio);
      expect(() => renderLaneWithContext(audioTrack)).not.toThrow();
    });

    it("should render MIDI track lane", () => {
      const midiTrack = createMockTrack(TrackType.Midi);
      expect(() => renderLaneWithContext(midiTrack)).not.toThrow();
    });

    it("should handle Audio track with clips", () => {
      const audioTrack = createMockTrack(TrackType.Audio);
      audioTrack.clips = [
        {
          id: 'audio-clip-1',
          name: 'Audio Clip',
          start: mockTimelinePosition,
          end: mockTimelinePosition,
          duration: mockTimelinePosition,
          trackId: audioTrack.id,
          type: TrackType.Audio
        }
      ];
      
      expect(() => renderLaneWithContext(audioTrack)).not.toThrow();
    });

    it("should handle MIDI track with clips", () => {
      const midiTrack = createMockTrack(TrackType.Midi);
      midiTrack.clips = [
        {
          id: 'midi-clip-1',
          name: 'MIDI Clip',
          start: mockTimelinePosition,
          end: mockTimelinePosition,
          duration: mockTimelinePosition,
          trackId: midiTrack.id,
          type: TrackType.Midi
        }
      ];
      
      expect(() => renderLaneWithContext(midiTrack)).not.toThrow();
    });

    it("should handle track with automation lanes", () => {
      const trackWithAutomation = createMockTrack(TrackType.Audio);
      trackWithAutomation.automation = true;
      trackWithAutomation.automationLanes = [
        {
          id: 'volume-automation',
          parameter: 'volume',
          points: [],
          show: true
        }
      ];
      
      expect(() => renderLaneWithContext(trackWithAutomation)).not.toThrow();
    });

    it("should handle muted track", () => {
      const mutedTrack = createMockTrack(TrackType.Audio);
      mutedTrack.mute = true;
      
      expect(() => renderLaneWithContext(mutedTrack)).not.toThrow();
    });

    it("should handle soloed track", () => {
      const soloedTrack = createMockTrack(TrackType.Midi);
      soloedTrack.solo = true;
      
      expect(() => renderLaneWithContext(soloedTrack)).not.toThrow();
    });

    it("should handle armed track", () => {
      const armedTrack = createMockTrack(TrackType.Audio);
      armedTrack.armed = true;
      
      expect(() => renderLaneWithContext(armedTrack)).not.toThrow();
    });

    it("should handle track with different automation modes", () => {
      const trackWithRead = createMockTrack(TrackType.Audio);
      trackWithRead.automationMode = AutomationMode.Read;
      expect(() => renderLaneWithContext(trackWithRead)).not.toThrow();

      const trackWithWrite = createMockTrack(TrackType.Midi);
      trackWithWrite.automationMode = AutomationMode.Write;
      expect(() => renderLaneWithContext(trackWithWrite)).not.toThrow();

      const trackWithOff = createMockTrack(TrackType.Audio);
      trackWithOff.automationMode = AutomationMode.Off;
      expect(() => renderLaneWithContext(trackWithOff)).not.toThrow();
    });

    it("should handle drag data target", () => {
      const track = createMockTrack(TrackType.Audio);
      const dragDataTarget = { track, incompatible: false };
      
      expect(() => renderLaneWithContext(track, { dragDataTarget })).not.toThrow();
    });

    it("should handle incompatible drag data target", () => {
      const track = createMockTrack(TrackType.Audio);
      const dragDataTarget = { track, incompatible: true };
      
      expect(() => renderLaneWithContext(track, { dragDataTarget })).not.toThrow();
    });

    it("should handle custom styling", () => {
      const track = createMockTrack(TrackType.Midi);
      const customStyle = { backgroundColor: 'red', height: '120px' };
      
      expect(() => renderLaneWithContext(track, { style: customStyle })).not.toThrow();
    });

    it("should handle custom className", () => {
      const track = createMockTrack(TrackType.Audio);
      
      expect(() => renderLaneWithContext(track, { className: 'custom-lane-class' })).not.toThrow();
    });

    it("should handle context menu callback", () => {
      const track = createMockTrack(TrackType.Audio);
      const onClipContextMenu = vi.fn();
      
      expect(() => renderLaneWithContext(track, { onClipContextMenu })).not.toThrow();
    });

    it("should handle track with effects", () => {
      const trackWithEffects = createMockTrack(TrackType.Audio);
      trackWithEffects.fx = {
        preset: null,
        effects: [
          { id: 'reverb-1', name: 'Reverb', enabled: true, type: 'reverb', parameters: {} },
          { id: 'eq-1', name: 'EQ', enabled: false, type: 'eq', parameters: {} }
        ],
        selectedEffectIndex: 0,
      };
      
      expect(() => renderLaneWithContext(trackWithEffects)).not.toThrow();
    });

    it("should handle multiple clips of different types", () => {
      const track = createMockTrack(TrackType.Audio);
      track.clips = [
        {
          id: 'clip-1',
          name: 'First Clip',
          start: mockTimelinePosition,
          end: mockTimelinePosition,
          duration: mockTimelinePosition,
          trackId: track.id,
          type: TrackType.Audio
        },
        {
          id: 'clip-2',
          name: 'Second Clip',
          start: mockTimelinePosition,
          end: mockTimelinePosition,
          duration: mockTimelinePosition,
          trackId: track.id,
          type: TrackType.Audio
        }
      ];
      
      expect(() => renderLaneWithContext(track)).not.toThrow();
    });
  });
});
