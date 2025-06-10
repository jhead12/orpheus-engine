import { RecordingState } from '../types/audio';

export class AudioRecordingService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private dataArray: Uint8Array | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private stream: MediaStream | null = null;
  private chunks: Blob[] = [];
  private startTime: number = 0;
  private pausedTime: number = 0;
  private animationId: number | null = null;

  private state: RecordingState = {
    isRecording: false,
    isPaused: false,
    duration: 0,
    audioLevel: 0,
    sampleRate: 48000,
    channels: 2,
  };

  private onStateChange: ((state: RecordingState) => void) | null = null;

  constructor() {
    this.initializeAudioContext();
  }

  private async initializeAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 48000,
      });
    } catch (error) {
      console.error('Failed to initialize audio context:', error);
    }
  }

  setStateChangeCallback(callback: (state: RecordingState) => void) {
    this.onStateChange = callback;
  }

  private updateState(updates: Partial<RecordingState>) {
    this.state = { ...this.state, ...updates };
    if (this.onStateChange) {
      this.onStateChange(this.state);
    }
  }

  async startRecording(): Promise<void> {
    if (this.state.isRecording) {
      throw new Error('Already recording');
    }

    try {
      // Request microphone access
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 48000,
          channelCount: 2,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      // Set up audio analysis
      if (this.audioContext && this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      if (this.audioContext) {
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 256;
        this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
        
        this.source = this.audioContext.createMediaStreamSource(this.stream);
        this.source.connect(this.analyser);
      }

      // Set up MediaRecorder
      const options: MediaRecorderOptions = {
        mimeType: this.getSupportedMimeType(),
        audioBitsPerSecond: 192000,
      };

      this.mediaRecorder = new MediaRecorder(this.stream, options);
      this.chunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.chunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        this.stopLevelMonitoring();
      };

      // Start recording
      this.mediaRecorder.start(100); // Collect data every 100ms
      this.startTime = Date.now();
      this.pausedTime = 0;

      this.updateState({
        isRecording: true,
        isPaused: false,
        duration: 0,
      });

      this.startLevelMonitoring();
    } catch (error) {
      console.error('Failed to start recording:', error);
      throw new Error('Failed to access microphone. Please check permissions.');
    }
  }

  pauseRecording(): void {
    if (this.mediaRecorder && this.state.isRecording && !this.state.isPaused) {
      this.mediaRecorder.pause();
      this.pausedTime = Date.now();
      this.updateState({ isPaused: true });
      this.stopLevelMonitoring();
    }
  }

  resumeRecording(): void {
    if (this.mediaRecorder && this.state.isRecording && this.state.isPaused) {
      this.mediaRecorder.resume();
      const pauseDuration = Date.now() - this.pausedTime;
      this.startTime += pauseDuration;
      this.updateState({ isPaused: false });
      this.startLevelMonitoring();
    }
  }

  async stopRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder || !this.state.isRecording) {
        reject(new Error('No active recording'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.chunks, { 
          type: this.getSupportedMimeType() 
        });
        
        this.updateState({
          isRecording: false,
          isPaused: false,
          audioLevel: 0,
          duration: 0,
        });
        
        this.cleanup();
        resolve(audioBlob);
      };

      this.mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        this.cleanup();
        reject(new Error('Recording failed'));
      };

      this.mediaRecorder.stop();
    });
  }

  private startLevelMonitoring(): void {
    if (!this.analyser || !this.dataArray) return;

    const updateLevel = () => {
      if (!this.analyser || !this.dataArray || !this.state.isRecording || this.state.isPaused) {
        return;
      }

      this.analyser.getByteFrequencyData(this.dataArray);
      
      // Calculate RMS level
      let sum = 0;
      for (let i = 0; i < this.dataArray.length; i++) {
        sum += this.dataArray[i] * this.dataArray[i];
      }
      const rms = Math.sqrt(sum / this.dataArray.length);
      const level = rms / 255; // Normalize to 0-1

      // Update duration
      const currentTime = Date.now();
      const duration = (currentTime - this.startTime) / 1000;

      this.updateState({
        audioLevel: level,
        duration,
      });

      this.notifyLevelUpdate(level * 100); // Convert to 0-100 range for callback

      this.animationId = requestAnimationFrame(updateLevel);
    };

    updateLevel();
  }

  private stopLevelMonitoring(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  private cleanup(): void {
    this.stopLevelMonitoring();

    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }

    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.mediaRecorder = null;
    this.analyser = null;
    this.dataArray = null;
    this.chunks = [];
    
    // Reset state
    this.state = {
      isRecording: false,
      isPaused: false,
      duration: 0,
      audioLevel: 0,
      sampleRate: 48000,
      channels: 2,
    };
    
    this.startTime = 0;
    this.pausedTime = 0;
    this.levelCallbacks = [];
  }

  private getSupportedMimeType(): string {
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/mpeg',
    ];

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }

    return 'audio/webm'; // Fallback
  }

  getState(): RecordingState {
    return { ...this.state };
  }

  // Public properties for testing
  get isRecording(): boolean {
    return this.state.isRecording;
  }

  get isPaused(): boolean {
    return this.state.isPaused;
  }

  get recordingDuration(): number {
    if (!this.state.isRecording) return 0;
    if (this.state.isPaused) return this.pausedTime / 1000;
    return (Date.now() - this.startTime - this.pausedTime) / 1000;
  }

  // Browser compatibility check
  isBrowserSupported(): boolean {
    return !!(navigator.mediaDevices && 
              'getUserMedia' in navigator.mediaDevices && 
              window.MediaRecorder &&
              (window.AudioContext || (window as any).webkitAudioContext));
  }

  // Request microphone access
  async requestMicrophoneAccess(): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 48000,
          channelCount: 2,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      // Stop the test stream immediately since we just want to check permission
      stream.getTracks().forEach(track => track.stop());
    } catch (error) {
      throw new Error(`Microphone access denied: ${error}`);
    }
  }

  // Get available audio devices
  async getAvailableDevices(): Promise<MediaDeviceInfo[]> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.filter(device => device.kind === 'audioinput');
    } catch (error) {
      console.error('Failed to get audio devices:', error);
      return [];
    }
  }

  // Level monitoring callback system
  private levelCallbacks: ((level: number) => void)[] = [];

  onLevelUpdate(callback: (level: number) => void): () => void {
    this.levelCallbacks.push(callback);
    return () => {
      const index = this.levelCallbacks.indexOf(callback);
      if (index > -1) {
        this.levelCallbacks.splice(index, 1);
      }
    };
  }

  private notifyLevelUpdate(level: number): void {
    this.levelCallbacks.forEach(callback => callback(level));
  }

  // Format duration from milliseconds to human readable format
  formatDuration(duration: number): string {
    const totalSeconds = Math.floor(duration / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  // Get supported audio formats
  getSupportedFormats(): string[] {
    const formats = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/ogg;codecs=opus',
      'audio/wav',
    ];
    
    return formats.filter(format => MediaRecorder.isTypeSupported(format));
  }

}
