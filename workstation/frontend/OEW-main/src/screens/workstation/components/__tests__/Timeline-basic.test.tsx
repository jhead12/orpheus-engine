import "@testing-library/jest-dom";
import React from "react";
import { render } from "@testing-library/react";
import { Timeline } from "../Timeline";
import { TimelinePosition } from "../../../../types/core";
import { WorkstationContext } from "../../../../contexts/WorkstationContext";
import type { WorkstationContextType } from "../../../../contexts/WorkstationContext";
import { vi, beforeEach, describe, it, expect } from "vitest";

// Create a minimal WorkstationContext mock
const mockContext: WorkstationContextType = {
  adjustNumMeasures: vi.fn(),
  allowMenuAndShortcuts: true,
  consolidateClip: vi.fn(),
  deleteClip: vi.fn(),
  duplicateClip: vi.fn(),
  playheadPos: new TimelinePosition(0, 0, 0),
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
    beatWidth: 50,
    timeSignature: { beats: 4, noteValue: 4 },
    horizontalScale: 1,
  },
  toggleMuteClip: vi.fn(),
  tracks: [],
  verticalScale: 1,
  addTrack: vi.fn(),
  createAudioClip: vi.fn().mockResolvedValue(null),
  insertClips: vi.fn(),
  masterTrack: {
    id: "master",
    name: "Master",
    type: "audio" as const,
    clips: [],
    volume: { value: 1, isAutomated: false },
    muted: false,
    solo: false,
    pan: { value: 0, isAutomated: false },
    automationMode: "off" as const,
  },
  selectTrack: vi.fn(),
  selectedTrackId: null,
  setSelectedTrackId: vi.fn(),
  updateTrack: vi.fn(),
  deleteTrack: vi.fn(),
  exportProject: vi.fn().mockResolvedValue(undefined),
  importProject: vi.fn().mockResolvedValue(undefined),
  newProject: vi.fn(),
  openProject: vi.fn().mockResolvedValue(undefined),
  projectFile: null,
  projectName: "Untitled",
  saveProject: vi.fn().mockResolvedValue(undefined),
  saveProjectAs: vi.fn().mockResolvedValue(undefined),
  setProjectName: vi.fn(),
  isPlaying: false,
  isRecording: false,
  pause: vi.fn(),
  play: vi.fn(),
  record: vi.fn(),
  stop: vi.fn(),
  tempo: 120,
  setTempo: vi.fn(),
  metronomeEnabled: false,
  setMetronomeEnabled: vi.fn(),
  recordingEnabled: false,
  setRecordingEnabled: vi.fn(),
  maxPos: new TimelinePosition(16, 0, 0),
  numMeasures: 16,
  setPlayheadPos: vi.fn(),
  setTracks: vi.fn(),
  setMaxPos: vi.fn(),
  setNumMeasures: vi.fn(),
  setMaxPosFromClips: vi.fn(),
};

describe("Timeline tests", () => {
  beforeEach(() => {
    // Create a basic canvas element that supports setAttribute
    const canvas = Object.assign(document.createElement("canvas"), {
      setAttribute: vi.fn(),
      getContext: vi.fn(() => ({
        clearRect: vi.fn(),
        fillRect: vi.fn(),
        strokeRect: vi.fn(),
        beginPath: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        stroke: vi.fn(),
        fillText: vi.fn(),
        measureText: vi.fn(() => ({ width: 50 })),
        save: vi.fn(),
        restore: vi.fn(),
        translate: vi.fn(),
        scale: vi.fn(),
        setTransform: vi.fn(),
      })),
    });

    // Mock document.createElement for canvas
    vi.spyOn(document, "createElement").mockImplementation((tag) => {
      if (tag === "canvas") return canvas;
      return document.createElement(tag);
    });
  });

  it("should verify TimelinePosition.toSeconds exists", () => {
    const pos = new TimelinePosition(1, 2, 240);
    expect(typeof pos.toSeconds).toBe("function");
    expect(pos.toSeconds()).toBeGreaterThan(0);
  });

  it("should render Timeline without errors", () => {
    const pos = new TimelinePosition(1, 0, 0);
    const { container } = render(
      <WorkstationContext.Provider value={mockContext}>
        <Timeline currentPosition={pos} width={800} height={400} />
      </WorkstationContext.Provider>
    );

    const canvas = container.querySelector("canvas");
    expect(canvas).toBeInTheDocument();
  });
});
