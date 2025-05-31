import { describe, expect, test } from '@jest/globals';
import { 
  isValidTrackFileFormat, 
  isValidAudioTrackFileFormat,
  BASE_BEAT_WIDTH,
  BASE_HEIGHT
} from './utils';
import { Clip, TimelinePosition, ClipAudio, TrackType } from '../types/types';

describe('File format validation', () => {
  test('creates test clip with proper types', () => {
    const testClip: Clip = {
      id: 'test',
      name: 'Test Clip',
      start: new TimelinePosition(1, 1, 0),
      end: new TimelinePosition(2, 1, 0),
      muted: false,
      loopEnd: null,
      startLimit: null,
      endLimit: null,
      type: TrackType.Audio,
      audio: {
        audioBuffer: {} as AudioBuffer,
        start: new TimelinePosition(1, 1, 0),
        end: new TimelinePosition(2, 1, 0),
        buffer: new Uint8Array(0) as unknown as Buffer, // Use Uint8Array as a stand-in for Buffer
        sourceDuration: 0,
        type: 'audio/wav'
      } as unknown as ClipAudio // Use unknown to bypass type checking
    };
    
    expect(testClip.id).toBe('test');
  });
  
  test('validates audio track file formats', () => {
    const testClip2: Clip = {
      id: 'test2',
      name: 'Test Clip 2',
      start: new TimelinePosition(1, 1, 0),
      end: new TimelinePosition(2, 1, 0),
      muted: false,
      loopEnd: null,
      startLimit: null,
      endLimit: null,
      type: TrackType.Audio,
      audio: {
        audioBuffer: {} as AudioBuffer,
        start: new TimelinePosition(1, 1, 0),
        end: new TimelinePosition(2, 1, 0),
        buffer: new Uint8Array(0) as unknown as Buffer,
        sourceDuration: 0,
        type: 'audio/wav'
      } as unknown as ClipAudio
    };
    
    expect(testClip2.id).toBe('test2');
    expect(isValidAudioTrackFileFormat('audio/wav')).toBe(true);
    expect(isValidAudioTrackFileFormat('audio/mp3')).toBe(true);
    expect(isValidAudioTrackFileFormat('audio/mpeg')).toBe(true);
    expect(isValidAudioTrackFileFormat('audio/midi')).toBe(false);
    expect(isValidAudioTrackFileFormat('video/mp4')).toBe(false);
  });
  
  test('validates track file formats', () => {
    const testClip3: Clip = {
      id: 'test3',
      name: 'Test Clip 3',
      start: new TimelinePosition(1, 1, 0),
      end: new TimelinePosition(2, 1, 0),
      muted: false,
      loopEnd: null,
      startLimit: null,
      endLimit: null,
      type: TrackType.Audio,
      audio: {
        audioBuffer: {} as AudioBuffer,
        start: new TimelinePosition(1, 1, 0),
        end: new TimelinePosition(2, 1, 0),
        buffer: new Uint8Array(0) as unknown as Buffer,
        sourceDuration: 0,
        type: 'audio/wav'
      } as unknown as ClipAudio
    };
    
    expect(testClip3.id).toBe('test3');
    expect(isValidTrackFileFormat('audio/wav')).toBe(true);
    expect(isValidTrackFileFormat('audio/mp3')).toBe(true);
    expect(isValidTrackFileFormat('audio/mpeg')).toBe(true);
    expect(isValidTrackFileFormat('audio/midi')).toBe(true);
    expect(isValidTrackFileFormat('video/mp4')).toBe(false);
  });
  
  test('test constants', () => {
    expect(BASE_BEAT_WIDTH).toBeDefined();
    expect(BASE_HEIGHT).toBeDefined();
  });
});