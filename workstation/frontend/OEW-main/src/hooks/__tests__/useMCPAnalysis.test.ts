import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { useMCPAnalysis } from "../useMCPAnalysis";
import { AudioAnalysisType } from "../../types/audio";

describe("useMCPAnalysis", () => {
  let mockAudioBuffer: AudioBuffer;

  beforeEach(() => {
    // Create a mock AudioBuffer
    mockAudioBuffer = {
      length: 1000,
      duration: 1,
      sampleRate: 44100,
      numberOfChannels: 2,
      getChannelData: vi.fn().mockReturnValue(new Float32Array(1000)),
    } as unknown as AudioBuffer;
  });

  // CREATE test - verifies initial analysis with new audio buffer
  it("should create new analysis results when provided with audio buffer", async () => {
    const options = {
      type: AudioAnalysisType.Spectral,
      resolution: 1024,
    };

    const { result } = renderHook(() =>
      useMCPAnalysis(mockAudioBuffer, options)
    );

    // Wait for the analysis to complete
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.results).not.toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.results?.spectralData).toBeDefined();
    expect(result.current.results?.waveformData).toHaveLength(
      mockAudioBuffer.length
    );
  });

  // READ test - verifies null state handling
  it("should handle null audio buffer correctly", () => {
    const options = {
      type: AudioAnalysisType.Spectral,
      resolution: 1024,
    };

    const { result } = renderHook(() => useMCPAnalysis(null, options));

    expect(result.current.results).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  // UPDATE test - verifies analysis update with new options
  it("should update analysis when options change", async () => {
    const initialOptions = {
      type: AudioAnalysisType.Spectral,
      resolution: 1024,
    };

    type HookProps = {
      buffer: AudioBuffer | null;
      opts: typeof initialOptions;
    };

    const { result, rerender } = renderHook<
      ReturnType<typeof useMCPAnalysis>,
      HookProps
    >(({ buffer, opts }) => useMCPAnalysis(buffer, opts), {
      initialProps: { buffer: mockAudioBuffer, opts: initialOptions },
    });

    // Wait for initial analysis
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    const updatedOptions = {
      type: AudioAnalysisType.Spectral,
      resolution: 2048,
    };

    // Rerender with new options
    rerender({ buffer: mockAudioBuffer, opts: updatedOptions });

    // Wait for updated analysis
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.results).not.toBeNull();
    expect(result.current.results?.spectralData?.[0]).toHaveLength(100);
  });

  // DELETE test - verifies cleanup when component unmounts
  it("should clean up results when audio buffer is removed", async () => {
    const options = {
      type: AudioAnalysisType.Spectral,
      resolution: 1024,
    };

    type HookProps = {
      buffer: AudioBuffer | null;
      opts: typeof options;
    };

    const { result, rerender } = renderHook<
      ReturnType<typeof useMCPAnalysis>,
      HookProps
    >(({ buffer, opts }) => useMCPAnalysis(buffer, opts), {
      initialProps: { buffer: mockAudioBuffer, opts: options },
    });

    // Wait for initial analysis
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // Verify initial state
    expect(result.current.results).not.toBeNull();

    // Remove audio buffer
    rerender({ buffer: null as AudioBuffer | null, opts: options });

    // Verify cleanup
    expect(result.current.results).toBeNull();
    expect(result.current.error).toBeNull();
  });

  // Error handling test
  it("should handle analysis errors correctly", async () => {
    const errorBuffer = {
      ...mockAudioBuffer,
      getChannelData: vi.fn().mockImplementation(() => {
        throw new Error("Failed to get channel data");
      }),
    } as unknown as AudioBuffer;

    const options = {
      type: AudioAnalysisType.Spectral,
      resolution: 1024,
    };

    const { result } = renderHook(() => useMCPAnalysis(errorBuffer, options));

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.error).toBe("Analysis failed");
    expect(result.current.results).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  // Feature-specific tests
  it("should include features in analysis results", async () => {
    const options = {
      type: AudioAnalysisType.Features,
      resolution: 1024,
    };

    const { result } = renderHook(() =>
      useMCPAnalysis(mockAudioBuffer, options)
    );

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.results?.features).toBeDefined();
    expect(result.current.results?.features?.mfcc).toBeDefined();
    expect(result.current.results?.features?.mfcc?.length).toBe(13); // Standard MFCC has 13 coefficients
    expect(result.current.results?.features?.spectralContrast).toBeDefined();
    expect(result.current.results?.features?.chromagram).toBeDefined();
  });

  it("should respect window size parameter", async () => {
    const options = {
      type: AudioAnalysisType.Spectral,
      resolution: 1024,
      windowSize: 2048,
    };

    const { result } = renderHook(() =>
      useMCPAnalysis(mockAudioBuffer, options)
    );

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.results).not.toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("should handle waveform analysis type", async () => {
    const options = {
      type: AudioAnalysisType.Waveform,
      resolution: 1024,
    };

    const { result } = renderHook(() =>
      useMCPAnalysis(mockAudioBuffer, options)
    );

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.results).not.toBeNull();
    expect(result.current.results?.waveformData).toBeDefined();
    expect(result.current.results?.waveformData).toHaveLength(
      mockAudioBuffer.length
    );
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });
});
