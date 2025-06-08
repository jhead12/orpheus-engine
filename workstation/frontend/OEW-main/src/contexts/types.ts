/**
 * Shared type definitions for contexts to ensure consistency
 */
import { AudioAnalysisType, Clip } from "../types";

export interface AudioAnalysisResults {
  spectral?: Float32Array[];
  waveform?: Float32Array;
  features?: {
    [key: string]: number | number[];
  };
}

export interface AnalysisContextType {
  analysisType: AudioAnalysisType;
  analysisResults: AudioAnalysisResults | null;
  selectedClip: Clip | null;
  setAnalysisType: (type: AudioAnalysisType) => void;
  setSelectedClip: (clip: Clip | null) => void;
  runAudioAnalysis: (
    buffer: AudioBuffer,
    type: AudioAnalysisType
  ) => Promise<AudioAnalysisResults | null>;
}
