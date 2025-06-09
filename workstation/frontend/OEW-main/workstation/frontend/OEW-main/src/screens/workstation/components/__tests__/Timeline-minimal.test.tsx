/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom";
import React from "react";
import { render } from "@testing-library/react";
import { Timeline } from "../Timeline";
import {
  TimelinePosition,
  TrackType,
  AutomationMode,
} from "@orpheus/types/core";
import { WorkstationContext } from "@orpheus/contexts/WorkstationContext";
import type { WorkstationContextType } from "@orpheus/contexts/WorkstationContext";
import { vi, beforeEach, describe, it, expect } from "vitest";

// Create a proper canvas mock that extends HTMLElement
const createCanvasElement = () => {
  const canvas = document.createElement("canvas");

  // Mock the context
  const ctx = {
    clearRect: vi.fn(),
    fillRect: vi.fn(),
    strokeRect: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    fillText: vi.fn(),
    strokeText: vi.fn(),
    measureText: vi.fn(() => ({ width: 50 })),
    save: vi.fn(),
    restore: vi.fn(),
    translate: vi.fn(),
    scale: vi.fn(),
    setTransform: vi.fn(),
    resetTransform: vi.fn(),
    arc: vi.fn(),
    closePath: vi.fn(),
    clip: vi.fn(),
    drawImage: vi.fn(),
    getImageData: vi.fn(),
    putImageData: vi.fn(),
    setLineDash: vi.fn(),
    getLineDash: vi.fn(() => []),
    fillStyle: "#000",
    strokeStyle: "#000",
    lineWidth: 1,
    font: "12px sans-serif",
  };

  canvas.getContext = vi.fn().mockReturnValue(ctx);
  canvas.width = 800;
  canvas.height = 400;
  canvas.style = {};

  return canvas;
};

// Mock canvas setup
beforeEach(() => {
  const originalCreateElement = document.createElement.bind(document);
  vi.spyOn(document, "createElement").mockImplementation((tagName) => {
    if (tagName === "canvas") {
      return new MockCanvas() as unknown as HTMLCanvasElement;
    }
    return originalCreateElement(tagName);
  });
});

describe("Timeline - toSeconds() method fix", () => {
  it("should verify position.toSeconds() method exists and works", () => {
    const position = new TimelinePosition(2, 1, 480);
    expect(typeof position.toSeconds).toBe("function");
    expect(position.toSeconds()).toBeGreaterThan(0);
  });

  it("should render Timeline component without toSeconds() error", async () => {
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
        type: TrackType.Audio,
        clips: [],
        volume: { value: 1, isAutomated: false },
        mute: false,
        solo: false,
        pan: { value: 0, isAutomated: false },
        automationMode: AutomationMode.Off,
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

    const { container } = render(
      <WorkstationContext.Provider value={mockContext}>
        <Timeline
          currentPosition={new TimelinePosition(1, 0, 0)}
          width={800}
          height={400}
        />
      </WorkstationContext.Provider>
    );

    const canvas = container.querySelector("canvas");
    expect(canvas).toBeTruthy();
    expect(canvas?.tagName.toLowerCase()).toBe("canvas");
  });
});
