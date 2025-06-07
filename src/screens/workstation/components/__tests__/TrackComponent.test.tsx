import { describe, it, beforeEach, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TrackComponent } from "../TrackComponent";
import { expectScreenshot } from "@orpheus/test/helpers";
import { WorkstationContext } from "@orpheus/contexts/WorkstationContext";
import { TimelinePosition } from "../../../../types";
import type { Track } from "../../../../types";

// Update the mock context with all required properties
const defaultContext = {
  tracks: [] as Track[],
  masterTrack: { id: "master-1", name: "Master" } as Track,
  playheadPos: new TimelinePosition(0, 0, 0),
  maxPos: new TimelinePosition(4, 0, 0),
  numMeasures: 4,
  snapGridSize: 240,
  songRegion: null,
  verticalScale: 1,
  timelineSettings: {
    beatWidth: 40,
    timeSignature: { beats: 4, noteValue: 4 },
    horizontalScale: 1,
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
  consolidateClip: vi.fn(),
  deleteClip: vi.fn(),
  duplicateClip: vi.fn(),
  getClipsForTrack: () => [],
  insertTrack: vi.fn(),
  moveTrack: vi.fn(),
  pasteClip: vi.fn(),
  playheadTimeSeconds: 0,
  recording: false,
  setRecording: vi.fn(),
  splitClip: vi.fn(),
  workstationHeight: 800,
  workstationWidth: 1200,
  selectedClipId: null,
  setSelectedClipId: vi.fn(),
  setTrackRegion: vi.fn(),
  toggleMuteClip: vi.fn(),
  setTrack: vi.fn(),
  getTrackCurrentValue: () => ({ value: 0.8, isAutomated: false }),
  deleteTrack: vi.fn(),
  duplicateTrack: vi.fn(),
  showMaster: true,
  selectedTrackId: null,
  setSelectedTrackId: vi.fn(),
};

const createContainer = () => {
  const container = document.createElement("div");
  container.style.cssText = `
    width: 800px;
    height: 200px;
    background: #1e1e1e;
    position: relative;
    overflow: hidden;
    color: white;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    display: flex;
    flex-direction: column;
    padding: 16px;
    box-sizing: border-box;
  `;
  // Add some global styles that might be needed
  const style = document.createElement("style");
  style.textContent = `
    .MuiSvgIcon-root { font-size: 24px; }
    .MuiIconButton-root { padding: 8px; }
  `;
  document.head.appendChild(style);
  document.body.appendChild(container);
  return container;
};

const renderWithContext = (ui: React.ReactNode, container?: HTMLElement) => {
  return render(
    <WorkstationContext.Provider value={defaultContext}>
      {ui}
    </WorkstationContext.Provider>,
    container ? { container } : undefined
  );
};

describe("TrackComponent Visual Tests", () => {
  it("visual test: renders normal track @visual", async () => {
    const container = createContainer();
    const track = {
      id: "track-1",
      name: "Test Track",
      color: "#ff0000",
      volume: 0.8,
      pan: 0,
      automation: false,
      mute: false,
      solo: false,
      automationLanes: [],
    };

    renderWithContext(<TrackComponent track={track} />, container);

    // Wait for initial render and any animations
    await new Promise((resolve) => setTimeout(resolve, 500));
    // Wait for any styled-components to be applied
    await new Promise((resolve) => setTimeout(resolve, 500));
    // Wait for any dynamic content (meters, etc)
    await new Promise((resolve) => setTimeout(resolve, 500));

    await expectScreenshot(container, "track-normal");
    document.body.removeChild(container);
  });

  it("visual test: renders muted track @visual", async () => {
    const container = createContainer();
    renderWithContext(
      <TrackComponent
        track={{
          id: "track-1",
          name: "Test Track",
          color: "#ff0000",
          volume: 0.8,
          pan: 0,
          automation: false,
          mute: true,
          solo: false,
        }}
      />,
      container
    );

    await new Promise((resolve) => setTimeout(resolve, 1000));
    await expectScreenshot(container, "track-muted");
    document.body.removeChild(container);
  });
});

describe("TrackComponent Recording Features", () => {
  it("should handle recording arm state", () => {
    const track = {
      id: "track-1",
      name: "Audio Track",
      type: "audio",
      armed: false,
      color: "#ff0000",
      volume: 0.8,
      pan: 0,
      automation: false,
      mute: false,
      solo: false,
    };

    const { getByTestId } = renderWithContext(<TrackComponent track={track} />);

    const armButton = getByTestId("track-arm-button");
    expect(armButton).toBeInTheDocument();
    userEvent.click(armButton);
    expect(defaultContext.setTrack).toHaveBeenCalledWith(
      expect.objectContaining({ armed: true })
    );
  });

  it("visual test: renders armed track @visual", async () => {
    const container = createContainer();
    const track = {
      id: "track-1",
      name: "Audio Track",
      type: "audio",
      armed: true,
      color: "#ff0000",
      volume: 0.8,
      pan: 0,
      automation: false,
      mute: false,
      solo: false,
    };

    renderWithContext(<TrackComponent track={track} />, container);
    await new Promise((resolve) => setTimeout(resolve, 500));
    await expectScreenshot(container, "track-armed");
    document.body.removeChild(container);
  });
});

describe("TrackComponent FX Features", () => {
  it("should render FX chain", () => {
    const track = {
      id: "track-1",
      name: "Track with FX",
      type: "audio",
      effects: [
        {
          id: "fx-1",
          type: "reverb",
          enabled: true,
          parameters: { mix: 0.5 },
        },
      ],
      color: "#ff0000",
      volume: 0.8,
      pan: 0,
      automation: false,
      mute: false,
      solo: false,
    };

    const { getByTestId } = renderWithContext(<TrackComponent track={track} />);

    const fxChain = getByTestId("fx-chain");
    expect(fxChain).toBeInTheDocument();
    expect(fxChain).toHaveTextContent("reverb");
  });

  it("visual test: renders track with fx chain @visual", async () => {
    const container = createContainer();
    const track = {
      id: "track-1",
      name: "Track with FX",
      type: "audio",
      effects: [
        {
          id: "fx-1",
          type: "reverb",
          enabled: true,
          parameters: { mix: 0.5 },
        },
      ],
      color: "#ff0000",
      volume: 0.8,
      pan: 0,
      automation: false,
      mute: false,
      solo: false,
    };

    renderWithContext(<TrackComponent track={track} />, container);
    await new Promise((resolve) => setTimeout(resolve, 500));
    await expectScreenshot(container, "track-with-fx");
    document.body.removeChild(container);
  });
});

describe("TrackComponent I/O Features", () => {
  it("should handle input/output routing", () => {
    const track = {
      id: "track-1",
      name: "Audio Track",
      type: "audio",
      inputs: [{ id: "input-1", name: "Audio In 1" }],
      outputs: [{ id: "output-1", name: "Main Out" }],
      color: "#ff0000",
      volume: 0.8,
      pan: 0,
      automation: false,
      mute: false,
      solo: false,
    };

    const { getByTestId } = renderWithContext(<TrackComponent track={track} />);

    const inputSelect = getByTestId("track-input-select");
    const outputSelect = getByTestId("track-output-select");

    expect(inputSelect).toBeInTheDocument();
    expect(outputSelect).toBeInTheDocument();
    expect(inputSelect).toHaveTextContent("Audio In 1");
    expect(outputSelect).toHaveTextContent("Main Out");
  });

  it("visual test: renders track with i/o routing @visual", async () => {
    const container = createContainer();
    const track = {
      id: "track-1",
      name: "Audio Track",
      type: "audio",
      inputs: [{ id: "input-1", name: "Audio In 1" }],
      outputs: [{ id: "output-1", name: "Main Out" }],
      color: "#ff0000",
      volume: 0.8,
      pan: 0,
      automation: false,
      mute: false,
      solo: false,
    };

    renderWithContext(<TrackComponent track={track} />, container);
    await new Promise((resolve) => setTimeout(resolve, 500));
    await expectScreenshot(container, "track-with-io");
    document.body.removeChild(container);
  });
});
