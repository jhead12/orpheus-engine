// Import environment configuration
import environment from "../config/environment";

// Handle test environment and avoid direct import from electron in renderer process
const getIpcRenderer = (): any => {
  if (typeof window !== 'undefined' && window.electron?.ipcRenderer) {
    return window.electron.ipcRenderer;
  }
  // For tests or contexts where window.electron isn't available
  try {
    // Using dynamic import for Electron to avoid bundling issues
    const electron = require('electron');
    return electron.ipcRenderer;
  } catch (e) {
    console.warn('Electron ipcRenderer not available');
    return null;
  }
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
    // Check if Python bridge is enabled in environment config
    if (!environment.config.PYTHON_BRIDGE_ENABLED) {
      throw new Error("Python bridge is disabled in environment configuration");
    }
    
    const renderer = getIpcRenderer();
    if (!renderer) {
      throw new Error("IPC renderer not available");
    }
    
    const result = await renderer.invoke("audio:analyze", params);
    return result as PythonAnalysisResult;
  } catch (error) {
    console.error("Python analysis failed:", error);
    throw error;
  }
}
