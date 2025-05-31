import { describe, test, expect, vi, beforeEach } from 'vitest';
import { Clip, AudioData, TimelinePosition } from '../../services/types/types';

// Mock audio buffer and services
vi.mock('../../services/audio/audioExporter', () => ({
  exportAudioClip: vi.fn().mockResolvedValue('/path/to/exported/clip.wav'),
  exportMultipleClips: vi.fn().mockResolvedValue(['/path/to/exported/clip1.wav']),
}));

// Import the service to be tested (this would be your actual clip manipulation service)
import { ClipService } from '../../services/daw/clipService';

describe('ClipService - Clip Manipulation', () => {
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
});
