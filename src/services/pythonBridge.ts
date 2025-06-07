import { ipcRenderer } from "electron";

// Handle test environment
const getIpcRenderer = (): any => {
  if (typeof window !== 'undefined' && window.electron?.ipcRenderer) {
    return window.electron.ipcRenderer;
  }
  return ipcRenderer;
};

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
    const renderer = getIpcRenderer();
    const result = await renderer.invoke("audio:analyze", params);
    return result as PythonAnalysisResult;
  } catch (error) {
    console.error("Python analysis failed:", error);
    throw error;
  }
}
