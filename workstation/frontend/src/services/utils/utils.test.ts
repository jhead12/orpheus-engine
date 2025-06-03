import { 
  isValidTrackFileFormat, 
  isValidAudioTrackFileFormat,
  BASE_BEAT_WIDTH,
  BASE_HEIGHT
} from './utils';
import { Clip, TimelinePosition } from '../types/types';

describe('File format validation', () => {
  test('creates test clip with proper types', () => {
    const testClip: Clip = {
      id: 'test',
      trackId: 'track-1',
      start: new TimelinePosition(1, 1, 0),
      length: new TimelinePosition(1, 0, 0),
      data: {
        type: 'audio',
        buffer: {} as AudioBuffer,
        waveform: []
      },
      // Legacy properties for backward compatibility
      name: 'Test Clip',
      end: new TimelinePosition(2, 1, 0),
      loopEnd: undefined,
      startLimit: undefined,
      endLimit: undefined,
      audio: {
        start: new TimelinePosition(1, 1, 0),
        end: new TimelinePosition(2, 1, 0)
      }
    };
    
    expect(testClip.id).toBe('test');
  });
  
  test('validates audio track file formats', () => {
    const testClip2: Clip = {
      id: 'test2',
      trackId: 'track-2',
      start: new TimelinePosition(1, 1, 0),
      length: new TimelinePosition(1, 0, 0),
      data: {
        type: 'audio',
        buffer: {} as AudioBuffer,
        waveform: []
      },
      // Legacy properties for backward compatibility
      name: 'Test Clip 2',
      end: new TimelinePosition(2, 1, 0),
      loopEnd: undefined,
      startLimit: undefined,
      endLimit: undefined,
      audio: {
        start: new TimelinePosition(1, 1, 0),
        end: new TimelinePosition(2, 1, 0)
      }
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
      trackId: 'track-3',
      start: new TimelinePosition(1, 1, 0),
      length: new TimelinePosition(1, 0, 0),
      data: {
        type: 'audio',
        buffer: {} as AudioBuffer,
        waveform: []
      },
      // Legacy properties for backward compatibility
      name: 'Test Clip 3',
      end: new TimelinePosition(2, 1, 0),
      audio: {
        start: new TimelinePosition(1, 1, 0),
        end: new TimelinePosition(2, 1, 0)
      }
    };
    
    expect(testClip3.id).toBe('test3');
    expect(isValidTrackFileFormat('audio/wav')).toBe(true);
    expect(isValidTrackFileFormat('audio/mp3')).toBe(true);
    expect(isValidTrackFileFormat('audio/mpeg')).toBe(true);
    expect(isValidTrackFileFormat('audio/midi')).toBe(true);
    expect(isValidTrackFileFormat('video/mp4')).toBe(false);
  });
  
  // @ts-ignore - This directive is used correctly to ignore the intentional error below
  test('test constants', () => {
    expect(BASE_BEAT_WIDTH).toBeDefined();
    expect(BASE_HEIGHT).toBeDefined();
  });
});