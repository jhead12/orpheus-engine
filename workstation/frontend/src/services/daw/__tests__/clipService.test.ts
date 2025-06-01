import { describe, test, expect, vi, beforeEach } from 'vitest';
import { Clip, AudioData, TimelinePosition } from '../../types/types';
import { ClipService } from '../clipService';

describe('ClipService', () => {
  let clipService: ClipService;
  let testClip: Clip;
  
  beforeEach(() => {
    // Create a mock audio buffer
    const mockAudioBuffer = {
      duration: 2.5,
      length: 110250,
      numberOfChannels: 2,
      sampleRate: 44100
    } as unknown as AudioBuffer;
    
    // Create a test clip
    testClip = {
      id: 'test-clip-1',
      trackId: 'track-1',
      start: new TimelinePosition(0, 0, 0),
      length: new TimelinePosition(0, 2, 0),
      data: {
        type: 'audio',
        buffer: mockAudioBuffer,
        waveform: Array(100).fill(0).map(() => Math.random() * 2 - 1)
      } as AudioData
    };
    
    // Initialize clip service
    clipService = new ClipService();
  });
  
  test('should create a new clip', () => {
    const newClip = clipService.createClip('track-2', testClip.data);
    
    expect(newClip).toBeDefined();
    expect(newClip.id).toBeDefined();
    expect(newClip.trackId).toBe('track-2');
    expect(newClip.data).toBe(testClip.data);
    expect(newClip.start).toEqual(new TimelinePosition(0, 0, 0));
  });
  
  test('should move a clip to a new position', () => {
    const newPosition = new TimelinePosition(1, 0, 0);
    const movedClip = clipService.moveClip(testClip, newPosition);
    
    expect(movedClip.start).toEqual(newPosition);
    expect(movedClip.id).toBe(testClip.id);
    expect(movedClip.data).toBe(testClip.data);
  });
  
  test('should split a clip at the given position', () => {
    const splitPosition = new TimelinePosition(0, 1, 0);
    const { leftClip, rightClip } = clipService.splitClip(testClip, splitPosition);
    
    expect(leftClip.id).not.toBe(testClip.id);
    expect(rightClip.id).not.toBe(testClip.id);
    expect(leftClip.id).not.toBe(rightClip.id);
    
    expect(leftClip.start).toEqual(testClip.start);
    expect(rightClip.start).toEqual(splitPosition);
    
    expect(leftClip.length).toEqual(splitPosition);
    expect(rightClip.length.bar).toBe(0);
    expect(rightClip.length.beat).toBe(1);
    expect(rightClip.length.tick).toBe(0);
  });
  
  test('should trim a clip to new boundaries', () => {
    const newStart = new TimelinePosition(0, 0, 50);
    const newEnd = new TimelinePosition(0, 1, 50);
    
    const trimmedClip = clipService.trimClip(testClip, newStart, newEnd);
    
    expect(trimmedClip.start).toEqual(newStart);
    expect(trimmedClip.length.bar).toBe(0);
    expect(trimmedClip.length.beat).toBe(1);
    expect(trimmedClip.length.tick).toBe(0);
  });
  
  test('should duplicate a clip', () => {
    const duplicateClip = clipService.duplicateClip(testClip);
    
    expect(duplicateClip.id).not.toBe(testClip.id);
    expect(duplicateClip.trackId).toBe(testClip.trackId);
    expect(duplicateClip.start).toEqual(testClip.start);
    expect(duplicateClip.length).toEqual(testClip.length);
    
    // Should be a deep copy, not the same reference
    expect(duplicateClip.data).not.toBe(testClip.data);
    expect(duplicateClip.data.type).toBe(testClip.data.type);
  });
  
  test('should add fade in/out to a clip', () => {
    const fadeInLength = 0.5; // 500ms fade in
    const fadeOutLength = 0.3; // 300ms fade out
    
    const fadedClip = clipService.addFades(testClip, fadeInLength, fadeOutLength);
    
    expect(fadedClip.id).toBe(testClip.id);
    expect(fadedClip.fadeIn).toBe(fadeInLength);
    expect(fadedClip.fadeOut).toBe(fadeOutLength);
  });
  
  test('should apply effects to a clip', () => {
    const effects = [
      { type: 'eq', parameters: { gain: 3, frequency: 1000, q: 1.0 } },
      { type: 'reverb', parameters: { roomSize: 0.8, dampening: 0.5, wet: 0.3 } }
    ];
    
    const effectsClip = clipService.applyEffects(testClip, effects);
    
    expect(effectsClip.id).toBe(testClip.id);
    expect(effectsClip.effects).toEqual(effects);
    expect(effectsClip.effects).toHaveLength(2);
    expect(effectsClip.effects[0].type).toBe('eq');
    expect(effectsClip.effects[1].type).toBe('reverb');
  });
  
  test('should add metadata to a clip', () => {
    const metadata = {
      name: 'Vocal Take 1',
      tags: ['vocals', 'verse', 'lead'],
      rating: 4,
      comments: 'Good take, slight pitch issue at 0:45'
    };
    
    const metadataClip = clipService.addMetadata(testClip, metadata);
    
    expect(metadataClip.id).toBe(testClip.id);
    expect(metadataClip.metadata).toEqual(metadata);
    expect(metadataClip.metadata.name).toBe('Vocal Take 1');
    expect(metadataClip.metadata.tags).toContain('vocals');
  });
  
  test('should adjust clip gain', () => {
    const gainAdjustment = 0.8; // 80% of original volume
    
    const gainAdjustedClip = clipService.adjustGain(testClip, gainAdjustment);
    
    expect(gainAdjustedClip.id).toBe(testClip.id);
    expect(gainAdjustedClip.gain).toBe(gainAdjustment);
  });
  
  test('should merge multiple clips into one', () => {
    const testClip2 = {
      ...testClip,
      id: 'test-clip-2',
      start: new TimelinePosition(0, 2, 0),
      length: new TimelinePosition(0, 2, 0)
    };
    
    const testClip3 = {
      ...testClip,
      id: 'test-clip-3',
      start: new TimelinePosition(0, 4, 0),
      length: new TimelinePosition(0, 1, 0)
    };
    
    const clips = [testClip, testClip2, testClip3];
    const mergedClip = clipService.mergeClips(clips);
    
    expect(mergedClip.id).not.toBe(testClip.id);
    expect(mergedClip.start).toEqual(testClip.start); // Should start at the earliest clip
    expect(mergedClip.length.bar).toBe(0);
    expect(mergedClip.length.beat).toBe(5); // Should span the entire range (0 to 5 beats)
    expect(mergedClip.data).toBeDefined();
  });
  
  test('should quantize clip to the nearest beat', () => {
    // Create a clip with non-aligned start
    const nonAlignedClip = {
      ...testClip,
      start: new TimelinePosition(0, 1, 50) // 1 beat and 50 ticks
    };
    
    const quantizedClip = clipService.quantizeClip(nonAlignedClip, 1); // Quantize to quarter notes (1 beat)
    
    expect(quantizedClip.id).toBe(nonAlignedClip.id);
    expect(quantizedClip.start.bar).toBe(0);
    expect(quantizedClip.start.beat).toBe(2); // Should round to beat 2
    expect(quantizedClip.start.tick).toBe(0); // No ticks (perfectly on beat)
  });
});
