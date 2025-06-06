import React from "react";
import { render, fireEvent, screen } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { WorkstationContext } from "../../../contexts";
import { AnalysisContext } from "../../../contexts/AnalysisContext";
import Lane from "../Lane";
import type { Track } from "../../../types";
import { TrackType, AutomationMode } from "../../../types";

// Mock the electron API
jest.mock("../../../services/electron/utils", () => ({
  electronAPI: {
    ipcRenderer: {
      invoke: jest.fn(),
    },
  },
  openContextMenu: jest.fn(),
}));

// Add audio mocks at the top of the file
class MockAudioBuffer {
  length: number;
  numberOfChannels: number;
  sampleRate: number;
  duration: number;

  constructor(options: {
    length: number;
    numberOfChannels: number;
    sampleRate: number;
  }) {
    this.length = options.length;
    this.numberOfChannels = options.numberOfChannels;
    this.sampleRate = options.sampleRate;
    this.duration = this.length / this.sampleRate;
  }

  getChannelData(channel: number) {
    return new Float32Array(this.length);
  }
}

class MockAudioContext {
  destination = {};
  sampleRate = 44100;

  createBuffer(
    channels: number,
    length: number,
    sampleRate: number
  ): AudioBuffer {
    return new MockAudioBuffer({
      numberOfChannels: channels,
      length,
      sampleRate,
    });
  }

  createBufferSource() {
    return {
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      buffer: null,
    };
  }
}

// Mock the global AudioContext/AudioBuffer
window.AudioContext = MockAudioContext as any;
window.AudioBuffer = MockAudioBuffer as any;

describe("Lane Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderLane = (props = {}) => {
    return render(
      <WorkstationContext.Provider value={mockWorkstationContext}>
        <AnalysisContext.Provider value={mockAnalysisContext}>
          <Lane dragDataTarget={null} track={mockTrack} {...props} />
        </AnalysisContext.Provider>
      </WorkstationContext.Provider>
    );
  };

  describe("Audio Analysis", () => {
    it("shows audio analysis panel when clip is selected", async () => {
      const clipWithAnalysis = {
        id: "clip-1",
        audio: {
          buffer: new MockAudioBuffer({
            length: 44100,
            numberOfChannels: 2,
            sampleRate: 44100,
          }),
          waveform: [],
        },
        start: { toMargin: () => 0 },
        end: { toMargin: () => 100 },
      };

      const trackWithClip = {
        ...mockTrack,
        clips: [clipWithAnalysis],
      };

      const { container } = renderLane({ track: trackWithClip });

      // Find and click the clip
      const clip = container.querySelector(
        `[data-clip-id="${clipWithAnalysis.id}"]`
      );
      expect(clip).toBeTruthy();
      fireEvent.click(clip!);

      // Wait for analysis panel to appear
      await vi.waitFor(() => {
        expect(screen.getByTestId("audio-analysis-panel")).toBeInTheDocument();
      });
    });

    it("switches between different analysis types", async () => {
      const audioCtx = new MockAudioContext();
      const audioBuffer = audioCtx.createBuffer(2, 44100, 44100);

      const clipWithAnalysis = {
        id: "clip-1",
        audio: {
          buffer: audioBuffer,
          waveform: new Array(100).fill(0),
        },
        start: { toMargin: () => 0 },
        end: { toMargin: () => 100 },
      };

      const trackWithClip = {
        ...mockTrack,
        clips: [clipWithAnalysis],
      };

      renderLane({ track: trackWithClip });

      // Select the clip
      const clip = screen.getByTestId(`clip-${clipWithAnalysis.id}`);
      fireEvent.click(clip);

      // Switch analysis types
      await vi.waitFor(async () => {
        const spectralTab = screen.getByRole("tab", { name: /spectral/i });
        fireEvent.click(spectralTab);
        await vi.waitFor(() => {
          expect(screen.getByTestId("spectral-analysis")).toBeInTheDocument();
        });

        const waveformTab = screen.getByRole("tab", { name: /waveform/i });
        fireEvent.click(waveformTab);
        await vi.waitFor(() => {
          expect(screen.getByTestId("waveform-analysis")).toBeInTheDocument();
        });
      });
    });
  });

  // ...other test sections remain unchanged...
});
