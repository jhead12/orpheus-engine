import { Clip, TimelinePosition } from "../types/core";

/**
 * Slices a clip at the specified position
 * @param clip The clip to slice
 * @param position The position to slice at (must be between clip.start and clip.end)
 * @returns An array containing the two resulting clips
 */
export const sliceClip = (clip: Clip, position: TimelinePosition): [Clip, Clip] => {
  // Ensure position is within clip boundaries
  if (position.compareTo(clip.start) <= 0 || position.compareTo(clip.end) >= 0) {
    throw new Error("Slice position must be within clip boundaries");
  }
  
  // Calculate durations for both clips
  const originalDuration = clip.end.copy();
  originalDuration.subtract(clip.start);
  
  const firstClipDuration = position.copy();
  firstClipDuration.subtract(clip.start);
  
  const secondClipDuration = clip.end.copy();
  secondClipDuration.subtract(position);
  
  // Create left clip (first part)
  const leftClip: Clip = {
    ...clip,
    id: `${clip.id}_left_${Date.now()}`,
    end: position.copy(),
  };
  
  // Create right clip (second part)
  const rightClip: Clip = {
    ...clip,
    id: `${clip.id}_right_${Date.now()}`,
    start: position.copy(),
    // If audio data exists, adjust it for the second clip
    audio: clip.audio ? {
      ...clip.audio,
      // Adjust audio start position relative to original clip
      start: position.copy()
    } : undefined
  };
  
  return [leftClip, rightClip];
};
