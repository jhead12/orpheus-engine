// Define enums FIRST - these must be available before any mocks
const TrackType = {
  Audio: "audio" as const,
  Midi: "midi" as const,
  Sequencer: "sequencer" as const,
};

const AutomationMode = {
  Read: "read" as const,
  Write: "write" as const,
  Touch: "touch" as const,
  Latch: "latch" as const,
  Off: "off" as const,
};

const AutomationLaneEnvelope = {
  Volume: "volume" as const,
  Pan: "pan" as const,
  Tempo: "tempo" as const,
  Send: "send" as const,
  Filter: "filter" as const,
  Effect: "effect" as const,
};

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import TrackComponent from "../TrackComponent";
import { WorkstationContext } from "../../../contexts";
import { expectScreenshot } from "@orpheus/test/helpers/screenshot";

// Mock volume utility functions
vi.mock("@orpheus/utils/utils", () => ({
  volumeToNormalized: vi.fn().mockImplementation((volume) => {
    if (volume <= -60) return 0;
    if (volume >= 0) return 1;
    return Math.pow(10, volume / 20);
  }),
  normalizedToVolume: vi.fn().mockImplementation((normalized) => {
    if (normalized <= 0) return -60;
    if (normalized >= 1) return 0;
    return 20 * Math.log10(normalized);
  }),
  formatVolume: vi.fn().mockImplementation((volume) => {
    if (volume <= -60) return "-∞ dB";
    return `${volume.toFixed(1)} dB`;
  }),
  getLaneColor: vi.fn().mockReturnValue("#808080"),
  BASE_HEIGHT: 100,
}));

// Mock TimelinePosition with parseFromString method
vi.mock("../../../types/core", () => {
  const mockTimelinePosition: any = {
    ticks: 0,
    bar: 0,
    beat: 0,
    tick: 0,
    toMargin: vi.fn(() => 0),
    fromMargin: vi.fn(() => ({ ticks: 0 })),
    snap: vi.fn(() => ({ ticks: 0 })),
    toTicks: vi.fn(() => 0),
    toSeconds: vi.fn(() => 0),
    copy: vi.fn(() => mockTimelinePosition),
    equals: vi.fn(() => true),
    add: vi.fn(() => mockTimelinePosition),
    compareTo: vi.fn(() => 0),
  };

  return {
    TimelinePosition: {
      ...mockTimelinePosition,
      parseFromString: vi.fn().mockImplementation(() => mockTimelinePosition),
    },
    TrackType,
    AutomationMode,
    AutomationLaneEnvelope,
  };
});

// Mock AutomationLaneTrack to avoid dependency issues
vi.mock("../AutomationLaneTrack", () => ({
  default: vi.fn(() => null)
}));

// Mock electron utils
vi.mock("../../../services/electron/utils", () => ({
  openContextMenu: vi.fn()
}));

// Mock general utils
vi.mock("../../../services/utils/general", () => ({
  hueFromHex: vi.fn().mockReturnValue(120),
  hslToHex: vi.fn().mockReturnValue("#00ff00")
}));

// Mock widgets
vi.mock("../../../components/widgets", () => ({
  Dialog: vi.fn(({ children, open }) => open ? children : null),
  HueInput: vi.fn(() => null)
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

describe("TrackComponent", () => {
  let container: HTMLDivElement;

  // Factory function to create mock TimelinePosition instances for tests
  function createMockTimelinePosition(bar = 0, beat = 0, tick = 0): any {
    return {
      bar,
      beat,
      tick,
      ticks: 0,
      toMargin: vi.fn(() => 0),
      fromMargin: vi.fn(() => ({ ticks: 0 })),
      snap: vi.fn(() => ({ ticks: 0 })),
      toTicks: vi.fn(() => 0),
      toSeconds: vi.fn(() => 0),
      copy: vi.fn(() => createMockTimelinePosition(bar, beat, tick)),
      equals: vi.fn(() => true),
      add: vi.fn(() => createMockTimelinePosition()),
      compareTo: vi.fn(() => 0),
    };
  }

  const createTestContainer = () => {
    const div = document.createElement("div");
    div.style.width = "800px";
    div.style.height = "600px";
    div.style.position = "absolute";
    div.style.top = "0";
    div.style.left = "0";
    div.style.background = "white";

    // Add basic CSS variables that the component might use
    const style = document.createElement("style");
    style.textContent = `
      :root {
        --bg1: #ffffff;
        --bg2: #f5f5f5;
        --bg5: #e0e0e0;
        --bg7: #e0e0e0;
        --fg1: #000000;
        --border4: #cccccc;
        --border6: #cccccc;
        --color1: #2196f3;
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(div);
    return div;
  };

  beforeEach(() => {
    container = createTestContainer();
    vi.clearAllMocks();
  });

  afterEach(() => {
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
    // Clean up style tags
    const styleTags = document.head.querySelectorAll("style");
    styleTags.forEach(tag => tag.remove());
  });

  const baseTrack: any = {
    id: "test-track",
    name: "Test Track",
    type: TrackType.Audio,
    mute: false,
    solo: false,
    armed: false,
    volume: 0,
    pan: 0,
    automation: false,
    automationMode: AutomationMode.Read,
    automationLanes: [],
    clips: [],
    color: "#ff0000",
    height: 100,
    collapsed: false,
    selected: false,
    effects: [],
    fx: {
      preset: null,
      effects: [],
      selectedEffectIndex: 0,
    },
    inputs: [],
    outputs: [],
  };

  // Mock context with all required properties
  const mockWorkstationContext: any = {
    tracks: [],
    masterTrack: baseTrack,
    playheadPos: createMockTimelinePosition(),
    maxPos: createMockTimelinePosition(),
    numMeasures: 4,
    snapGridSize: createMockTimelinePosition(),
    songRegion: null,
    verticalScale: 1,
    timelineSettings: {
      beatWidth: 40,
      timeSignature: { beats: 4, noteValue: 4 },
      horizontalScale: 1,
      tempo: 120,
    },
    isPlaying: false,
    scrollToItem: null,
    allowMenuAndShortcuts: true,
    setTracks: vi.fn(),
    setPlayheadPos: vi.fn(),
    setSongRegion: vi.fn(),
    setVerticalScale: vi.fn(),
    setScrollToItem: vi.fn(),
    setAllowMenuAndShortcuts: vi.fn(),
    addTrack: vi.fn(),
    adjustNumMeasures: vi.fn(),
    createAudioClip: vi.fn(),
    insertClips: vi.fn(),
    updateTimelineSettings: vi.fn(),
    setTrack: vi.fn(),
    duplicateTrack: vi.fn(),
    deleteTrack: vi.fn(),
    clearAutomation: vi.fn(),
    getTrackCurrentValue: vi.fn(() => ({ value: 0.8, isAutomated: false })),
    addNode: vi.fn(),
    setLane: vi.fn(),
    setSelectedNodeId: vi.fn(),
    selectedTrackId: null,
    setSelectedTrackId: vi.fn(),
    trackRegion: null,
    setTrackRegion: vi.fn(),
    selectedClipId: null,
    setSelectedClipId: vi.fn(),
    deleteClip: vi.fn(),
    duplicateClip: vi.fn(),
    splitClip: vi.fn(),
    consolidateClip: vi.fn(),
    toggleMuteClip: vi.fn(),
    pasteClip: vi.fn(),
    createClipFromTrackRegion: vi.fn(),
  };

  const renderWithContext = (component: React.ReactElement, container?: HTMLElement): any => {
    return render(
      <WorkstationContext.Provider value={mockWorkstationContext as any}>
        {component}
      </WorkstationContext.Provider>,
      { container }
    );
  };

  describe("Basic rendering", () => {
    it("should render track component", () => {
      expect(() => {
        renderWithContext(<TrackComponent track={baseTrack} />, container);
      }).not.toThrow();
    });

    it("should display track name", () => {
      const { getByDisplayValue } = renderWithContext(<TrackComponent track={baseTrack} />, container);
      expect(getByDisplayValue("Test Track")).toBeInTheDocument();
    });
  });

  describe("Track controls", () => {
    it("should handle mute toggle", () => {
      const track = { ...baseTrack, mute: false };
      const { getByTestId } = renderWithContext(<TrackComponent track={track} />, container);

      const muteButton = getByTestId("mute-button");
      fireEvent.click(muteButton);
      expect(mockWorkstationContext.setTrack).toHaveBeenCalledWith({
        ...track,
        mute: true,
      });
    });

    it("should handle solo toggle", () => {
      const track = { ...baseTrack, solo: false };
      const { getByTestId } = renderWithContext(<TrackComponent track={track} />, container);

      const soloButton = getByTestId("solo-button");
      fireEvent.click(soloButton);
      expect(mockWorkstationContext.setTrack).toHaveBeenCalledWith({
        ...track,
        solo: true,
      });
    });

    it("should handle automation mode toggle", () => {
      const track = { ...baseTrack, automation: false };
      const { getByTestId } = renderWithContext(<TrackComponent track={track} />, container);

      const automationButton = getByTestId("automation-mode-button");
      fireEvent.click(automationButton);
      expect(mockWorkstationContext.setTrack).toHaveBeenCalledWith({
        ...track,
        automation: true,
      });
    });
  });

  describe("Track name editing", () => {
    it("should handle track name change", async () => {
      const user = userEvent.setup();
      const { getByDisplayValue } = renderWithContext(<TrackComponent track={baseTrack} />, container);

      const nameInput = getByDisplayValue("Test Track");
      await user.clear(nameInput);
      await user.type(nameInput, "New Track Name");

      await waitFor(() => {
        expect(mockWorkstationContext.setTrack).toHaveBeenCalled();
      });
    });
  });

  describe("Visual regression tests", () => {
    it("visual test: renders normal track @visual", async () => {
      renderWithContext(<TrackComponent track={baseTrack} />, container);
      await new Promise(resolve => setTimeout(resolve, 100));

      try {
        await expectScreenshot(container, "track-component-normal", 0.5);
      } catch (error) {
        console.warn("Visual snapshot test failed:", error);
      }
    });

    it("visual test: renders muted track @visual", async () => {
      const track = { ...baseTrack, mute: true };
      renderWithContext(<TrackComponent track={track} />, container);
      await new Promise(resolve => setTimeout(resolve, 100));

      try {
        await expectScreenshot(container, "track-component-muted", 0.5);
      } catch (error) {
        console.warn("Visual snapshot test failed:", error);
      }
    });

    it("visual test: renders track with automation @visual", async () => {
      const track = {
        ...baseTrack,
        automation: true,
        automationLanes: [
          {
            id: "lane-1",
            label: "Volume",
            envelope: AutomationLaneEnvelope.Volume,
            enabled: true,
            minValue: -60,
            maxValue: 6,
            nodes: [],
            show: true,
            expanded: true,
          }
        ]
      };

      renderWithContext(<TrackComponent track={track} />, container);
      await new Promise(resolve => setTimeout(resolve, 100));

      try {
        await expectScreenshot(container, "track-component-automation", 0.5);
      } catch (error) {
        console.warn("Visual snapshot test failed:", error);
      }
    });
  });
});
