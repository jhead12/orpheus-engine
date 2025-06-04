export interface AudioData {
  type: 'audio';
  waveform: Float32Array;
  buffer: ArrayBuffer;
}

export interface MIDIData {
  type: 'midi';
  notes: Array<{
    pitch: number;
    velocity: number;
    start: number;
    duration: number;
  }>;
}

export interface AudioFile {
  id: string;
  name: string;
  path: string;
  duration: number;
  size: number;
  type: string;
  createdAt: Date;
}
