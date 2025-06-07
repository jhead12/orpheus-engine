import { vi } from "vitest";

// Setup all mocks before any imports
// Mock volume utility functions
vi.mock("../../../../services/utils/utils", () => ({
  volumeToNormalized: vi.fn().mockImplementation((volume) => {
    if (volume <= -60) return 0;
    if (volume >= 0) return 1;
    return 0.8; // Fixed mock value for testing
  }),
  normalizedToVolume: vi.fn().mockImplementation((normalized) => {
    if (normalized <= 0) return -60;
    if (normalized >= 1) return 0;
    return -20; // Fixed mock value for testing
  }),
  formatVolume: vi.fn().mockImplementation((volume) => {
    if (volume <= -60) return "-∞ dB";
    return `${volume.toFixed(1)} dB`;
  }),
  getLaneColor: vi.fn().mockReturnValue("#808080"),
  BASE_HEIGHT: 100,
}));

vi.mock("../../../../types/core", () => {
  return {
    TimelinePosition: vi.fn().mockImplementation(() => ({
      ticks: 0,
      compareTo: vi.fn().mockReturnValue(0),
      toMargin: vi.fn().mockReturnValue(0),
      copy: vi.fn().mockReturnThis(),
      equals: vi.fn().mockReturnValue(true),
      diff: vi.fn().mockReturnThis(),
    })),
    TrackType: { Audio: "audio" },
    AutomationMode: { Off: "off" },
    AutomationLaneEnvelope: { Volume: "volume" },
    ContextMenuType: { Track: 0, Automation: 1 }
  };
});

// Factory function to create mock TimelinePosition instances for tests
function createMockTimelinePosition() {
  return {
    ticks: 0,
    compareTo: vi.fn().mockReturnValue(0),
    toMargin: vi.fn().mockReturnValue(0),
    copy: vi.fn().mockReturnThis(),
    equals: vi.fn().mockReturnValue(true),
    diff: vi.fn().mockReturnThis(),
  };
}

// Normal imports after mocks
import { describe, expect, beforeEach, afterEach } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import TrackComponent from "../TrackComponent";
import { WorkstationContext } from "../../../../contexts/WorkstationContext";
import { expectScreenshot } from "../../../../test/helpers/screenshot";

// Import from mocked module - using direct path instead of @orpheus alias
import {
  AutomationMode,
  AutomationLaneEnvelope,
  TrackType,
} from "../../../../types/core";

// Create a container for visual tests
const createTestContainer = () => {
  // Add CSS variables needed for styling
  const rootStyle = document.createElement("style");
  rootStyle.textContent = `
    :root {
      --bg1: #e1e1e1;
      --bg2: #eee;
      --bg3: #e2e2e2;
      --bg4: #dfdfdf;
      --bg5: var(--color1-muted);
      --bg6: #f7f7f7;
      --border1: #777;
      --border2: #0004;
      --border3: #666;
      --border4: #0006;
      --border5: #0009;
      --border6: #777;
      --color1: #f06;
      --fg1: #000;
    }
  `;
  document.head.appendChild(rootStyle);

  const container = document.createElement("div");
  container.style.cssText = `
    width: 800px;
    height: 200px;
    background: var(--bg1);
    position: relative;
    overflow: hidden;
    color: var(--fg1);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    display: flex;
    flex-direction: column;
    padding: 16px;
    box-sizing: border-box;
  `;

  const style = document.createElement("style");
  style.textContent = `
    .MuiIconButton-root { padding: 8px; }
    .MuiSvgIcon-root { font-size: 24px; }
    .track-btn { margin: 0 4px; }
    .track-controls { display: flex; align-items: center; }
    .dnr-container { position: relative; }
  `;
  document.head.appendChild(style);
  document.body.appendChild(container);
  return container;
};

// Container setup for tests

const baseTrack = {
  id: "test-track",
  name: "Test Track",
  type: TrackType.Audio,
  mute: false,
  solo: false,
  armed: false,
  volume: 0,
  pan: 0,
  automation: false,
  automationMode: AutomationMode.Off,
  automationLanes: [],
  clips: [],
  color: "#ff0000",
  effects: [],
  fx: {
    preset: null,
    effects: [],
    selectedEffectIndex: 0,
  },
};

// Mock context
const mockWorkstationContext = {
  adjustNumMeasures: vi.fn(),
  allowMenuAndShortcuts: true,
  consolidateClip: vi.fn(),
  deleteClip: vi.fn(),
  deleteTrack: vi.fn(),
  duplicateClip: vi.fn(),
  duplicateTrack: vi.fn(),
  getTrackCurrentValue: vi.fn(() => ({ value: 0.8, isAutomated: false })),
  insertClips: vi.fn(),
  masterTrack: baseTrack,
  maxPos: createMockTimelinePosition(),
  numMeasures: 4,
  playheadPos: createMockTimelinePosition(),
  scrollToItem: null,
  selectedClipId: null,
  selectedTrackId: null,
  setAllowMenuAndShortcuts: vi.fn(),
  setScrollToItem: vi.fn(),
  setSelectedClipId: vi.fn(),
  setSelectedTrackId: vi.fn(),
  setTrack: vi.fn(),
  setSongRegion: vi.fn(),
  setTrackRegion: vi.fn(),
  showMaster: true,
  snapGridSize: createMockTimelinePosition(),
  songRegion: null,
  splitClip: vi.fn(),
  timelineSettings: {
    beatWidth: 40,
    timeSignature: { beats: 4, noteValue: 4 },
    horizontalScale: 1,
    tempo: 120,
  },
  toggleMuteClip: vi.fn(),
  trackRegion: null,
  tracks: [],
  verticalScale: 1,
  // Additional props needed for AutomationLaneTrack
  addNode: vi.fn(),
  setLane: vi.fn(),
  setSelectedNodeId: vi.fn(),
};

// Render helper with context provider
const renderWithContext = (ui: React.ReactNode, container?: HTMLElement) => {
  return render(
    <WorkstationContext.Provider value={mockWorkstationContext}>
      {ui}
    </WorkstationContext.Provider>,
    container ? { container } : undefined
  );
};

describe("TrackComponent Core Functionality", () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = createTestContainer();
    vi.clearAllMocks();
  });

  afterEach(() => {
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
  });

  it("renders track name correctly", () => {
    const { getByDisplayValue } = renderWithContext(
      <TrackComponent track={baseTrack} />
    );
    const nameInput = getByDisplayValue("Test Track");
    expect(nameInput).toBeInTheDocument();
  });

  it("handles track name change", async () => {
    const { getByDisplayValue } = renderWithContext(
      <TrackComponent track={baseTrack} />
    );
    const nameInput = getByDisplayValue("Test Track");
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, "New Track Name");
    fireEvent.blur(nameInput);

    expect(mockWorkstationContext.setTrack).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "New Track Name",
      })
    );
  });

  it("handles mute toggle", () => {
    const { container } = renderWithContext(
      <TrackComponent track={baseTrack} />
    );
    const muteButton = container.querySelector('[data-testid="mute-button"]');
    if (!muteButton) throw new Error("Mute button not found");

    fireEvent.click(muteButton);

    expect(mockWorkstationContext.setTrack).toHaveBeenCalledWith(
      expect.objectContaining({
        mute: true,
      })
    );
  });

  it("handles solo toggle", () => {
    const { container, rerender } = renderWithContext(
      <TrackComponent track={baseTrack} />
    );

    const soloButton = container.querySelector('[data-testid="solo-button"]');
    if (!soloButton) throw new Error("Solo button not found");

    // First click - enable solo
    fireEvent.click(soloButton);

    expect(mockWorkstationContext.setTrack).toHaveBeenCalledWith(
      expect.objectContaining({
        solo: true,
      })
    );

    // Simulate the track state update
    const updatedTrack = { ...baseTrack, solo: true };
    rerender(
      <WorkstationContext.Provider value={mockWorkstationContext}>
        <TrackComponent track={updatedTrack} />
      </WorkstationContext.Provider>
    );

    // Second click - disable solo
    fireEvent.click(soloButton);

    expect(mockWorkstationContext.setTrack).toHaveBeenCalledWith(
      expect.objectContaining({
        solo: false,
      })
    );
  });

  it("handles automation controls", () => {
    const trackWithAutomation = {
      ...baseTrack,
      automation: true,
      automationLanes: [
        {
          id: "volume-lane",
          envelope: AutomationLaneEnvelope.Volume,
          enabled: true,
          expanded: false,
          label: "Volume",
          show: true,
          minValue: -60,
          maxValue: 6,
          nodes: [],
        },
      ],
    };

    const { getByText } = renderWithContext(
      <TrackComponent track={trackWithAutomation} />
    );
    expect(getByText("OFF")).toBeInTheDocument();
  });
});

// Visual Tests
describe("TrackComponent Visual Tests", () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = createTestContainer();
  });

  afterEach(() => {
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
  });

  it("visual test: renders normal track @visual", async () => {
    const track = { ...baseTrack };
    renderWithContext(<TrackComponent track={track} />, container);

    // Force a layout recalculation
    container.getBoundingClientRect();

    // Wait for styles and animations
    await new Promise((resolve) => setTimeout(resolve, 1000));

    await expectScreenshot(container, "track-normal");
  });

  it("visual test: renders muted track @visual", async () => {
    const track = { ...baseTrack, mute: true };
    renderWithContext(<TrackComponent track={track} />, container);

    await new Promise((resolve) => setTimeout(resolve, 1000));
    await expectScreenshot(container, "track-muted");
  });

  it("visual test: renders armed track @visual", async () => {
    const track = { ...baseTrack, armed: true };
    renderWithContext(<TrackComponent track={track} />, container);

    await new Promise((resolve) => setTimeout(resolve, 1000));
    await expectScreenshot(container, "track-armed");
  });

  it("visual test: renders track with FX chain @visual", async () => {
    const track = {
      ...baseTrack,
      effects: [
        {
          id: "fx-1",
          name: "Test Effect",
          type: "juce" as const,
          enabled: true,
          parameters: { mix: 0.5 },
        },
      ],
      fx: {
        preset: null,
        effects: [
          {
            id: "fx-1",
            name: "Test Effect",
            type: "juce" as const,
            enabled: true,
            parameters: { mix: 0.5 },
          },
        ],
        selectedEffectIndex: 0,
      },
    };

    renderWithContext(<TrackComponent track={track} />, container);
    await new Promise((resolve) => setTimeout(resolve, 500));
    await expectScreenshot(container, "track-with-fx");
  });
});
