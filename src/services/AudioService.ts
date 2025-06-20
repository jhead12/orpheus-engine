/**
 * Audio Service for Orpheus Engine
 * Handles audio file loading, processing, and Web Audio API management
 */

export interface AudioFile {
  id: string;
  name: string;
  buffer: AudioBuffer;
  duration: number;
  sampleRate: number;
  channels: number;
  metadata?: {
    artist?: string;
    album?: string;
    title?: string;
    genre?: string;
  };
}

export interface AudioClip {
  id: string;
  audioFileId: string;
  startTime: number;
  endTime: number;
  trackId: string;
  volume: number;
  muted: boolean;
  position: number; // Position on timeline
}

export class AudioService {
  private static instance: AudioService;
  private audioContext: AudioContext | null = null;
  private loadedFiles = new Map<string, AudioFile>();
  private activeClips = new Map<string, AudioClip>();
  private masterGainNode: GainNode | null = null;
  private isPlaying = false;
  private currentTime = 0;
  private eventListeners = new Map<string, Set<(data: any) => void>>();

  private constructor() {
    this.initializeAudioContext();
  }

  public static getInstance(): AudioService {
    if (!AudioService.instance) {
      AudioService.instance = new AudioService();
    }
    return AudioService.instance;
  }

  /**
   * Initialize Web Audio API context
   */
  private initializeAudioContext(): void {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGainNode = this.audioContext.createGain();
      this.masterGainNode.connect(this.audioContext.destination);
      
      console.log('AudioContext initialized:', {
        sampleRate: this.audioContext.sampleRate,
        state: this.audioContext.state,
      });
    } catch (error) {
      console.error('Failed to initialize AudioContext:', error);
    }
  }

  /**
   * Load audio file from File object
   */
  public async loadAudioFile(file: File): Promise<AudioFile> {
    if (!this.audioContext) {
      throw new Error('AudioContext not initialized');
    }

    try {
      console.log(`Loading audio file: ${file.name}`);
      
      // Read file as ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      
      // Decode audio data
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      
      // Create AudioFile object
      const audioFile: AudioFile = {
        id: this.generateId(),
        name: file.name,
        buffer: audioBuffer,
        duration: audioBuffer.duration,
        sampleRate: audioBuffer.sampleRate,
        channels: audioBuffer.numberOfChannels,
        metadata: {
          title: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
        },
      };

      // Store in memory
      this.loadedFiles.set(audioFile.id, audioFile);
      
      // Emit event
      this.emit('audio:loaded', { audioFile });
      
      console.log(`Audio file loaded: ${audioFile.name} (${audioFile.duration.toFixed(2)}s)`);
      return audioFile;
    } catch (error) {
      console.error('Failed to load audio file:', error);
      throw error;
    }
  }

  /**
   * Load audio file from URL
   */
  public async loadAudioFromUrl(url: string, name?: string): Promise<AudioFile> {
    if (!this.audioContext) {
      throw new Error('AudioContext not initialized');
    }

    try {
      console.log(`Loading audio from URL: ${url}`);
      
      // Fetch audio data
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch audio: ${response.statusText}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      
      const audioFile: AudioFile = {
        id: this.generateId(),
        name: name || url.split('/').pop() || 'Unknown',
        buffer: audioBuffer,
        duration: audioBuffer.duration,
        sampleRate: audioBuffer.sampleRate,
        channels: audioBuffer.numberOfChannels,
      };

      this.loadedFiles.set(audioFile.id, audioFile);
      this.emit('audio:loaded', { audioFile });
      
      return audioFile;
    } catch (error) {
      console.error('Failed to load audio from URL:', error);
      throw error;
    }
  }

  /**
   * Create audio clip from loaded file
   */
  public createClip(audioFileId: string, options: Partial<AudioClip> = {}): AudioClip {
    const audioFile = this.loadedFiles.get(audioFileId);
    if (!audioFile) {
      throw new Error(`Audio file not found: ${audioFileId}`);
    }

    const clip: AudioClip = {
      id: this.generateId(),
      audioFileId,
      startTime: 0,
      endTime: audioFile.duration,
      trackId: options.trackId || 'track-1',
      volume: 1.0,
      muted: false,
      position: 0,
      ...options,
    };

    this.activeClips.set(clip.id, clip);
    this.emit('clip:created', { clip });
    
    return clip;
  }

  /**
   * Play audio clip
   */
  public async playClip(clipId: string): Promise<void> {
    const clip = this.activeClips.get(clipId);
    const audioFile = clip ? this.loadedFiles.get(clip.audioFileId) : null;
    
    if (!clip || !audioFile || !this.audioContext || !this.masterGainNode) {
      throw new Error('Invalid clip or audio context');
    }

    try {
      // Resume audio context if suspended
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      // Create buffer source
      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();
      
      source.buffer = audioFile.buffer;
      gainNode.gain.value = clip.muted ? 0 : clip.volume;
      
      // Connect nodes
      source.connect(gainNode);
      gainNode.connect(this.masterGainNode);
      
      // Play the clip section
      const startOffset = clip.startTime;
      const duration = clip.endTime - clip.startTime;
      
      source.start(0, startOffset, duration);
      
      this.emit('clip:playing', { 
        clip, 
        audioData: audioFile.buffer.getChannelData(0) // First channel for analysis
      });
      
      console.log(`Playing clip: ${audioFile.name} (${startOffset.toFixed(2)}s - ${clip.endTime.toFixed(2)}s)`);
    } catch (error) {
      console.error('Failed to play clip:', error);
      throw error;
    }
  }

  /**
   * Play all clips on timeline
   */
  public async playTimeline(): Promise<void> {
    if (!this.audioContext) {
      throw new Error('AudioContext not initialized');
    }

    try {
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      this.isPlaying = true;
      this.emit('playback:started');
      
      // Sort clips by position
      const clips = Array.from(this.activeClips.values())
        .filter(clip => !clip.muted)
        .sort((a, b) => a.position - b.position);
      
      // Play clips at their scheduled times
      for (const clip of clips) {
        const audioFile = this.loadedFiles.get(clip.audioFileId);
        if (audioFile) {
          setTimeout(() => {
            this.playClip(clip.id).catch(console.error);
          }, clip.position * 1000);
        }
      }
      
      console.log(`Playing timeline with ${clips.length} clips`);
    } catch (error) {
      console.error('Failed to play timeline:', error);
      this.isPlaying = false;
      throw error;
    }
  }

  /**
   * Stop playback
   */
  public stopPlayback(): void {
    this.isPlaying = false;
    this.currentTime = 0;
    this.emit('playback:stopped');
    console.log('Playback stopped');
  }

  /**
   * Pause playback
   */
  public pausePlayback(): void {
    this.isPlaying = false;
    this.emit('playback:paused');
    console.log('Playback paused');
  }

  /**
   * Set master volume
   */
  public setMasterVolume(volume: number): void {
    if (this.masterGainNode) {
      this.masterGainNode.gain.value = Math.max(0, Math.min(1, volume));
      this.emit('volume:changed', { volume });
    }
  }

  /**
   * Get loaded audio files
   */
  public getLoadedFiles(): AudioFile[] {
    return Array.from(this.loadedFiles.values());
  }

  /**
   * Get active clips
   */
  public getActiveClips(): AudioClip[] {
    return Array.from(this.activeClips.values());
  }

  /**
   * Get audio file by ID
   */
  public getAudioFile(id: string): AudioFile | undefined {
    return this.loadedFiles.get(id);
  }

  /**
   * Get clip by ID
   */
  public getClip(id: string): AudioClip | undefined {
    return this.activeClips.get(id);
  }

  /**
   * Update clip properties
   */
  public updateClip(clipId: string, updates: Partial<AudioClip>): void {
    const clip = this.activeClips.get(clipId);
    if (clip) {
      Object.assign(clip, updates);
      this.activeClips.set(clipId, clip);
      this.emit('clip:updated', { clip });
    }
  }

  /**
   * Remove clip
   */
  public removeClip(clipId: string): void {
    if (this.activeClips.delete(clipId)) {
      this.emit('clip:removed', { clipId });
    }
  }

  /**
   * Get audio analysis data for plugins
   */
  public getAudioAnalysisData(audioFileId: string): Float32Array[] | null {
    const audioFile = this.loadedFiles.get(audioFileId);
    if (!audioFile) return null;

    const channelData: Float32Array[] = [];
    for (let i = 0; i < audioFile.buffer.numberOfChannels; i++) {
      channelData.push(audioFile.buffer.getChannelData(i));
    }
    
    return channelData;
  }

  /**
   * Event system
   */
  public on(event: string, callback: (data: any) => void): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(callback);
  }

  public off(event: string, callback: (data: any) => void): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(callback);
    }
  }

  public emit(event: string, data?: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in audio service event listener for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Check if Web Audio API is available
   */
  public isAudioContextAvailable(): boolean {
    return this.audioContext !== null;
  }

  /**
   * Get current playback state
   */
  public getPlaybackState(): {
    isPlaying: boolean;
    currentTime: number;
    masterVolume: number;
  } {
    return {
      isPlaying: this.isPlaying,
      currentTime: this.currentTime,
      masterVolume: this.masterGainNode?.gain.value || 0,
    };
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return 'audio_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Cleanup resources
   */
  public dispose(): void {
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    
    this.loadedFiles.clear();
    this.activeClips.clear();
    this.eventListeners.clear();
    
    console.log('AudioService disposed');
  }
}

// Export singleton instance
export const audioService = AudioService.getInstance();
