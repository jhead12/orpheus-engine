/**
 * Service for handling audio playback, recording, and processing
 */

import { audioContext } from './utils/audio';

class AudioService {
  private context: AudioContext;
  private analyserNode: AnalyserNode | null = null;
  private sources: Map<string, AudioBufferSourceNode> = new Map();
  private devices: MediaDeviceInfo[] = [];
  private recorder: MediaRecorder | null = null;

  constructor() {
    this.context = audioContext;
    this.setupAnalyser();
  }

  /**
   * Setup audio analyser for visualizations
   */
  private setupAnalyser() {
    this.analyserNode = this.context.createAnalyser();
    this.analyserNode.fftSize = 2048;
    this.analyserNode.connect(this.context.destination);
  }

  /**
   * Play an audio buffer
   */
  play(buffer: AudioBuffer, id: string = Math.random().toString(), options: {
    loop?: boolean;
    start?: number;
    end?: number;
    onEnded?: () => void;
  } = {}): string {
    // Resume audio context if it's suspended
    if (this.context.state === 'suspended') {
      this.context.resume();
    }

    // Stop any existing source with the same ID
    this.stop(id);

    // Create a new source
    const source = this.context.createBufferSource();
    source.buffer = buffer;

    // Apply options
    if (options.loop) {
      source.loop = true;
      if (options.start !== undefined && options.end !== undefined) {
        source.loopStart = options.start;
        source.loopEnd = options.end;
      }
    }

    // Connect to analyser and destination
    source.connect(this.analyserNode!);

    // Set up ended handler
    source.onended = () => {
      this.sources.delete(id);
      if (options.onEnded) {
        options.onEnded();
      }
    };

    // Start playback
    const startTime = options.start || 0;
    const duration = options.end ? options.end - startTime : undefined;
    source.start(0, startTime, duration);

    // Store the source
    this.sources.set(id, source);

    return id;
  }

  /**
   * Stop audio playback
   */
  stop(id?: string) {
    if (id) {
      const source = this.sources.get(id);
      if (source) {
        try {
          source.stop();
        } catch (e) {
          // Source may already be stopped
        }
        this.sources.delete(id);
      }
    } else {
      // Stop all sources
      this.sources.forEach(source => {
        try {
          source.stop();
        } catch (e) {
          // Source may already be stopped
        }
      });
      this.sources.clear();
    }
  }

  /**
   * Get frequency data for visualization
   */
  getFrequencyData(): Uint8Array {
    if (!this.analyserNode) return new Uint8Array();

    const dataArray = new Uint8Array(this.analyserNode.frequencyBinCount);
    this.analyserNode.getByteFrequencyData(dataArray);
    return dataArray;
  }

  /**
   * Get waveform data for visualization
   */
  getWaveformData(): Uint8Array {
    if (!this.analyserNode) return new Uint8Array();

    const dataArray = new Uint8Array(this.analyserNode.fftSize);
    this.analyserNode.getByteTimeDomainData(dataArray);
    return dataArray;
  }

  /**
   * Search audio content based on query
   */
  async searchAudio(query: string): Promise<any[]> {
    // This would typically connect to a backend API
    // For now, return mock results
    return [
      { id: '1', name: 'Drum Loop 1', duration: 4.2, type: 'audio/wav' },
      { id: '2', name: 'Bass Line', duration: 8.0, type: 'audio/wav' },
      { id: '3', name: 'Guitar Riff', duration: 5.5, type: 'audio/wav' },
    ];
  }

  async getAudioInputDevices(): Promise<MediaDeviceInfo[]> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      this.devices = devices.filter(device => device.kind === 'audioinput');
      return this.devices;
    } catch (error) {
      console.error('Failed to get audio devices:', error);
      return [];
    }
  }

  dispose() {
    if (this.recorder) {
      this.recorder.stop();
      this.recorder = null;
    }
    if (this.context) {
      this.context.close();
    }
  }
}

// Export a singleton instance
export const audioService = new AudioService();
