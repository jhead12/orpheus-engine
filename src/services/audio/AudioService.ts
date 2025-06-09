// AudioService for handling audio operations in Electron, browser, and Python backend environments
import { Track, Clip } from '../../types/core';
import { PlatformService } from '../PlatformService';

export interface AudioSearchResult {
  id: string;
  name: string;
  type: 'track' | 'clip' | 'effect';
  data: any;
}

export interface AudioLoadResult {
  buffer: ArrayBuffer;
  name: string;
  type: string;
  duration?: number;
  sampleRate?: number;
}

export class AudioService {
  private static instance: AudioService;
  private audioContext: AudioContext | null = null;

  static getInstance(): AudioService {
    if (!AudioService.instance) {
      AudioService.instance = new AudioService();
    }
    return AudioService.instance;
  }

  getPlatform(): 'electron' | 'browser' | 'python' {
    if (PlatformService.isElectron()) return 'electron';
    if (PlatformService.isBrowser()) return 'browser';
    if (PlatformService.isPython()) return 'python';
    return 'browser'; // fallback
  }

  async initialize(): Promise<void> {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn('AudioContext not available:', error);
    }
  }

  async loadAudioFile(file: File): Promise<AudioLoadResult | null> {
    if (!file) {
      throw new Error('Invalid file input');
    }

    if (!this.audioContext) {
      await this.initialize();
    }

    if (!this.audioContext) {
      throw new Error('AudioContext not available');
    }

    try {
      const arrayBuffer = await file.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      
      return {
        buffer: arrayBuffer,
        name: file.name,
        type: file.type,
        duration: audioBuffer.duration,
        sampleRate: audioBuffer.sampleRate
      };
    } catch (error) {
      console.error('Error loading audio file:', error);
      throw error;
    }
  }

  async analyzeAudio(fileOrBuffer: File | AudioBuffer): Promise<any> {
    if (!fileOrBuffer) {
      throw new Error('Invalid file input');
    }

    const platform = this.getPlatform();

    switch (platform) {
      case 'electron':
        return this.analyzeAudioElectron(fileOrBuffer as File);
      case 'browser':
        return this.analyzeAudioBrowser(fileOrBuffer);
      case 'python':
        return this.analyzeAudioPython(fileOrBuffer as File);
      default:
        throw new Error('Unsupported platform');
    }
  }

  private async analyzeAudioElectron(file: File): Promise<any> {
    if (!(globalThis as any).electronAPI) {
      throw new Error('Electron API not available');
    }

    const arrayBuffer = await file.arrayBuffer();
    return (globalThis as any).electronAPI.analyzeAudio({
      filePath: undefined, // File path would be handled by Electron
      buffer: arrayBuffer,
      options: { includeWaveform: true, includePeaks: true }
    });
  }

  private async analyzeAudioBrowser(fileOrBuffer: File | AudioBuffer): Promise<any> {
    if (!globalThis.AudioContext && !(globalThis as any).webkitAudioContext) {
      throw new Error('Web Audio API not supported');
    }

    let audioBuffer: AudioBuffer;
    
    if (fileOrBuffer instanceof File) {
      const arrayBuffer = await fileOrBuffer.arrayBuffer();
      if (!this.audioContext) {
        await this.initialize();
      }
      audioBuffer = await this.audioContext!.decodeAudioData(arrayBuffer);
    } else {
      audioBuffer = fileOrBuffer;
    }

    return {
      duration: audioBuffer.duration,
      sampleRate: audioBuffer.sampleRate,
      numberOfChannels: audioBuffer.numberOfChannels,
      length: audioBuffer.length,
      waveform: this.generateWaveform(audioBuffer.getChannelData(0), 1000),
      peaks: this.extractPeaks(audioBuffer)
    };
  }

  private async analyzeAudioPython(file: File): Promise<any> {
    const endpoint = PlatformService.getApiEndpoint();
    const arrayBuffer = await file.arrayBuffer();

    const response = await fetch(`${endpoint}/api/audio/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fileName: file.name,
        fileType: file.type,
        audioData: Array.from(new Uint8Array(arrayBuffer))
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  private extractPeaks(audioBuffer: AudioBuffer, sampleSize: number = 1000): number[] {
    const channelData = audioBuffer.getChannelData(0);
    const blockSize = Math.floor(channelData.length / sampleSize);
    const peaks: number[] = [];

    for (let i = 0; i < sampleSize; i++) {
      const start = i * blockSize;
      const end = Math.min(start + blockSize, channelData.length);
      let max = 0;

      for (let j = start; j < end; j++) {
        max = Math.max(max, Math.abs(channelData[j]));
      }

      peaks.push(max);
    }

    return peaks;
  }

  generateWaveform(audioData: Float32Array, samplesPerPixel: number): number[] {
    if (audioData.length === 0) return [];
    
    const waveform: number[] = [];
    const blockSize = samplesPerPixel;
    
    for (let i = 0; i < audioData.length; i += blockSize) {
      const end = Math.min(i + blockSize, audioData.length);
      let sum = 0;
      
      for (let j = i; j < end; j++) {
        sum += Math.abs(audioData[j]);
      }
      
      waveform.push(sum / (end - i));
    }
    
    return waveform;
  }

  findPeaks(audioData: Float32Array, threshold: number): number[] {
    const peaks: number[] = [];
    
    for (let i = 1; i < audioData.length - 1; i++) {
      const current = Math.abs(audioData[i]);
      const prev = Math.abs(audioData[i - 1]);
      const next = Math.abs(audioData[i + 1]);
      
      if (current > threshold && current > prev && current > next) {
        peaks.push(i);
      }
    }
    
    return peaks;
  }

  isAudioFormatSupported(mimeType: string): boolean {
    const supportedFormats = [
      'audio/wav',
      'audio/wave',
      'audio/x-wav',
      'audio/mp3',
      'audio/mpeg',
      'audio/ogg',
      'audio/webm',
      'audio/flac',
      'audio/aac',
      'audio/m4a'
    ];
    
    return supportedFormats.includes(mimeType);
  }

  search(query: string, tracks: Track[], clips: Clip[]): AudioSearchResult[] {
    const results: AudioSearchResult[] = [];
    
    // Search tracks
    tracks.forEach(track => {
      if (track.name.toLowerCase().includes(query.toLowerCase())) {
        results.push({
          id: track.id,
          name: track.name,
          type: 'track',
          data: track
        });
      }
    });

    // Search clips
    clips.forEach(clip => {
      if (clip.name.toLowerCase().includes(query.toLowerCase())) {
        results.push({
          id: clip.id,
          name: clip.name,
          type: 'clip',
          data: clip
        });
      }
    });

    return results;
  }

  async getSegmentDetails(segmentId: string): Promise<{ file_path: string } | null> {
    // Placeholder implementation for audio segment details
    // In a real implementation, this would query a database or API
    console.log('Getting segment details for:', segmentId);
    return null;
  }
}

// Hook for using audio search functionality
export function useAudioSearch() {
  const audioService = AudioService.getInstance();

  const search = (query: string, tracks: Track[] = [], clips: Clip[] = []) => {
    return audioService.search(query, tracks, clips);
  };

  return { search };
}
