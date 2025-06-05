// Audio-related type definitions
export enum AudioAnalysisType {
  Spectral = "spectral",
  Waveform = "waveform",
  Features = "features",
}

export interface AudioAnalysisResults {
  waveform?: number[];
  spectrum?: {
    frequencies: number[];
    magnitudes: number[];
  };
  spectrogram?: {
    data: number[][];
    timeAxis: number[];
    frequencyAxis: number[];
  };
}

export interface WorkstationAudioInputFile {
  id: string;
  name: string;
  type: string;
  size: number;
  lastModified: number;
  buffer?: AudioBuffer;
}

export enum SnapGridSizeOption {
  SixteenthBeat = "sixteenth",
  EighthBeat = "eighth",
  QuarterBeat = "quarter",
  HalfBeat = "half",
  Beat = "beat",
  Measure = "measure",
  TwoMeasures = "two_measures",
  FourMeasures = "four_measures",
  EightMeasures = "eight_measures",
}

export interface BaseClipComponentProps {
  clip: any; // Type this properly based on your clip structure
  height: number;
  onChangeLane?: (laneId: string) => void;
  onSetClip?: (clip: any) => void;
  track: any; // Type this properly based on your track structure
}
