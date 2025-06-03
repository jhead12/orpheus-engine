interface AudioSegment {
  id: string;
  audioClipId: string;
  startTime: number;
  endTime: number;
  duration: number;
  transcription?: string;
  confidence?: number;
  features?: AudioFeatures;
  analysis?: AudioAnalysisResult;
}

interface AudioFeatures {
  spectral?: {
    centroid: number[];
    rolloff: number[];
    mfcc: number[][];
  };
  temporal?: {
    zeroCrossingRate: number[];
    rms: number[];
  };
  tonal?: {
    chroma: number[][];
    tonnetz: number[][];
  };
}

interface AudioAnalysisResult {
  type: 'spectral' | 'waveform' | 'features';
  data: Float32Array[] | AudioFeatures;
  metadata?: {
    sampleRate: number;
    channels: number;
    duration: number;
  };
}

interface WaveformLevelsOfDetail {
  ultraLow: Float32Array[];
  low: Float32Array[];
  medium: Float32Array[];
  high: Float32Array[];
}

export type { AudioSegment };