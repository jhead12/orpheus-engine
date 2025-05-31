export enum AudioAnalysisType {
  Spectral = 'spectral',  
  Waveform = 'waveform',
  Features = 'features'
}

// ...copy rest of types from src/core/types/types.ts...

export class TimelinePosition {
  constructor(
    public bar: number = 0,
    public beat: number = 0,
    public sixteenth: number = 0,
    public tick: number = 0
  ) {}
  
  // ...existing TimelinePosition methods...
}
