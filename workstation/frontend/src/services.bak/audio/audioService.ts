export class AudioService {
  private context: AudioContext;
  private analyserNode: AnalyserNode | null = null;
  private sources: Map<string, AudioBufferSourceNode> = new Map();
  
  constructor() {
    this.context = new AudioContext();
    this.setupAnalyser();
  }
  
  private setupAnalyser() {
    this.analyserNode = this.context.createAnalyser();
    this.analyserNode.fftSize = 2048;
    this.analyserNode.connect(this.context.destination);
  }

  play(buffer: AudioBuffer, options?: { onEnded?: () => void }) {
    const source = this.context.createBufferSource();
    source.buffer = buffer;
    source.connect(this.analyserNode!);
    if (options?.onEnded) {
      source.onended = options.onEnded;
    }
    source.start();
    return source;
  }

  stop() {
    this.sources.forEach(source => source.stop());
    this.sources.clear();
  }

  getWaveformData(): Uint8Array {
    if (!this.analyserNode) return new Uint8Array();
    const dataArray = new Uint8Array(this.analyserNode.fftSize);
    this.analyserNode.getByteTimeDomainData(dataArray);
    return dataArray;
  }
}

export const audioService = new AudioService();
