export interface AudioAnalysisResults {
  // Waveform data
  waveform: number[];
  
  // Frequency spectrum
  spectrum: {
    frequencies: number[];
    magnitudes: number[];
  };
  
  // Spectrogram data
  spectrogram: {
    data: number[][];
    timeAxis: number[];
    frequencyAxis: number[];
  };
  
  // Audio characteristics
  characteristics: {
    duration: number;
    sampleRate: number;
    channels: number;
    bitDepth?: number;
  };
  
  // AI Analysis features
  features: {
    tempo?: number;
    key?: string;
    genre?: string;
    mood?: string;
    energy?: number;
    danceability?: number;
    valence?: number;
    loudness?: number;
    spectralCentroid?: number;
    spectralRolloff?: number;
    mfcc?: number[];
    zcr?: number;
    rms?: number;
  };
  
  // Quality metrics
  quality: {
    score: number;
    snr?: number;
    thd?: number;
    dynamicRange?: number;
    clipping?: boolean;
    peakLevel?: number;
    loudnessRange?: number;
  };
}

export interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  audioLevel: number;
  sampleRate: number;
  channels: number;
}

export interface MLflowExperiment {
  experimentId: string;
  runId: string;
  artifactUri: string;
  metrics: Record<string, number>;
  parameters: Record<string, string>;
  tags: Record<string, string>;
}
