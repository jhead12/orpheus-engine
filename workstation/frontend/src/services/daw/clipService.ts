import { Clip, AudioData, MIDIData, TimelinePosition, TrackType } from '../types/types';

export class ClipService {
  /**
   * Create a new clip
   */
  createClip(trackId: string, data: AudioData | MIDIData): Clip {
    return {
      id: crypto.randomUUID(),
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
        id: crypto.randomUUID(),
        length: TimelinePosition.fromSeconds(leftDuration),
        data: {
          ...audioData,
          buffer: leftBuffer,
          waveform: audioData.waveform.slice(0, Math.floor(audioData.waveform.length * (leftDuration / audioData.buffer.duration)))
        }
      };

      const rightClip = {
        ...clip,
        id: crypto.randomUUID(),
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
        id: crypto.randomUUID(),
        length: TimelinePosition.fromSeconds(leftDuration),
        data: {
          ...midiData,
          notes: leftNotes
        }
      };

      const rightClip = {
        ...clip,
        id: crypto.randomUUID(),
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
      id: crypto.randomUUID(),
      data: clip.data.type === 'audio' ?
        { ...clip.data, buffer: this.cloneAudioBuffer(clip.data.buffer) } :
        { ...clip.data, notes: [...clip.data.notes] }
    };
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
}
