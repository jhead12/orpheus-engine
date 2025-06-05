import React from "react";
import { render, fireEvent, screen } from "@testing-library/react";
import { ClipboardContext, WorkstationContext } from "../../../contexts";
import Lane from "../Lane";
import {
  Track,
  TrackType,
  TimelinePosition,
} from "../../../services/types/types";

// Mock the electron API
jest.mock("../../../services/electron/utils", () => ({
  electronAPI: {
    ipcRenderer: {
      invoke: jest.fn(),
    },
  },
  openContextMenu: jest.fn(),
}));

// Mock context values
const mockClipboardContext = {
  clipboardItem: null,
  setClipboardItem: jest.fn(),
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
  clips: [],
  fx: {
    preset: null,
    effects: [],
    selectedEffectIndex: 0,
  },
  automationLanes: [],
};

const mockWorkstationContext = {
  masterTrack: {
    id: "master",
    name: "Master",
    type: TrackType.Audio,
  },
  tracks: [mockTrack],
  snapGridSize: 1,
  playheadPos: new TimelinePosition(0),
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
    timeSignature: { numerator: 4, denominator: 4 },
  },
};

describe("Lane Component", () => {
  const renderLane = (props = {}) => {
    return render(
      <ClipboardContext.Provider value={mockClipboardContext}>
        <WorkstationContext.Provider value={mockWorkstationContext}>
          <Lane dragDataTarget={null} track={mockTrack} {...props} />
        </WorkstationContext.Provider>
      </ClipboardContext.Provider>
    );
  };

  it("renders track lane correctly", () => {
    const { container } = renderLane();
    expect(container.querySelector(".lane")).toBeInTheDocument();
  });

  it("selects track on mouse down", () => {
    renderLane();
    const lane = screen.getByRole("presentation");
    fireEvent.mouseDown(lane);
    expect(mockWorkstationContext.setSelectedTrackId).toHaveBeenCalledWith(
      mockTrack.id
    );
  });

  it("displays track automation lanes when track has automation enabled", () => {
    const automatedTrack = {
      ...mockTrack,
      automation: true,
      automationLanes: [
        {
          id: "lane-1",
          show: true,
          envelope: "volume",
          enabled: true,
          expanded: true,
          nodes: [],
        },
      ],
    };
    const { container } = renderLane({ track: automatedTrack });
    expect(container.querySelector(".automation-lane")).toBeInTheDocument();
  });

  it("displays clips when track has them", () => {
    const trackWithClips = {
      ...mockTrack,
      clips: [
        {
          id: "clip-1",
          name: "Test Clip",
          type: TrackType.Audio,
          start: new TimelinePosition(0),
          end: new TimelinePosition(4),
          color: "#ff0000",
        },
      ],
    };
    const { container } = renderLane({ track: trackWithClips });
    expect(container.querySelector(".clip")).toBeInTheDocument();
  });

  it("renders master track differently", () => {
    const { container } = renderLane({
      track: mockWorkstationContext.masterTrack,
    });
    const lane = container.querySelector(".lane");
    expect(lane?.style.pointerEvents).toBe("none");
  });
});
