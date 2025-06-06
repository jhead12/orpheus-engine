import React from "react";
import { render, fireEvent, screen } from "@testing-library/react";
import { WorkstationContext } from "../../../../contexts";
import ClipboardContext from "../../../../context/ClipboardContext";
import Lane from "../Lane";
import type { Track } from "../../../../services/types/types";
import {
  TrackType,
  AutomationMode,
  AutomationLaneEnvelope,
} from "../../../../services/types/types";
// Mock the electron API
jest.mock("../../../../services/electron/utils", () => ({
  electronAPI: {
    ipcRenderer: {
      invoke: jest.fn(),
    },
  },
  openContextMenu: jest.fn(),
}));

// Setup test environment
vi.mock("../../../../services/utils/audio", () => ({
  createAudioContext: () => new MockAudioContext(),
}));

// Mock classes
class MockAudioBuffer implements AudioBuffer {
  length: number;
  numberOfChannels: number;
  sampleRate: number;

  constructor(options: {
    length: number;
    numberOfChannels: number;
    sampleRate: number;
  }) {
    this.length = options.length;
    this.numberOfChannels = options.numberOfChannels;
    this.sampleRate = options.sampleRate;
  }
}

class MockAudioContext {
  // Mock implementation of AudioContext methods and properties
}

// Mock context values
const mockClipboardContext = {
  clipboardData: null,
  setCopiedData: jest.fn(),
};

const mockTrack: Track = {
  id: "test-track-1",
  name: "Test Track",
  color: "#ff0000",
  type: TrackType.Audio,
  volume: 0,
  pan: 0,
  solo: false,
  mute: false,
  armed: false,
  automation: false,
  automationMode: AutomationMode.Off,
  clips: [],
  fx: {
    preset: null,
    effects: [],
    selectedEffectIndex: 0,
  },
  automationLanes: [
    {
      id: "automation-1",
      label: "Volume",
      envelope: AutomationLaneEnvelope.Volume,
      enabled: true,
      minValue: 0,
      maxValue: 1,
      nodes: [],
      show: true,
      expanded: false,
    },
  ],
};

const mockWorkstationContext = {
  masterTrack: {
    ...mockTrack,
    id: "master",
    name: "Master Track",
  },
  tracks: [mockTrack],
  snapGridSize: 1,
  playheadPos: { toMargin: () => 0, copy: () => ({ toMargin: () => 0 }) },
  selectedTrackId: null,
  setSelectedTrackId: jest.fn(),
  setTrack: jest.fn(),
  setTracks: jest.fn(),
  verticalScale: 1,
  showMaster: true,
  adjustNumMeasures: jest.fn(),
  createAudioClip: jest.fn(),
  createClipFromTrackRegion: jest.fn(),
  insertClips: jest.fn(),
  pasteClip: jest.fn(),
  setTrackRegion: jest.fn(),
  trackRegion: null,
  timelineSettings: {
    tempo: 120,
    timeSignature: { beats: 4, noteValue: 4 },
    horizontalScale: 1,
    beatWidth: 100,
  },
  allowMenuAndShortcuts: true,
  setAllowMenuAndShortcuts: jest.fn(),
  consolidateClip: jest.fn(),
  deleteClip: jest.fn(),
  duplicateClip: jest.fn(),
  splitClip: jest.fn(),
  toggleMuteClip: jest.fn(),
  setSongRegion: jest.fn(),
  maxPos: { toMargin: () => 1000 },
  numMeasures: 4,
  setVerticalScale: jest.fn(),
  updateTimelineSettings: jest.fn(),
  scrollToItem: null,
  selectedClipId: null,
  setScrollToItem: jest.fn(),
  setSelectedClipId: jest.fn(),
  isPlaying: false,
  setIsPlaying: jest.fn(),
  analyzeClip: jest.fn(),
};

describe("Lane Component", () => {
  const renderLane = (props = {}) => {
    return render(
      <ClipboardContext.Provider value={mockClipboardContext}>
        <WorkstationContext.Provider value={mockWorkstationContext}>
          <Lane
            data-testid="lane-container"
            dragDataTarget={null}
            track={mockTrack}
            {...props}
          />
        </WorkstationContext.Provider>
      </ClipboardContext.Provider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
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
        automation: true,
      };
      const { container } = renderLane({ track: automatedTrack });
      const automationElements =
        container.getElementsByClassName("automation-lane");
      expect(automationElements.length).toBeGreaterThan(0);
    });
  });

  describe("Interactions", () => {
    it("selects track on mouse down", () => {
      renderLane();
      const laneElement = screen.getByTestId("lane-container");
      fireEvent.mouseDown(laneElement);
      expect(mockWorkstationContext.setSelectedTrackId).toHaveBeenCalledWith(
        mockTrack.id
      );
    });

    it("shows context menu on right click", () => {
      const { container } = renderLane();
      const lane = container.querySelector(".lane");
      expect(lane).toBeTruthy();
      fireEvent.contextMenu(lane!);
    });
  });

  describe("Drag and Drop", () => {
    it("handles audio file drag and drop", () => {
      const { container } = renderLane();
      const lane = container.querySelector(".lane");
      expect(lane).toBeTruthy();

      const file = new File(["test audio content"], "test.mp3", {
        type: "audio/mp3",
      });
      const dataTransfer = {
        files: [file],
        items: [{ kind: "file", type: "audio/mp3" }],
      };

      fireEvent.dragOver(lane!, {
        dataTransfer,
        preventDefault: jest.fn(),
      });

      fireEvent.drop(lane!, {
        dataTransfer,
        preventDefault: jest.fn(),
      });

      expect(mockWorkstationContext.createAudioClip).toHaveBeenCalled();
    });

    it("rejects invalid file types", () => {
      const { container } = renderLane();
      const lane = container.querySelector(".lane");
      expect(lane).toBeTruthy();

      const file = new File(["test content"], "test.txt", {
        type: "text/plain",
      });
      const dataTransfer = {
        files: [file],
        items: [{ kind: "file", type: "text/plain" }],
      };

      fireEvent.dragOver(lane!, {
        dataTransfer,
        preventDefault: jest.fn(),
      });

      expect(lane).toHaveClass("invalid-track-type");
    });
  });

  describe("Automation", () => {
    it("enables track automation when automation button is clicked", () => {
      const setTrack = jest.fn();
      renderLane({ track: { ...mockTrack }, setTrack });

      const automationButton = screen.getByRole("button", {
        name: /automation/i,
      });
      fireEvent.click(automationButton);

      expect(setTrack).toHaveBeenCalledWith(
        expect.objectContaining({
          id: mockTrack.id,
          automation: true,
        })
      );
    });

    it("renders automation lanes when automation is enabled", () => {
      const automatedTrack = {
        ...mockTrack,
        automation: true,
      };
      const { container } = renderLane({ track: automatedTrack });

      const automationLanes =
        container.getElementsByClassName("automation-lane");
      expect(automationLanes.length).toBe(1);
      expect(screen.getByText("Volume")).toBeInTheDocument();
    });

    it("adds automation nodes when clicking in automation lane", async () => {
      const setTrack = jest.fn();
      const automatedTrack = {
        ...mockTrack,
        automation: true,
      };
      const { container } = renderLane({ track: automatedTrack, setTrack });

      const volumeLane = container.querySelector(".automation-lane");
      expect(volumeLane).not.toBeNull();
      fireEvent.click(volumeLane!, {
        clientX: 100,
        clientY: 50,
      });

      expect(setTrack).toHaveBeenCalledWith(
        expect.objectContaining({
          id: mockTrack.id,
          automationLanes: expect.arrayContaining([
            expect.objectContaining({
              id: "automation-1",
              nodes: expect.arrayContaining([
                expect.objectContaining({
                  time: expect.any(Number),
                  value: expect.any(Number),
                }),
              ]),
            }),
          ]),
        })
      );
    });

    it("changes automation mode on mode button click", () => {
      const setTrack = jest.fn();
      const automatedTrack = {
        ...mockTrack,
        automation: true,
        automationMode: AutomationMode.Read,
      };
      renderLane({ track: automatedTrack, setTrack });

      const modeButton = screen.getByRole("button", {
        name: /automation mode/i,
      });
      fireEvent.click(modeButton);

      expect(setTrack).toHaveBeenCalledWith(
        expect.objectContaining({
          id: mockTrack.id,
          automationMode: AutomationMode.Write,
        })
      );
    });
  });

  describe("Audio Analysis", () => {
    it("shows audio analysis panel when clip is selected", () => {
      const clipWithAnalysis = {
        id: "clip-1",
        audioBuffer: new AudioBuffer({
          length: 44100,
          numberOfChannels: 2,
          sampleRate: 44100,
        }),
        startTime: 0,
        duration: 1,
      };

      const trackWithClip = {
        ...mockTrack,
        clips: [clipWithAnalysis],
      };

      renderLane({ track: trackWithClip });
      fireEvent.click(screen.getByTestId("clip-clip-1"));

      expect(screen.getByTestId("audio-analysis-panel")).toBeInTheDocument();
    });

    it("switches between different analysis types", () => {
      const audioContext = new MockAudioContext();
      const clipWithAnalysis = {
        id: "clip-1",
        audioBuffer: audioContext.createBuffer(2, 44100, 44100),
        startTime: 0,
        duration: 1,
      };

      const trackWithClip = {
        ...mockTrack,
        clips: [clipWithAnalysis],
      };

      renderLane({ track: trackWithClip });
      fireEvent.click(screen.getByTestId("clip-clip-1"));

      // Switch to spectral analysis
      fireEvent.click(screen.getByRole("tab", { name: /spectral/i }));
      expect(screen.getByTestId("spectral-analysis")).toBeInTheDocument();

      // Switch to waveform analysis
      fireEvent.click(screen.getByRole("tab", { name: /waveform/i }));
      expect(screen.getByTestId("waveform-analysis")).toBeInTheDocument();
    });
  });

  describe("Track Reordering", () => {
    it("allows tracks to be reordered via drag and drop", async () => {
      const tracks = [
        { ...mockTrack, id: "track-1" },
        { ...mockTrack, id: "track-2" },
        { ...mockTrack, id: "track-3" },
      ];

      renderLane({ track: tracks[0] });

      const sourceTrack = screen.getByTestId("track-track-1");
      const targetTrack = screen.getByTestId("track-track-2");

      fireEvent.dragStart(sourceTrack);
      fireEvent.dragEnter(targetTrack);
      fireEvent.dragOver(targetTrack);
      fireEvent.drop(targetTrack);

      expect(mockWorkstationContext.setTracks).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ id: "track-2" }),
          expect.objectContaining({ id: "track-1" }),
          expect.objectContaining({ id: "track-3" }),
        ])
      );
    });
  });

  describe("Timeline Navigation", () => {
    it("centers on playhead when requested", () => {
      const scrollIntoViewMock = jest.fn();
      window.HTMLElement.prototype.scrollIntoView = scrollIntoViewMock;

      renderLane();

      const playhead = screen.getByTestId("playhead");
      fireEvent.doubleClick(playhead);

      expect(scrollIntoViewMock).toHaveBeenCalled();
    });

    it("adjusts zoom level with ctrl+scroll", () => {
      renderLane();

      const lane = screen.getByTestId("lane-container");

      fireEvent.wheel(lane, {
        deltaY: -100,
        ctrlKey: true,
      });

      expect(
        mockWorkstationContext.updateTimelineSettings
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          horizontalScale: expect.any(Number),
        })
      );
    });
  });

  describe("Complex Automation", () => {
    it("draws automation curve between multiple nodes", () => {
      const automatedTrack = {
        ...mockTrack,
        automation: true,
        automationLanes: [
          {
            ...mockTrack.automationLanes[0],
            nodes: [
              { time: 0, value: 0.5 },
              { time: 1, value: 0.8 },
              { time: 2, value: 0.3 },
            ],
          },
        ],
      };

      const { container } = renderLane({ track: automatedTrack });
      const automationPath = container.querySelector(".automation-curve");
      expect(automationPath).toBeInTheDocument();
    });

    it("updates automation node value on drag", () => {
      const automatedTrack = {
        ...mockTrack,
        automation: true,
        automationLanes: [
          {
            ...mockTrack.automationLanes[0],
            nodes: [{ time: 0, value: 0.5, id: "node-1" }],
          },
        ],
      };

      renderLane({ track: automatedTrack });

      const node = screen.getByTestId("automation-node-node-1");
      fireEvent.mouseDown(node);
      fireEvent.mouseMove(node, { clientY: 50 });
      fireEvent.mouseUp(node);

      expect(mockWorkstationContext.setTrack).toHaveBeenCalledWith(
        expect.objectContaining({
          automationLanes: expect.arrayContaining([
            expect.objectContaining({
              nodes: expect.arrayContaining([
                expect.objectContaining({
                  value: expect.any(Number),
                }),
              ]),
            }),
          ]),
        })
      );
    });
  });
});
