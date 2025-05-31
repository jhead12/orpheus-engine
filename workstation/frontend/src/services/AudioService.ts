/**
 * Service for handling audio playback, recording, and processing
 */

import { audioContext } from './utils/audio';

export class AudioService {
  private context: AudioContext | null = null;
  private analyserNode: AnalyserNode | null = null;
  private sources: Map<string, AudioBufferSourceNode> = new Map();
  private recorder: MediaRecorder | null = null;
  private recordingChunks: BlobPart[] = [];
  private devices: MediaDeviceInfo[] = [];

  constructor() {
    // Don't initialize context in constructor
    // It will be initialized on first use
  }

  /**
   * Ensure the audio context is initialized and resumed
   */
  private async ensureContext(): Promise<AudioContext> {
    if (!this.context) {
      this.context = audioContext;
      await this.setupAnalyser();
    }

    if (this.context.state === 'suspended') {
      try {
        await this.context.resume();
      } catch (error) {
        console.warn('Failed to resume AudioContext:', error);
      }
    }

    return this.context;
  }

  /**
   * Setup audio analyser for visualizations
   */
  private async setupAnalyser() {
    if (!this.context) return;
    
    this.analyserNode = this.context.createAnalyser();
    this.analyserNode.fftSize = 2048;
    this.analyserNode.connect(this.context.destination);
  }

  /**
   * Play an audio buffer
   */
  async play(buffer: AudioBuffer | null, id: string = Math.random().toString(), options: {
    loop?: boolean;
    start?: number;
    end?: number;
    onEnded?: () => void;
    gainNode?: GainNode;
  } = {}): Promise<string> {
    if (!buffer) return id;

    // Ensure context is ready
    const context = await this.ensureContext();

    // Stop any existing source with the same ID
    this.stop(id);

    // Create a new source
    const source = context.createBufferSource();
    source.buffer = buffer;

    // Apply options
    if (options.loop) {
      source.loop = true;
      if (options.start !== undefined && options.end !== undefined) {
        source.loopStart = options.start;
        source.loopEnd = options.end;
      }
    }

    // Connect source to destination through the chain:
    // source -> (gainNode if provided) -> analyser -> destination
    if (options.gainNode) {
      source.connect(options.gainNode);
      options.gainNode.connect(this.analyserNode!);
    } else {
      source.connect(this.analyserNode!);
    }

    // Set up ended handler
    source.onended = () => {
      this.sources.delete(id);
      if (options.onEnded) {
        options.onEnded();
      }
    };

    try {
      // Start playback
      const startTime = options.start || 0;
      const duration = options.end ? options.end - startTime : undefined;
      source.start(0, startTime, duration);

      // Store the source
      this.sources.set(id, source);
    } catch (error) {
      console.error('Failed to start audio playback:', error);
    }

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

    // If we're currently recording, stop that too
    if (this.recorder && this.recorder.state === 'recording') {
      this.recorder.stop();
    }
  }

  /**
   * Get frequency data for visualization
   */
  async getFrequencyData(): Promise<Uint8Array> {
    try {
      await this.ensureContext();
      if (!this.analyserNode) return new Uint8Array();

      const dataArray = new Uint8Array(this.analyserNode.frequencyBinCount);
      this.analyserNode.getByteFrequencyData(dataArray);
      return dataArray;
    } catch (error) {
      console.warn('Failed to get frequency data:', error);
      return new Uint8Array();
    }
  }

  /**
   * Get waveform data for visualization
   */
  async getWaveformData(): Promise<Uint8Array> {
    try {
      await this.ensureContext();
      if (!this.analyserNode) return new Uint8Array();

      const dataArray = new Uint8Array(this.analyserNode.fftSize);
      this.analyserNode.getByteTimeDomainData(dataArray);
      return dataArray;
    } catch (error) {
      console.warn('Failed to get waveform data:', error);
      return new Uint8Array();
    }
  }

  /**
   * Get available audio input devices
   */
  public async getAudioInputDevices(): Promise<MediaDeviceInfo[]> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      this.devices = devices.filter(device => device.kind === 'audioinput');
      return this.devices;
    } catch (error) {
      console.error('Failed to get audio devices:', error);
      return [];
    }
  }

  /**
   * Start recording audio
   */
  async startRecording(options: { deviceId?: string } = {}): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: options.deviceId ? { deviceId: { exact: options.deviceId } } : true,
        video: false
      });

      // Create media recorder
      this.recordingChunks = [];
      this.recorder = new MediaRecorder(stream);

      // Set up data handler
      this.recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.recordingChunks.push(event.data);
        }
      };

      // Start recording
      this.recorder.start();

    } catch (error) {
      console.error('Failed to start recording:', error);
      throw error;
    }
  }

  /**
   * Stop recording and get the recorded audio buffer
   */
  async stopRecording(): Promise<AudioBuffer | null> {
    return new Promise((resolve, reject) => {
      if (!this.recorder) {
        reject(new Error('No active recorder'));
        return;
      }

      this.recorder.onstop = async () => {
        try {
          const blob = new Blob(this.recordingChunks, { type: 'audio/webm' });
          const arrayBuffer = await blob.arrayBuffer();
          const context = await this.ensureContext();
          const audioBuffer = await context.decodeAudioData(arrayBuffer);
          
          // Clean up
          this.recordingChunks = [];
          this.recorder = null;
          
          resolve(audioBuffer);
        } catch (error) {
          reject(error);
        }
      };

      this.recorder.stop();
    });
  }

  /**
   * Clean up resources
   */
  dispose() {
    this.stop();
    if (this.analyserNode) {
      this.analyserNode.disconnect();
    }
    if (this.context && this.context !== audioContext) {
      this.context.close();
    }
    this.context = null;
    this.analyserNode = null;
  }
}
