import { ipcRenderer } from "electron";

export interface PythonAnalysisParams {
  command: string;
  audioData: Float32Array;
  parameters: {
    resolution: number;
    windowSize: number;
    melBands?: number;
    hopLength?: number;
    fmin?: number;
    fmax?: number;
  };
}

export interface PythonAnalysisResult {
  tempo_bpm: number;
  loudness_lufs: number;
  peak_db: number;
  rms_db: number;
  waveform_image: string;
  spectrogram_image: string;
  time_signature: {
    numerator: number;
    denominator: number;
  } | null;
  rawData?: ArrayBuffer;
  features?: {
    mfcc?: number[][];
    spectralContrast?: number[];
    chromagram?: number[][];
  };
}

export async function invokePythonAnalysis(
  params: PythonAnalysisParams
): Promise<PythonAnalysisResult> {
  try {
    const result = await ipcRenderer.invoke("audio:analyze", params);
    return result as PythonAnalysisResult;
  } catch (error) {
    console.error("Python analysis failed:", error);
    throw error;
  }
}
