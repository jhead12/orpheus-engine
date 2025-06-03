import { Clip, AudioData, MIDIData, TimelinePosition, TrackType } from '../types/types';
import { v4 as uuidv4 } from 'uuid';

export class ClipService {
  private currentClip: Clip | null = null;

  /**
   * Create a new clip
   */
  createClip(trackId: string, data: AudioData | MIDIData): Clip {
    return {
      id: uuidv4(),
      trackId,
      start: new TimelinePosition(0, 0, 0),
      length: data.type === 'audio' ? 
        TimelinePosition.fromSeconds(data.buffer.duration) : 
        new TimelinePosition(0, 4, 0), // Default 4 beats for MIDI
      data
    };
  }

  /**
   * Move a clip to a new position
   */
  moveClip(clip: Clip, newStart: TimelinePosition): Clip {
    return {
      ...clip,
      start: newStart
    };
  }

  /**
   * Split a clip at the given position
   */
  splitClip(clip: Clip, splitPosition: TimelinePosition): { leftClip: Clip, rightClip: Clip } {
    // Check if split position is within clip bounds
    if (splitPosition.compareTo(clip.start) <= 0 ||
        splitPosition.compareTo(TimelinePosition.add(clip.start, clip.length)) >= 0) {
      throw new Error('Split position must be within clip bounds');
    }

    // Calculate durations for left and right parts
    const leftDuration = splitPosition.toSeconds() - clip.start.toSeconds();
    const rightDuration = TimelinePosition.add(clip.start, clip.length).toSeconds() - splitPosition.toSeconds();

    if (clip.data.type === 'audio') {
      // Handle audio clip splitting
      const audioData = clip.data as AudioData;
      const leftBuffer = this.createAudioBufferSlice(audioData.buffer, 0, leftDuration);
      const rightBuffer = this.createAudioBufferSlice(audioData.buffer, leftDuration, leftDuration + rightDuration);

      const leftClip = {
        ...clip,
        id: uuidv4(),
        length: TimelinePosition.fromSeconds(leftDuration),
        data: {
          ...audioData,
          buffer: leftBuffer,
          waveform: audioData.waveform.slice(0, Math.floor(audioData.waveform.length * (leftDuration / audioData.buffer.duration)))
        }
      };

      const rightClip = {
        ...clip,
        id: uuidv4(),
        start: splitPosition,
        length: TimelinePosition.fromSeconds(rightDuration),
        data: {
          ...audioData,
          buffer: rightBuffer,
          waveform: audioData.waveform.slice(Math.floor(audioData.waveform.length * (leftDuration / audioData.buffer.duration)))
        }
      };

      return { leftClip, rightClip };

    } else {
      // Handle MIDI clip splitting
      const midiData = clip.data as MIDIData;
      const splitTime = splitPosition.toSeconds();

      const leftNotes = midiData.notes.filter(note => 
        note.start.toSeconds() + note.duration.toSeconds() <= splitTime
      );

      const rightNotes = midiData.notes
        .filter(note => note.start.toSeconds() >= splitTime)
        .map(note => ({
          ...note,
          start: TimelinePosition.subtract(note.start, splitPosition)
        }));

      const leftClip = {
        ...clip,
        id: uuidv4(),
        length: TimelinePosition.fromSeconds(leftDuration),
        data: {
          ...midiData,
          notes: leftNotes
        }
      };

      const rightClip = {
        ...clip,
        id: uuidv4(),
        start: splitPosition,
        length: TimelinePosition.fromSeconds(rightDuration),
        data: {
          ...midiData,
          notes: rightNotes
        }
      };

      return { leftClip, rightClip };
    }
  }

  /**
   * Trim a clip to new boundaries
   */
  trimClip(clip: Clip, newStart: TimelinePosition, newLength: TimelinePosition): Clip {
    if (clip.data.type === 'audio') {
      const audioData = clip.data as AudioData;
      const startOffset = Math.max(0, newStart.toSeconds() - clip.start.toSeconds());
      const duration = newLength.toSeconds();
      
      const trimmedBuffer = this.createAudioBufferSlice(audioData.buffer, startOffset, startOffset + duration);
      const waveformStartIdx = Math.floor(audioData.waveform.length * (startOffset / audioData.buffer.duration));
      const waveformEndIdx = Math.floor(audioData.waveform.length * ((startOffset + duration) / audioData.buffer.duration));

      return {
        ...clip,
        start: newStart,
        length: newLength,
        data: {
          ...audioData,
          buffer: trimmedBuffer,
          waveform: audioData.waveform.slice(waveformStartIdx, waveformEndIdx)
        }
      };

    } else {
      const midiData = clip.data as MIDIData;
      const startTime = newStart.toSeconds();
      const endTime = startTime + newLength.toSeconds();

      const trimmedNotes = midiData.notes
        .filter(note => {
          const noteStart = note.start.toSeconds();
          const noteEnd = noteStart + note.duration.toSeconds();
          return noteStart >= startTime && noteEnd <= endTime;
        })
        .map(note => ({
          ...note,
          start: TimelinePosition.subtract(note.start, newStart)
        }));

      return {
        ...clip,
        start: newStart,
        length: newLength,
        data: {
          ...midiData,
          notes: trimmedNotes
        }
      };
    }
  }

  /**
   * Create a copy of a clip
   */
  duplicateClip(clip: Clip): Clip {
    return {
      ...clip,
      id: uuidv4(),
      data: clip.data.type === 'audio' ?
        { ...clip.data, buffer: this.cloneAudioBuffer(clip.data.buffer) } :
        { ...clip.data, notes: [...clip.data.notes] }
    };
  }

  /**
   * Add fade in/out to a clip
   */
  addFades(clip: Clip, fadeIn: number, fadeOut: number): Clip {
    return {
      ...clip,
      fadeIn,
      fadeOut
    };
  }

  /**
   * Apply effects to a clip
   */
  applyEffects(clip: Clip, effects: Array<{ type: string, parameters: Record<string, any> }>): Clip {
    return {
      ...clip,
      effects
    };
  }

  /**
   * Add metadata to a clip
   */
  addMetadata(clip: Clip, metadata: Record<string, any>): Clip {
    return {
      ...clip,
      metadata
    };
  }

  /**
   * Adjust clip gain
   */
  adjustGain(clip: Clip, gain: number): Clip {
    return {
      ...clip,
      gain
    };
  }

  /**
   * Get current clip
   */
  getCurrentClip(): Clip | null {
    return this.currentClip;
  }

  /**
   * Set current clip
   */
  setCurrentClip(clip: Clip | null): void {
    this.currentClip = clip;
  }

  /**
   * Create a slice of an AudioBuffer
   */
  private createAudioBufferSlice(buffer: AudioBuffer, startTime: number, endTime: number): AudioBuffer {
    const sampleRate = buffer.sampleRate;
    const startSample = Math.floor(startTime * sampleRate);
    const endSample = Math.floor(endTime * sampleRate);
    const length = endSample - startSample;

    const newBuffer = new AudioContext().createBuffer(
      buffer.numberOfChannels,
      length,
      sampleRate
    );

    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      const newChannelData = newBuffer.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        newChannelData[i] = channelData[startSample + i];
      }
    }

    return newBuffer;
  }

  /**
   * Create a copy of an AudioBuffer
   */
  private cloneAudioBuffer(buffer: AudioBuffer): AudioBuffer {
    return this.createAudioBufferSlice(buffer, 0, buffer.duration);
  }

  /**
   * Merge multiple clips into one
   */
  mergeClips(clips: Clip[]): Clip {
    if (clips.length === 0) {
      throw new Error('Cannot merge empty clips array');
    }

    // Find earliest start and latest end
    let earliestStart = clips[0].start;
    let latestEnd = TimelinePosition.add(clips[0].start, clips[0].length);

    for (let i = 1; i < clips.length; i++) {
      const clip = clips[i];
      if (TimelinePosition.compare(clip.start, earliestStart) < 0) {
        earliestStart = clip.start;
      }

      const clipEnd = TimelinePosition.add(clip.start, clip.length);
      if (TimelinePosition.compare(clipEnd, latestEnd) > 0) {
        latestEnd = clipEnd;
      }
    }

    const totalLength = TimelinePosition.subtract(latestEnd, earliestStart);

    // Create a new merged clip
    if (clips[0].data.type === 'audio') {
      const audioData = clips[0].data as AudioData;
      return {
        id: uuidv4(),
        trackId: clips[0].trackId,
        start: earliestStart,
        length: totalLength,
        data: {
          ...audioData,
          // In a real implementation, audio buffers would be merged here
          buffer: audioData.buffer
        }
      };
    } else {
      // Handle MIDI data merging
      const midiData = clips[0].data as MIDIData;
      return {
        id: uuidv4(),
        trackId: clips[0].trackId,
        start: earliestStart,
        length: totalLength,
        data: {
          ...midiData
        }
      };
    }
  }

  /**
   * Quantize clip to the nearest beat division
   */
  quantizeClip(clip: Clip, division: number): Clip {
    // Convert to ticks for easier math
    const startInTicks = clip.start.bar * 4 * 480 + clip.start.beat * 480 + clip.start.tick;
    const divisionInTicks = division * 480;

    // Round to nearest division
    const quantizedTicks = Math.round(startInTicks / divisionInTicks) * divisionInTicks;

    // Convert back to bar/beat/tick
    const bars = Math.floor(quantizedTicks / (4 * 480));
    const remainingTicks = quantizedTicks - (bars * 4 * 480);
    const beats = Math.floor(remainingTicks / 480);
    const ticks = remainingTicks - (beats * 480);

    const quantizedPosition = new TimelinePosition(bars, beats, ticks);

    return {
      ...clip,
      start: quantizedPosition
    };
  }
}
