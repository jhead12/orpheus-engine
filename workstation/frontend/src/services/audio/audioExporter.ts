import { Clip, TimelinePosition } from '../types/types';

export interface ExportOptions {
  format?: 'wav' | 'mp3' | 'ogg' | 'flac';
  sampleRate?: number;
  bitDepth?: 16 | 24 | 32;
  bitRate?: number;
  normalize?: boolean;
}

export interface ExportResult {
  filePath: string;
  duration: number;
  format: string;
}

export class AudioExporter {
  /**
   * Export a single clip to an audio file
   */
  async exportClip(clip: Clip, options: ExportOptions = {}): Promise<ExportResult | null> {
    try {
      // Show save dialog to get output path
      const result = await this.showSaveDialog(options.format || 'wav');
      if (!result || result.canceled || !result.filePath) {
        return null;
      }
      
      // Create offline audio context for rendering
      const offlineContext = this.createOfflineContext(
        (clip.data as any).buffer.duration, 
        options.sampleRate || 44100
      );
      
      // Set up the audio graph for rendering
      const source = offlineContext.createBufferSource();
      source.buffer = (clip.data as any).buffer;
      
      const gainNode = offlineContext.createGain();
      source.connect(gainNode);
      gainNode.connect(offlineContext.destination);
      
      // Start rendering
      source.start();
      const renderedBuffer = await offlineContext.startRendering();
      
      // Process rendered buffer based on options
      if (options.normalize) {
        this.normalizeAudioBuffer(renderedBuffer);
      }
      
      // Convert to the required format and save
      await this.saveAudioBuffer(renderedBuffer, result.filePath, options);
      
      return {
        filePath: result.filePath,
        duration: renderedBuffer.duration,
        format: options.format || 'wav'
      };
    } catch (error) {
      console.error('Error exporting clip:', error);
      return null;
    }
  }
  
  /**
   * Export multiple clips as a single audio file
   */
  async exportMultipleClips(clips: Clip[], options: ExportOptions = {}): Promise<ExportResult | null> {
    try {
      // Show save dialog
      const result = await this.showSaveDialog(options.format || 'wav');
      if (!result || result.canceled || !result.filePath) {
        return null;
      }
      
      // Calculate total duration needed
      let endTime = 0;
      clips.forEach(clip => {
        const clipEndTime = TimelinePosition.toSeconds(clip.start) + (clip.data as any).buffer.duration;
        endTime = Math.max(endTime, clipEndTime);
      });
      
      // Create offline context
      const offlineContext = this.createOfflineContext(
        endTime,
        options.sampleRate || 44100
      );
      
      // Add each clip to the context
      clips.forEach(clip => {
        const source = offlineContext.createBufferSource();
        source.buffer = (clip.data as any).buffer;
        
        const gainNode = offlineContext.createGain();
        source.connect(gainNode);
        gainNode.connect(offlineContext.destination);
        
        // Calculate start time based on clip position
        const startTime = TimelinePosition.toSeconds(clip.start);
        source.start(startTime);
      });
      
      // Render audio
      const renderedBuffer = await offlineContext.startRendering();
      
      // Process rendered buffer based on options
      if (options.normalize) {
        this.normalizeAudioBuffer(renderedBuffer);
      }
      
      // Save the file
      await this.saveAudioBuffer(renderedBuffer, result.filePath, options);
      
      return {
        filePath: result.filePath,
        duration: renderedBuffer.duration,
        format: options.format || 'wav'
      };
    } catch (error) {
      console.error('Error exporting clips:', error);
      return null;
    }
  }
  
  /**
   * Export a section of the timeline
   */
  async exportTimelineSection(
    clips: Clip[], 
    startPosition: TimelinePosition, 
    endPosition: TimelinePosition,
    options: ExportOptions = {}
  ): Promise<ExportResult | null> {
    try {
      // Show save dialog
      const result = await this.showSaveDialog(options.format || 'wav');
      if (!result || result.canceled || !result.filePath) {
        return null;
      }
      
      // Calculate duration
      const startTime = TimelinePosition.toSeconds(startPosition);
      const endTime = TimelinePosition.toSeconds(endPosition);
      const duration = endTime - startTime;
      
      // Create offline context
      const offlineContext = this.createOfflineContext(
        duration,
        options.sampleRate || 44100
      );
      
      // Filter clips that are in the selected range and add them
      const clipsInRange = clips.filter(clip => {
        const clipStart = TimelinePosition.toSeconds(clip.start);
        const clipEnd = clipStart + (clip.data as any).buffer.duration;
        return (clipStart < endTime && clipEnd > startTime);
      });
      
      clipsInRange.forEach(clip => {
        const source = offlineContext.createBufferSource();
        source.buffer = (clip.data as any).buffer;
        
        const gainNode = offlineContext.createGain();
        source.connect(gainNode);
        gainNode.connect(offlineContext.destination);
        
        // Calculate relative start time
        const clipStartTime = TimelinePosition.toSeconds(clip.start) - startTime;
        source.start(Math.max(0, clipStartTime));
      });
      
      // Render audio
      const renderedBuffer = await offlineContext.startRendering();
      
      // Process rendered buffer based on options
      if (options.normalize) {
        this.normalizeAudioBuffer(renderedBuffer);
      }
      
      // Save the file
      await this.saveAudioBuffer(renderedBuffer, result.filePath, options);
      
      return {
        filePath: result.filePath,
        duration: renderedBuffer.duration,
        format: options.format || 'wav'
      };
    } catch (error) {
      console.error('Error exporting timeline section:', error);
      return null;
    }
  }
  
  /**
   * Create an offline audio context for rendering
   */
  private createOfflineContext(duration: number, sampleRate: number): OfflineAudioContext {
    return new OfflineAudioContext({
      numberOfChannels: 2,
      length: Math.ceil(duration * sampleRate),
      sampleRate
    });
  }
  
  /**
   * Show save dialog to get output file path
   */
  private async showSaveDialog(format: string) {
    if (typeof window.electron !== 'undefined') {
      return window.electron.showSaveDialog({
        title: 'Export Audio',
        defaultPath: `export.${format}`,
        filters: [
          { name: format.toUpperCase(), extensions: [format] },
          { name: 'All Files', extensions: ['*'] }
        ]
      });
    }
    return null;
  }
  
  /**
   * Normalize an audio buffer (maximize volume without clipping)
   */
  private normalizeAudioBuffer(buffer: AudioBuffer): void {
    // Find the maximum amplitude in the buffer
    let maxAmplitude = 0;
    
    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      
      for (let i = 0; i < channelData.length; i++) {
        const amplitude = Math.abs(channelData[i]);
        maxAmplitude = Math.max(maxAmplitude, amplitude);
      }
    }
    
    // If already normalized or silent, do nothing
    if (maxAmplitude === 0 || maxAmplitude >= 1) {
      return;
    }
    
    // Calculate the gain factor to normalize
    const gainFactor = 1.0 / maxAmplitude;
    
    // Apply gain to each sample
    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      
      for (let i = 0; i < channelData.length; i++) {
        channelData[i] *= gainFactor;
      }
    }
  }
  
  /**
   * Save an audio buffer to disk in the specified format
   */
  private async saveAudioBuffer(buffer: AudioBuffer, filePath: string, options: ExportOptions): Promise<void> {
    // This is a stub implementation
    // In a real implementation, this would handle encoding to the selected format
    console.log('Saving audio buffer to', filePath, 'with options', options);
    
    // In a real implementation, we would use something like:
    // - Web Audio API FileWriter
    // - WaveFile library for WAV
    // - lamejs for MP3
    // - Web Worker for encoding in the background
    
    // For now, we'll just mock the successful completion
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return Promise.resolve();
  }
}
