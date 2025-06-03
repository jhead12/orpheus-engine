export class AudioService {
  private context: AudioContext;
  private analyserNode: AnalyserNode | null = null;
  private sources: Map<string, AudioBufferSourceNode> = new Map();
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  
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

  async startRecording(): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.recordedChunks = [];
      this.mediaRecorder = new MediaRecorder(stream);
      
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };

      this.mediaRecorder.start();
    } catch (error) {
      throw new Error(`Failed to start recording: ${error}`);
    }
  }

  async stopRecording(): Promise<AudioBuffer | null> {
    if (!this.mediaRecorder) return null;

    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        resolve(null);
        return;
      }

      this.mediaRecorder.onstop = async () => {
        try {
          const blob = new Blob(this.recordedChunks, { type: 'audio/wav' });
          const arrayBuffer = await blob.arrayBuffer();
          const audioBuffer = await this.context.decodeAudioData(arrayBuffer);
          resolve(audioBuffer);
        } catch (error) {
          reject(error);
        }
      };

      this.mediaRecorder.stop();
      this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
    });
  }

  getWaveformData(): Uint8Array {
    if (!this.analyserNode) return new Uint8Array();
    const dataArray = new Uint8Array(this.analyserNode.fftSize);
    this.analyserNode.getByteTimeDomainData(dataArray);
    return dataArray;
  }
}

export const audioService = new AudioService();
