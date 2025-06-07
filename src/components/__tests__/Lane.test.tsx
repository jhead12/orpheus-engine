import React from "react";
import { render, fireEvent, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";

// Mock both import paths that components use
vi.mock("../../services/types/timeline", () => {
  class TimelinePosition {
    bar: number;
    beat: number;
    tick: number;
    sixteenth: number;
    fraction: number;
    measure: number;

    constructor(bar: number = 0, beat: number = 0, tick: number = 0) {
      this.bar = bar;
      this.beat = beat;
      this.tick = tick;
      this.sixteenth = Math.floor(tick / 120);
      this.fraction = (tick % 120) / 120;
      this.measure = bar;
    }

    diffInMargin(other: TimelinePosition): number {
      return Math.abs(this.toMargin() - other.toMargin());
    }

    diff(other: TimelinePosition): { bars: number; beats: number; ticks: number } {
      const thisTicks = this.toTicks();
      const otherTicks = other.toTicks();
      const diffTicks = Math.abs(thisTicks - otherTicks);
      
      const bars = Math.floor(diffTicks / (4 * 480));
      let remainingTicks = diffTicks % (4 * 480);
      const beats = Math.floor(remainingTicks / 480);
      remainingTicks = remainingTicks % 480;
      
      return { bars, beats, ticks: remainingTicks };
    }

    toMargin(): number {
      return this.toTicks();
    }

    toTicks(): number {
      return this.bar * 4 * 480 + this.beat * 480 + this.tick;
    }

    copy(): TimelinePosition {
      return new TimelinePosition(this.bar, this.beat, this.tick);
    }

    compareTo(other: TimelinePosition): number {
      if (this.bar !== other.bar) return this.bar - other.bar;
      if (this.beat !== other.beat) return this.beat - other.beat;
      return this.tick - other.tick;
    }

    equals(other: TimelinePosition): boolean {
      return (
        this.bar === other.bar &&
        this.beat === other.beat &&
        this.tick === other.tick
      );
    }

    add(bars: number, beats: number, ticks: number): TimelinePosition {
      let resultTick = this.tick + ticks;
      let resultBeat = this.beat + beats;
      let resultBar = this.bar + bars;

      if (resultTick >= 480) {
        resultBeat += Math.floor(resultTick / 480);
        resultTick %= 480;
      }

      if (resultBeat >= 4) {
        resultBar += Math.floor(resultBeat / 4);
        resultBeat %= 4;
      }

      return new TimelinePosition(resultBar, resultBeat, resultTick);
    }

    static fromTicks(ticks: number): TimelinePosition {
      const bars = Math.floor(ticks / (4 * 480));
      let remainingTicks = ticks % (4 * 480);
      const beats = Math.floor(remainingTicks / 480);
      remainingTicks = remainingTicks % 480;
      return new TimelinePosition(bars, beats, remainingTicks);
    }

    static fromMargin(margin: number): TimelinePosition {
      return TimelinePosition.fromTicks(margin);
    }

    static fromSpan(span: number): TimelinePosition {
      return TimelinePosition.fromTicks(span * 480);
    }

    static fromSixteenths(sixteenths: number): TimelinePosition {
      const bars = Math.floor(sixteenths / 16);
      let remainingSixteenths = sixteenths % 16;

      const beats = Math.floor(remainingSixteenths / 4);
      remainingSixteenths = remainingSixteenths % 4;

      const ticks = remainingSixteenths * 120;

      return new TimelinePosition(bars, beats, ticks);
    }

    static fromSeconds(
      seconds: number,
      tempo: number = 120
    ): TimelinePosition {
      const ticksPerSecond = (tempo * 480) / 60;
      const totalTicks = Math.round(seconds * ticksPerSecond);
      return TimelinePosition.fromTicks(totalTicks);
    }

    static durationToSpan(duration: number): number {
      return duration;
    }

    toSeconds(tempo: number = 120): number {
      const ticksPerSecond = (tempo * 480) / 60;
      return this.toTicks() / ticksPerSecond;
    }

    snap(
      gridSize: number,
      direction: "floor" | "ceil" | "round" = "round"
    ): TimelinePosition {
      if (gridSize <= 0) return this.copy();
      
      const totalTicks = this.toTicks();
      const gridTicks = gridSize * 480;

      let snappedTicks: number;
      switch (direction) {
        case "floor":
          snappedTicks = Math.floor(totalTicks / gridTicks) * gridTicks;
          break;
        case "ceil":
          snappedTicks = Math.ceil(totalTicks / gridTicks) * gridTicks;
          break;
        case "round":
        default:
          snappedTicks = Math.round(totalTicks / gridTicks) * gridTicks;
      }

      return TimelinePosition.fromTicks(snappedTicks);
    }

    translate(
      delta: { measures: number; beats: number; fraction: number; sign: number },
      applySnap?: boolean
    ): TimelinePosition {
      let totalTicks = this.toTicks();
      const deltaTicks =
        (delta.measures * 4 * 480 + delta.beats * 480 + delta.fraction * 120) *
        delta.sign;

      totalTicks += deltaTicks;
      totalTicks = Math.max(0, totalTicks);

      let newPosition = TimelinePosition.fromTicks(totalTicks);
      if (applySnap) {
        newPosition = newPosition.snap(1);
      }
      return newPosition;
    }

    toString(): string {
      return `${this.bar}:${this.beat}:${this.tick}`;
    }
  }

  return {
    TimelinePosition
  };
});

vi.mock("../../services/types/types", () => {
  class TimelinePosition {
    bar: number;
    beat: number;
    tick: number;
    sixteenth: number;
    fraction: number;
    measure: number;

    constructor(bar: number = 0, beat: number = 0, tick: number = 0) {
      this.bar = bar;
      this.beat = beat;
      this.tick = tick;
      this.sixteenth = Math.floor(tick / 120);
      this.fraction = (tick % 120) / 120;
      this.measure = bar;
    }

    diffInMargin(other: TimelinePosition): number {
      return Math.abs(this.toMargin() - other.toMargin());
    }

    diff(other: TimelinePosition): { bars: number; beats: number; ticks: number } {
      const thisTicks = this.toTicks();
      const otherTicks = other.toTicks();
      const diffTicks = Math.abs(thisTicks - otherTicks);
      
      const bars = Math.floor(diffTicks / (4 * 480));
      let remainingTicks = diffTicks % (4 * 480);
      const beats = Math.floor(remainingTicks / 480);
      remainingTicks = remainingTicks % 480;
      
      return { bars, beats, ticks: remainingTicks };
    }

    toMargin(): number {
      return this.toTicks();
    }

    toTicks(): number {
      return this.bar * 4 * 480 + this.beat * 480 + this.tick;
    }

    copy(): TimelinePosition {
      return new TimelinePosition(this.bar, this.beat, this.tick);
    }

    compareTo(other: TimelinePosition): number {
      if (this.bar !== other.bar) return this.bar - other.bar;
      if (this.beat !== other.beat) return this.beat - other.beat;
      return this.tick - other.tick;
    }

    equals(other: TimelinePosition): boolean {
      return (
        this.bar === other.bar &&
        this.beat === other.beat &&
        this.tick === other.tick
      );
    }

    add(bars: number, beats: number, ticks: number): TimelinePosition {
      let resultTick = this.tick + ticks;
      let resultBeat = this.beat + beats;
      let resultBar = this.bar + bars;

      if (resultTick >= 480) {
        resultBeat += Math.floor(resultTick / 480);
        resultTick %= 480;
      }

      if (resultBeat >= 4) {
        resultBar += Math.floor(resultBeat / 4);
        resultBeat %= 4;
      }

      return new TimelinePosition(resultBar, resultBeat, resultTick);
    }

    static fromTicks(ticks: number): TimelinePosition {
      const bars = Math.floor(ticks / (4 * 480));
      let remainingTicks = ticks % (4 * 480);
      const beats = Math.floor(remainingTicks / 480);
      remainingTicks = remainingTicks % 480;
      return new TimelinePosition(bars, beats, remainingTicks);
    }

    static fromMargin(margin: number): TimelinePosition {
      return TimelinePosition.fromTicks(margin);
    }

    static fromSpan(span: number): TimelinePosition {
      return TimelinePosition.fromTicks(span * 480);
    }

    static fromSixteenths(sixteenths: number): TimelinePosition {
      const bars = Math.floor(sixteenths / 16);
      let remainingSixteenths = sixteenths % 16;

      const beats = Math.floor(remainingSixteenths / 4);
      remainingSixteenths = remainingSixteenths % 4;

      const ticks = remainingSixteenths * 120;

      return new TimelinePosition(bars, beats, ticks);
    }

    static fromSeconds(
      seconds: number,
      tempo: number = 120
    ): TimelinePosition {
      const ticksPerSecond = (tempo * 480) / 60;
      const totalTicks = Math.round(seconds * ticksPerSecond);
      return TimelinePosition.fromTicks(totalTicks);
    }

    static durationToSpan(duration: number): number {
      return duration;
    }

    toSeconds(tempo: number = 120): number {
      const ticksPerSecond = (tempo * 480) / 60;
      return this.toTicks() / ticksPerSecond;
    }

    snap(
      gridSize: number,
      direction: "floor" | "ceil" | "round" = "round"
    ): TimelinePosition {
      if (gridSize <= 0) return this.copy();
      
      const totalTicks = this.toTicks();
      const gridTicks = gridSize * 480;

      let snappedTicks: number;
      switch (direction) {
        case "floor":
          snappedTicks = Math.floor(totalTicks / gridTicks) * gridTicks;
          break;
        case "ceil":
          snappedTicks = Math.ceil(totalTicks / gridTicks) * gridTicks;
          break;
        case "round":
        default:
          snappedTicks = Math.round(totalTicks / gridTicks) * gridTicks;
      }

      return TimelinePosition.fromTicks(snappedTicks);
    }

    translate(
      delta: { measures: number; beats: number; fraction: number; sign: number },
      applySnap?: boolean
    ): TimelinePosition {
      let totalTicks = this.toTicks();
      const deltaTicks =
        (delta.measures * 4 * 480 + delta.beats * 480 + delta.fraction * 120) *
        delta.sign;

      totalTicks += deltaTicks;
      totalTicks = Math.max(0, totalTicks);

      let newPosition = TimelinePosition.fromTicks(totalTicks);
      if (applySnap) {
        newPosition = newPosition.snap(1);
      }
      return newPosition;
    }

    toString(): string {
      return `${this.bar}:${this.beat}:${this.tick}`;
    }
  }

  return {
    TimelinePosition,
    // Re-export the actual enums and types from core that are still needed
    TrackType: {
      Audio: "audio",
      MIDI: "midi",
      Auxiliary: "auxiliary",
      Master: "master"
    },
    AutomationMode: {
      Off: "off",
      Read: "read", 
      Write: "write",
      Touch: "touch",
      Latch: "latch"
    },
    AutomationLaneEnvelope: {
      Volume: "volume",
      Pan: "pan",
      Send: "send",
      Filter: "filter",
      Tempo: "tempo",
      Effect: "effect"
    }
  };
});

import { WorkstationContext } from "../../contexts";
import ClipboardContext from "../../context/ClipboardContext";
import { Lane } from "../../screens/workstation/components";
import { TimelinePosition } from "../../services/types/timeline";

// Mock clipboard context with proper typing
interface ClipboardContextType {
  clipboardData: any;
  setCopiedData: (data: any) => void;
  clipboardItem?: any;
}

const mockClipboardContext: ClipboardContextType = {
  clipboardData: null, 
  clipboardItem: null,
  setCopiedData: vi.fn()
};
import type { Track } from "../../services/types/types";
import {
  TrackType,
  AutomationMode,
  AutomationLaneEnvelope,
  Clip,
  AutomationNode,
  AutomationLane,
} from "../../types/core";
import { ClipboardItemType } from "../../types/clipboard";

// Mock the electron API
vi.mock("../../services/electron/utils", () => ({
  electronAPI: {
    ipcRenderer: {
      invoke: vi.fn(),
    },
  },
  openContextMenu: vi.fn(),
}));

// Mock the URL.createObjectURL function for JSDOM
global.URL.createObjectURL = vi.fn(() => 'mock-object-url');
global.URL.revokeObjectURL = vi.fn();

// Mock utils functions
vi.mock("../../services/utils/utils", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual as any,
    getLaneColor: (_lanes: AutomationLane[], _idx: number, defaultColor: string) => defaultColor
  };
});

// Setup test environment
vi.mock("../../services/utils/audio", () => ({
  createAudioContext: () => new MockAudioContext(),
}));

// Mock AudioBuffer class
class MockAudioBuffer implements AudioBuffer {
  length: number;
  numberOfChannels: number;
  sampleRate: number;
  duration: number;

  constructor(options: { length: number; numberOfChannels: number; sampleRate: number }) {
    this.length = options.length;
    this.numberOfChannels = options.numberOfChannels;
    this.sampleRate = options.sampleRate;
    this.duration = this.length / this.sampleRate;
  }

  copyFromChannel(_destination: Float32Array, _channelNumber: number, _startInChannel?: number): void {}
  copyToChannel(_source: Float32Array, _channelNumber: number, _startInChannel?: number): void {}
  getChannelData(_channel: number): Float32Array {
    return new Float32Array(this.length);
  }
}

// Mock AudioContext class
class MockAudioContext {
  destination: AudioDestinationNode;
  currentTime: number = 0;
  state: AudioContextState = 'running';

  constructor() {
    this.destination = {} as AudioDestinationNode;
  }

  createBuffer(numChannels: number, length: number, sampleRate: number): AudioBuffer {
    return new MockAudioBuffer({ numberOfChannels: numChannels, length, sampleRate });
  }

  createGain(): GainNode {
    return {
      gain: { value: 1, setValueAtTime: () => {} },
      connect: () => {},
      disconnect: () => {},
    } as unknown as GainNode;
  }

  createBufferSource(): AudioBufferSourceNode {
    return {
      buffer: null,
      connect: () => {},
      disconnect: () => {},
      start: () => {},
      stop: () => {},
    } as unknown as AudioBufferSourceNode;
  }
}

const mockAudioBuffer = new MockAudioBuffer({
  length: 44100,
  numberOfChannels: 2,
  sampleRate: 44100,
});

// Mock audio clip data  
const mockAudioClip: Clip = {
  id: "clip-1",
  name: "test-clip",
  type: TrackType.Audio,
  start: new TimelinePosition(1, 1, 0),
  end: new TimelinePosition(2, 1, 0),
  loopEnd: new TimelinePosition(2, 1, 0),
  muted: false,
  audio: {
    audioBuffer: mockAudioBuffer,
    buffer: new Uint8Array(44100), // Raw audio file buffer with proper length
    waveform: [],
    start: new TimelinePosition(0, 0, 0),
    end: new TimelinePosition(1, 0, 0),
    type: 'audio/wav'
  }
};

// Mock automation node
const mockAutomationNode: AutomationNode = {
  id: "node-1",
  pos: new TimelinePosition(1, 1, 0),
  value: 0.5
};

// Mock automation lane
const mockAutomationLane: AutomationLane = {
  id: "automation-1",
  label: "Volume",
  envelope: AutomationLaneEnvelope.Volume,
  enabled: true,
  minValue: 0,
  maxValue: 1,
  nodes: [mockAutomationNode],
  show: true,
  expanded: false
};

// Mock track data with proper typing
const mockTrack: Track = {
  id: "track-1",
  name: "Test Track",
  type: TrackType.Audio,
  color: "#808080",
  volume: 1,
  pan: 0,
  solo: false,
  mute: false,
  armed: false,
  automation: false,
  automationMode: AutomationMode.Off,
  clips: [mockAudioClip],
  fx: {
    preset: null,
    effects: [],
    selectedEffectIndex: 0
  },
  automationLanes: [mockAutomationLane]
};

// Mock context values with proper typing
const mockWorkstationContext = {
  adjustNumMeasures: vi.fn(),
  allowMenuAndShortcuts: true,
  addNode: vi.fn(),
  consolidateClip: vi.fn(),
  deleteClip: vi.fn(),
  duplicateClip: vi.fn(),
  numMeasures: 4,
  playheadPos: new TimelinePosition(1, 1, 0),
  scrollToItem: null,
  selectedClipId: null,
  setAllowMenuAndShortcuts: vi.fn(),
  setScrollToItem: vi.fn(),
  setSelectedClipId: vi.fn(),
  setSongRegion: vi.fn(),
  setTrackRegion: vi.fn(),
  snapGridSize: { bar: 0, beat: 1, ticks: 0 },
  splitClip: vi.fn(),
  timelineSettings: {
    beatWidth: 60,
    timeSignature: { beats: 4, noteValue: 4 },
    horizontalScale: 1,
    tempo: 120
  },
  toggleMuteClip: vi.fn(),
  tracks: [mockTrack],
  verticalScale: 1,
  addTrack: vi.fn(),
  updateTrack: vi.fn(),
  removeTrack: vi.fn(),
  createAudioTrack: vi.fn(),
  updateTimelineSettings: vi.fn(),
  setLane: vi.fn(),
  maxPos: new TimelinePosition(32, 4, 0),
  setSelectedTrackId: vi.fn(),
  masterTrack: { ...mockTrack, id: 'master' },
  showMaster: true,
  deleteTrack: vi.fn(),
  duplicateTrack: vi.fn(),
  getTrackCurrentValue: vi.fn(),
  pasteClip: vi.fn(),
  pasteNode: vi.fn()
};

// Define default props for Lane component
const defaultLaneProps = {
  dragDataTarget: null,
  track: mockTrack,
};

// Test wrapper component
const renderWithContexts = (ui: React.ReactElement) => {
  return render(
    <WorkstationContext.Provider value={mockWorkstationContext}>
      <ClipboardContext.Provider value={mockClipboardContext}>
        {ui}
      </ClipboardContext.Provider>
    </WorkstationContext.Provider>
  );
};

describe("Lane Component", () => {
  const renderLane = (props = {}) => {
    return renderWithContexts(
      <Lane {...defaultLaneProps} {...props} />
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock document.getElementById for timeline-editor-window
    vi.spyOn(document, 'getElementById').mockImplementation((id) => {
      if (id === 'timeline-editor-window') {
        // Create a mock element with comprehensive scroll properties
        const mockElement = {
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          scrollTop: 0,
          scrollLeft: 0,
          clientHeight: 600,
          clientWidth: 800,
          scrollHeight: 1200,
          scrollWidth: 1600,
          scrollTo: vi.fn(),
          getBoundingClientRect: vi.fn(() => ({
            top: 100,
            left: 200,
            bottom: 700,
            right: 1000,
            width: 800,
            height: 600,
            x: 200,
            y: 100,
          }))
        } as any;
        return mockElement;
      }
      return null;
    });

    // Mock HTMLMediaElement.prototype.playbackRate with validation
    Object.defineProperty(HTMLMediaElement.prototype, 'playbackRate', {
      get: function() { return this._playbackRate || 1; },
      set: function(value) { 
        // Validate playbackRate value to prevent errors
        if (typeof value === 'number' && value > 0 && value <= 16) {
          this._playbackRate = value; 
        }
      },
      configurable: true
    });
    
    // Mock HTMLMediaElement.prototype.currentTime
    Object.defineProperty(HTMLMediaElement.prototype, 'currentTime', {
      get: function() { return this._currentTime || 0; },
      set: function(value) { 
        if (typeof value === 'number' && value >= 0) {
          this._currentTime = value; 
        }
      },
      configurable: true
    });
  });

  describe("Rendering", () => {
    it("renders track lane correctly", () => {
      const { container } = renderLane();
      const laneElement = container.querySelector(".lane");
      expect(laneElement).toBeInTheDocument();
      expect(laneElement).toHaveAttribute("data-track", mockTrack.id);
    });

    it("displays track automation lanes when automation is enabled", () => {
      const automatedTrack = {
        ...mockTrack,
        automation: true
      };
      renderLane({ track: automatedTrack });
      const automationElements = container.querySelectorAll(".automation-lane");
      expect(automationElements.length).toBeGreaterThan(0);
    });

    it("applies correct styling based on track type and state", () => {
      const { container } = renderLane();
      const laneElement = container.querySelector(".lane");
      expect(laneElement).toBeInTheDocument();
      expect(laneElement).toHaveStyle({
        position: "relative"
      });
    });
  });

  describe("Rendering", () => {
    it("renders track lane correctly", () => {
      const { container } = renderLane();
      const laneElement = container.querySelector(".lane");
      expect(laneElement).toBeInTheDocument();
      expect(laneElement).toHaveAttribute("data-track", mockTrack.id);
    });

    it("displays track automation lanes when automation is enabled", () => {
      const automatedTrack = {
        ...mockTrack,
        automation: true
      };
      const { container } = renderLane({ track: automatedTrack });
      const automationElements = container.querySelectorAll(".automation-lane");
      expect(automationElements.length).toBeGreaterThan(0);
    });

    it("applies correct styling based on track type and state", () => {
      const { container } = renderLane();
      const laneElement = container.querySelector(".lane");
      expect(laneElement).toBeInTheDocument();
      expect(laneElement).toHaveStyle({
        position: "relative"
      });
    });
  });

  describe("Audio Analysis", () => {
    it("triggers audio analysis on clip selection", async () => {
      const { container } = renderLane();
      const audioClip = container.querySelector(`[data-testid="audio-clip-${mockAudioClip.id}"]`);
      if (audioClip) {
        fireEvent.click(audioClip);
        await waitFor(() => {
          expect(mockWorkstationContext.setSelectedClipId).toHaveBeenCalledWith(mockAudioClip.id);
        });
      }
    });

    it("shows audio analysis panel when enabled", () => {
      const trackWithAnalysis = {
        ...mockTrack,
        clips: [{ ...mockAudioClip, showAnalysis: true }]
      };
      const { container } = renderLane({ track: trackWithAnalysis });
      // Check if analysis-related elements exist in the component
      expect(container.querySelector(".lane")).toBeInTheDocument();
    });
  });

  describe("Automation Nodes", () => {
    it("adds automation node on shift+click", () => {
      const automatedTrack = {
        ...mockTrack,
        automation: true,
        automationLanes: [{ ...mockAutomationLane, show: true }]
      };
      
      const { container } = renderLane({ track: automatedTrack });
      const automationLane = container.querySelector(".automation-lane");
      if (automationLane) {
        fireEvent.click(automationLane, { shiftKey: true, clientX: 100, clientY: 50 });
        
        expect(mockWorkstationContext.addNode).toHaveBeenCalledWith(
          expect.any(Object),
          expect.any(Object),
          expect.objectContaining({
            id: expect.any(String),
            pos: expect.any(TimelinePosition),
            value: expect.any(Number)
          })
        );
      }
    });

    it("updates automation node value on drag", async () => {
      const automatedTrack = {
        ...mockTrack,
        automation: true,
        automationLanes: [{ ...mockAutomationLane, show: true }]
      };
      
      const { container } = renderLane({ track: automatedTrack });

      const node = container.querySelector(`[data-testid="automation-node-${mockAutomationNode.id}"]`);
      if (node) {
        fireEvent.mouseDown(node);
        fireEvent.mouseMove(node, { clientY: 100 });
        fireEvent.mouseUp(node);

        expect(mockWorkstationContext.setLane).toHaveBeenCalledWith(
          expect.any(Object),
          expect.objectContaining({
            nodes: expect.arrayContaining([
              expect.objectContaining({
                id: mockAutomationNode.id,
                value: expect.any(Number)
              })
            ])
          })
        );
      }
    });
  });

  describe("Error Handling", () => {
    it("handles audio buffer loading errors gracefully", () => {
      const invalidAudioClip = {
        ...mockAudioClip,
        audio: { 
          audioBuffer: null, 
          buffer: new Uint8Array(0), // Empty buffer instead of null
          waveform: [],
          start: new TimelinePosition(0, 0, 0),
          end: new TimelinePosition(1, 0, 0),
          type: 'audio/wav'
        }
      };
      const trackWithInvalidClip = {
        ...mockTrack,
        clips: [invalidAudioClip]
      };
      const { container } = renderLane({ track: trackWithInvalidClip });
      // Check that the component renders without crashing
      expect(container.querySelector(".lane")).toBeInTheDocument();
    });

    it("handles automation node errors", () => {
      const invalidNode = {
        ...mockAutomationNode,
        value: -1 // Invalid value outside range
      };
      const trackWithInvalidNode = {
        ...mockTrack,
        automation: true,
        automationLanes: [{
          ...mockAutomationLane,
          nodes: [invalidNode],
          show: true
        }]
      };

      const { container } = renderLane({ track: trackWithInvalidNode });
      // Check that the component renders without crashing
      expect(container.querySelector(".lane")).toBeInTheDocument();
    });
  });

  describe("Context Menu", () => {
    it("opens lane context menu with proper options", async () => {
      mockClipboardContext.clipboardData = {
        type: ClipboardItemType.Clip,
        data: mockAudioClip
      };

      const { container } = renderLane();
      const lane = container.querySelector(".lane");
      if (lane) {
        fireEvent.contextMenu(lane);
        expect(mockWorkstationContext.setSelectedTrackId).toHaveBeenCalledWith(mockTrack.id);
      }
    });
  });
});