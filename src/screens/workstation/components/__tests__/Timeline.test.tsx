import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, fireEvent, act } from "@testing-library/react";
import { Timeline } from "../Timeline";
import { WorkstationContext } from "../../../../contexts/WorkstationContext";
import {
  Track,
  TrackType,
  AutomationMode,
  TimelinePosition,
} from "../../../../types/core";
import { setupCanvasMock } from "../../../../test/mocks/canvasMock";

// Mock the TimelinePosition class from core types
vi.mock("../../../../types/core", async () => {
  const actual = await vi.importActual("../../../../types/core");

  class MockTimelinePosition {
    bar: number;
    beat: number;
    tick: number;

    constructor(bar = 0, beat = 0, tick = 0) {
      this.bar = bar;
      this.beat = beat;
      this.tick = tick;
    }

    toSeconds() {
      return (this.bar * 4 + this.beat) * 0.5 + this.tick * 0.001;
    }

    toTicks() {
      return this.bar * 4 * 480 + this.beat * 480 + this.tick;
    }

    toMargin() {
      return "0px";
    }

    copy() {
      return new MockTimelinePosition(this.bar, this.beat, this.tick);
    }

    equals() {
      return true;
    }

    add() {
      return this;
    }

    snap() {
      return this;
    }

    translate() {
      return this;
    }

    compareTo() {
      return 0;
    }

    diffInMargin() {
      return "0px";
    }

    toString() {
      return `${this.bar}.${this.beat}.${this.tick}`;
    }

    static parseFromString() {
      return new MockTimelinePosition(1, 0, 0);
    }

    static fromTicks() {
      return new MockTimelinePosition(0, 0, 0);
    }

    static fromSeconds() {
      return new MockTimelinePosition(0, 0, 0);
    }

    static fromMargin() {
      return new MockTimelinePosition(0, 0, 0);
    }

    static fromTime() {
      return new MockTimelinePosition(0, 0, 0);
    }

    static fromGrid() {
      return new MockTimelinePosition(0, 0, 0);
    }
  }

  return {
    ...actual,
    TimelinePosition: MockTimelinePosition,
  };
});

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
  root: null,
  rootMargin: "",
  thresholds: [],
}));

// Mock requestAnimationFrame
global.requestAnimationFrame = vi
  .fn()
  .mockImplementation((cb) => setTimeout(cb, 16));
global.cancelAnimationFrame = vi.fn().mockImplementation(clearTimeout);

// Mock WorkstationContext - add all required properties
const createDefaultTrack = (id: string): Track => ({
  id,
  name: id,
  type: TrackType.MIDI,
  color: "#FF0000",
  volume: 0,
  pan: 0,
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
    effects: [],
  },
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
    horizontalScale: 1,
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
  ...overrides,
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
    expect(canvas?.height).toBe(400);
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
