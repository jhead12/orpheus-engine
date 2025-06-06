import { render, act } from "@testing-library/react";
import { vi } from "vitest";
import { AnalysisContext } from "../AnalysisContext";
import { AudioAnalysisType } from "../../types/audio";
import type { AnalysisContextType } from "../../types/context";

describe("AnalysisContext", () => {
  // Mock implementations
  const mockSetAnalysisType = vi.fn();
  const mockSetSelectedClip = vi.fn();
  const mockRunAudioAnalysis = vi.fn();

  // Default context value
  const defaultValue: AnalysisContextType = {
    analysisType: AudioAnalysisType.Spectral,
    analysisResults: null,
    selectedClip: null,
    setAnalysisType: mockSetAnalysisType,
    setSelectedClip: mockSetSelectedClip,
    runAudioAnalysis: mockRunAudioAnalysis,
  };

  it("provides analysis context to children", () => {
    let contextValue: AnalysisContextType | undefined;

    render(
      <AnalysisContext.Provider value={defaultValue}>
        <AnalysisContext.Consumer>
          {(value) => {
            contextValue = value;
            return null;
          }}
        </AnalysisContext.Consumer>
      </AnalysisContext.Provider>
    );

    expect(contextValue).toBeDefined();
    expect(contextValue.analysisType).toBe(AudioAnalysisType.Spectral);
    expect(contextValue.selectedClip).toBeNull();
    expect(contextValue.analysisResults).toBeNull();
  });

  it("updates analysis type", () => {
    let contextValue: AnalysisContextType | undefined;

    render(
      <AnalysisContext.Provider
        value={{
          ...defaultValue,
          analysisType: AudioAnalysisType.Waveform,
        }}
      >
        <AnalysisContext.Consumer>
          {(value) => {
            contextValue = value;
            return null;
          }}
        </AnalysisContext.Consumer>
      </AnalysisContext.Provider>
    );

    expect(contextValue?.analysisType).toBe(AudioAnalysisType.Waveform);
  });

  it("handles clip selection", () => {
    let contextValue: AnalysisContextType | undefined;
    const audioCtx = new AudioContext();
    const testClip = {
      id: "test-clip",
      audio: {
        audioBuffer: audioCtx.createBuffer(2, 44100, 44100),
      },
    };

    render(
      <AnalysisContext.Provider
        value={{
          ...defaultValue,
          selectedClip: testClip,
        }}
      >
        <AnalysisContext.Consumer>
          {(value) => {
            contextValue = value;
            return null;
          }}
        </AnalysisContext.Consumer>
      </AnalysisContext.Provider>
    );

    expect(contextValue?.selectedClip).toBe(testClip);
  });

  it("runs audio analysis", async () => {
    let contextValue: AnalysisContextType | undefined;
    const audioCtx = new AudioContext();
    const testBuffer = audioCtx.createBuffer(2, 44100, 44100);

    mockRunAudioAnalysis.mockResolvedValue({
      spectrum: {
        frequencies: [1, 2, 3],
        magnitudes: [0.1, 0.2, 0.3],
      },
    });

    render(
      <AnalysisContext.Provider value={defaultValue}>
        <AnalysisContext.Consumer>
          {(value) => {
            contextValue = value;
            return null;
          }}
        </AnalysisContext.Consumer>
      </AnalysisContext.Provider>
    );

    await act(async () => {
      await contextValue?.runAudioAnalysis(
        testBuffer,
        AudioAnalysisType.Spectral
      );
    });

    expect(mockRunAudioAnalysis).toHaveBeenCalledWith(
      testBuffer,
      AudioAnalysisType.Spectral
    );
  });

  it("clears analysis results when clip is deselected", () => {
    let contextValue: AnalysisContextType | undefined;

    render(
      <AnalysisContext.Provider value={defaultValue}>
        <AnalysisContext.Consumer>
          {(value) => {
            contextValue = value;
            return null;
          }}
        </AnalysisContext.Consumer>
      </AnalysisContext.Provider>
    );

    act(() => {
      if (contextValue) {
        contextValue.setSelectedClip(null);
      }
    });

    expect(contextValue?.selectedClip).toBeNull();
    expect(contextValue?.analysisResults).toBeNull();
  });
});
