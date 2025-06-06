import React from "react";
import { render, fireEvent, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import { WorkstationContext } from "../../contexts";
import ClipboardContext from "../../context/ClipboardContext";
import { Lane } from "../../screens/workstation/components";
import type { Track } from "../../services/types/types";
import {
  TrackType,
  AutomationMode,
  AutomationLaneEnvelope,
  Clip,
  AutomationNode,
  AutomationLane,
} from "../../types/core";
import { TimelinePosition } from "../../services/types/timeline";
import { ClipboardItemType } from "../../types/clipboard";
import type { ClipboardContextType } from "../../context/ClipboardContext";

// Mock the electron API
vi.mock("../../services/electron/utils", () => ({
  electronAPI: {
    ipcRenderer: {
      invoke: vi.fn(),
    },
  },
  openContextMenu: vi.fn(),
}));

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
  audio: {
    audioBuffer: mockAudioBuffer,
    buffer: mockAudioBuffer,
    waveform: [],
    start: new TimelinePosition(0, 0, 0),
    end: new TimelinePosition(1, 0, 0)
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
// Mock clipboard context with proper typing
const mockClipboardContext: ClipboardContextType = {
  clipboardData: null, 
  setCopiedData: vi.fn()
};

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
      const automationElements = screen.getAllByTestId("automation-lane");
      expect(automationElements.length).toBeGreaterThan(0);
    });

    it("applies correct styling based on track type and state", () => {
      renderLane();
      const laneElement = screen.getByTestId("lane-container");
      expect(laneElement).toHaveStyle({
        backgroundColor: "var(--bg3)",
        borderBottom: "1px solid var(--border1)"
      });
    });
  });

  describe("Audio Analysis", () => {
    it("triggers audio analysis on clip selection", async () => {
      renderLane();
      const audioClip = screen.getByTestId("audio-clip-clip-1");
      fireEvent.click(audioClip);
      await waitFor(() => {
        expect(mockWorkstationContext.setSelectedClipId).toHaveBeenCalledWith(mockAudioClip.id);
      });
    });

    it("shows audio analysis panel when enabled", () => {
      const trackWithAnalysis = {
        ...mockTrack,
        clips: [{ ...mockAudioClip, showAnalysis: true }]
      };
      renderLane({ track: trackWithAnalysis });
      expect(screen.getByTestId("audio-analysis-panel")).toBeInTheDocument();
    });
  });

  describe("Automation Nodes", () => {
    it("adds automation node on shift+click", () => {
      const automatedTrack = {
        ...mockTrack,
        automation: true,
        automationLanes: [{ ...mockAutomationLane, show: true }]
      };
      
      renderLane({ track: automatedTrack });
      const automationLane = screen.getByTestId("automation-lane");
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
    });

    it("updates automation node value on drag", async () => {
      const automatedTrack = {
        ...mockTrack,
        automation: true,
        automationLanes: [{ ...mockAutomationLane, show: true }]
      };
      
      renderLane({ track: automatedTrack });

      const node = screen.getByTestId("automation-node-node-1");
      fireEvent.mouseDown(node);
      fireEvent.mouseMove(node, { clientY: 100 });
      fireEvent.mouseUp(node);

      expect(mockWorkstationContext.setLane).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          nodes: expect.arrayContaining([
            expect.objectContaining({
              id: "node-1",
              value: expect.any(Number)
            })
          ])
        })
      );
    });
  });

  describe("Error Handling", () => {
    it("handles audio buffer loading errors gracefully", () => {
      const invalidAudioClip = {
        ...mockAudioClip,
        audio: { ...mockAudioClip.audio, buffer: null, audioBuffer: null }
      };
      const trackWithInvalidClip = {
        ...mockTrack,
        clips: [invalidAudioClip]
      };
      renderLane({ track: trackWithInvalidClip });
      expect(screen.getByTestId("audio-clip-error")).toBeInTheDocument();
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

      renderLane({ track: trackWithInvalidNode });
      expect(screen.getByTestId("automation-node-error")).toBeInTheDocument();
    });
  });

  describe("Context Menu", () => {
    it("opens lane context menu with proper options", async () => {
      mockClipboardContext.clipboardData = {
        type: ClipboardItemType.Clip,
        data: mockAudioClip
      };

      renderLane();
      const lane = screen.getByTestId("lane-container");
      fireEvent.contextMenu(lane);

      expect(mockWorkstationContext.setSelectedTrackId).toHaveBeenCalledWith(mockTrack.id);
    });
  });
});