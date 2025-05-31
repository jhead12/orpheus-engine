import { v4 as uuidv4 } from 'uuid';
import { Clip, AudioData, TimelinePosition } from '../types/types';

export class ClipService {
  /**
   * Create a new clip
   */
  createClip(trackId: string, data: AudioData): Clip {
    return {
      id: uuidv4(),
      trackId,
      start: new TimelinePosition(0, 0, 0),
      length: new TimelinePosition(0, 2, 0), // Default length
      data
    };
  }
  
  /**
   * Move a clip to a new position
   */
  moveClip(clip: Clip, newPosition: TimelinePosition): Clip {
    return {
      ...clip,
      start: newPosition
    };
  }
  
  /**
   * Split a clip at the given position
   */
  splitClip(clip: Clip, splitPosition: TimelinePosition): { leftClip: Clip, rightClip: Clip } {
    // Calculate relative position from clip start
    const relativePosition = TimelinePosition.subtract(splitPosition, clip.start);
    
    // Create left clip (from start to split point)
    const leftClip = {
      ...clip,
      id: uuidv4(),
      length: relativePosition
    };
    
    // Create right clip (from split point to end)
    const rightClip = {
      ...clip,
      id: uuidv4(),
      start: splitPosition,
      length: TimelinePosition.subtract(clip.length, relativePosition)
    };
    
    return { leftClip, rightClip };
  }
  
  /**
   * Trim a clip to new boundaries
   */
  trimClip(clip: Clip, newStart: TimelinePosition, newEnd: TimelinePosition): Clip {
    // Calculate new length
    const newLength = TimelinePosition.subtract(newEnd, newStart);
    
    return {
      ...clip,
      start: newStart,
      length: newLength
    };
  }
  
  /**
   * Duplicate a clip
   */
  duplicateClip(clip: Clip): Clip {
    // Deep copy clip data
    const dataCopy = JSON.parse(JSON.stringify(clip.data));
    
    return {
      ...clip,
      id: uuidv4(),
      data: {
        ...dataCopy,
        buffer: clip.data.buffer // AudioBuffer can't be deep copied with JSON
      }
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
   * Merge multiple clips into one
   */
  mergeClips(clips: Clip[]): Clip {
    if (clips.length === 0) {
      throw new Error('No clips to merge');
    }
    
    // Find earliest start and calculate total length
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
    return {
      id: uuidv4(),
      trackId: clips[0].trackId,
      start: earliestStart,
      length: totalLength,
      data: {
        ...clips[0].data,
        // In a real implementation, audio buffers would be merged here
        buffer: clips[0].data.buffer
      }
    };
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
