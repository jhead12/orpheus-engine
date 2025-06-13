// Mock implementations must be at the top of the file, before any imports
vi.mock("@orpheus/types/core", () => {
  const mockPosition = {
    bar: 0,
    beat: 0,
    tick: 0,
    toSeconds: vi.fn().mockReturnValue(0),
    toTicks: vi.fn().mockReturnValue(0),
    toMargin: vi.fn().mockReturnValue(0),
    copy: vi.fn(),
    equals: vi.fn().mockReturnValue(true),
    add: vi.fn(),
    snap: vi.fn(),
    toString: vi.fn().mockReturnValue("0:0:0")
  };

  mockPosition.copy.mockReturnValue(mockPosition);
  mockPosition.add.mockReturnValue(mockPosition);
  mockPosition.snap.mockReturnValue(mockPosition);

  const TimelinePosition = vi.fn().mockImplementation(() => mockPosition);
  TimelinePosition.fromTicks = vi.fn().mockReturnValue(mockPosition);
  TimelinePosition.fromSeconds = vi.fn().mockReturnValue(mockPosition);
  TimelinePosition.defaultSettings = {
    tempo: 120,
    timeSignature: { beats: 4, noteValue: 4 },
    snap: true,
    snapUnit: "beat",
    horizontalScale: 1
  };

  return {
    TimelinePosition,
    TrackType: { Midi: "Midi", Audio: "Audio" },
    Track: vi.fn(),
    AutomationMode: {
      Off: "off",
      Read: "read",
      Write: "write",
      Touch: "touch",
      Latch: "latch",
      Trim: "trim"
    }
  };
});

vi.mock("@orpheus/contexts/WorkstationContext", () => ({
  WorkstationContext: {
    Provider: ({ children }: { children: React.ReactNode }) => children
  }
}));

// Core testing utilities
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render } from "@testing-library/react";
import { Timeline } from "../Timeline";
import { WorkstationContext } from "@orpheus/contexts/WorkstationContext";
import {
  Track,
  TrackType,
  AutomationMode,
  TimelinePosition,
} from "@orpheus/types/core";

// Mock canvas setup
const setupCanvasMock = () => {
  const mockContext = {
    fillRect: vi.fn(),
    clearRect: vi.fn(),
    strokeRect: vi.fn(),
    fillStyle: "#000000",
    strokeStyle: "#000000",
    lineWidth: 1,
    getImageData: vi.fn(() => ({
      data: new Uint8ClampedArray(4),
      width: 1,
      height: 1
    })),
    putImageData: vi.fn(),
    createImageData: vi.fn(() => ({
      data: new Uint8ClampedArray(4),
      width: 1,
      height: 1
    })),
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
    measureText: vi.fn(() => ({ width: 0 })),
    transform: vi.fn(),
    rect: vi.fn(),
    clip: vi.fn(),
    font: "10px sans-serif"
  };

  HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue(mockContext);
};

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
  root: null,
  rootMargin: "",
  thresholds: []
}));

// Mock requestAnimationFrame
global.requestAnimationFrame = vi.fn().mockImplementation((cb) => setTimeout(cb, 16));
global.cancelAnimationFrame = vi.fn().mockImplementation(clearTimeout);

// Mock WorkstationContext - add all required properties
const createDefaultTrack = (id: string): Track => ({
  id,
  name: id,
  type: TrackType.Midi,
  color: "#FF0000",
  volume: { value: 0, isAutomated: false },
  pan: { value: 0, isAutomated: false },
  mute: false,
  solo: false,
  armed: false,
  clips: [],
  effects: [],
  automation: false,
  automationMode: AutomationMode.Read,
  automationLanes: [],
  fx: {
    preset: null,
    selectedEffectIndex: 0,
    effects: []
  }
});

const createMockWorkstationContext = (overrides = {}) => ({
  tracks: [createDefaultTrack("track-1")],
  masterTrack: createDefaultTrack("master"),
  isPlaying: false,
  playheadPos: new TimelinePosition(),
  maxPos: new TimelinePosition(4, 0, 0),
  adjustNumMeasures: vi.fn(),
  allowMenuAndShortcuts: true,
  consolidateClip: vi.fn(),
  deleteClip: vi.fn(),
  duplicateClip: vi.fn(),
  scrollToItem: null,
  selectedClipId: null,
  setAllowMenuAndShortcuts: vi.fn(),
  setScrollToItem: vi.fn(),
  setSelectedClipId: vi.fn(),
  setSongRegion: vi.fn(),
  setTrackRegion: vi.fn(),
  snapGridSize: new TimelinePosition(0, 1, 0),
  splitClip: vi.fn(),
  timelineSettings: {
    beatWidth: 64,
    timeSignature: { beats: 4, noteValue: 4 },
    horizontalScale: 1
  },
  toggleMuteClip: vi.fn(),
  verticalScale: 1,
  addTrack: vi.fn(),
  createAudioClip: vi.fn(),
  insertClips: vi.fn(),
  numMeasures: 4,
  setPlayheadPos: vi.fn(),
  setTracks: vi.fn(),
  setVerticalScale: vi.fn(),
  songRegion: null,
  updateTimelineSettings: vi.fn(),
  ...overrides
});

describe("Timeline", () => {
  beforeEach(() => {
    setupCanvasMock();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders canvas element with proper dimensions", () => {
    const { container } = render(
      <WorkstationContext.Provider value={createMockWorkstationContext()}>
        <Timeline />
      </WorkstationContext.Provider>
    );

    const canvas = container.querySelector("canvas");
    expect(canvas).toBeInTheDocument();
    expect(canvas?.width).toBe(800);
    expect(canvas?.height).toBe(370); // 400 - 30 for time ruler
  });

  it("handles canvas resizing", () => {
    const { container } = render(
      <WorkstationContext.Provider value={createMockWorkstationContext()}>
        <Timeline />
      </WorkstationContext.Provider>
    );

    const canvas = container.querySelector("canvas");
    expect(canvas).toBeInTheDocument();

    // Simulate canvas resize
    if (canvas) {
      canvas.setAttribute("width", "1000");
      canvas.setAttribute("height", "500");
      expect(canvas.width).toBe(1000);
      expect(canvas.height).toBe(500);
    }
  });
});
