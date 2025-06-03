import { describe, test, expect, vi, beforeEach } from 'vitest';
import { Clip, AudioData, TimelinePosition } from '../../services/types/types';

// Import the service to be tested (this would be your actual audio export service)
import { AudioExporter } from '../../services/audio/audioExporter';

// Mock file system / electron APIs
vi.mock('../../services/electron/utils', () => ({
  electronAPI: {
    showSaveDialog: vi.fn().mockResolvedValue({ 
      canceled: false, 
      filePath: '/path/to/export/output.wav'
    }),
    showMessageBox: vi.fn().mockResolvedValue({ response: 0 })
  },
  isElectron: vi.fn().mockReturnValue(true)
}));

describe('AudioExporter - Audio Export Functionality', () => {
  let audioExporter: AudioExporter;
  let testClip: Clip;
  let mockAudioContext: AudioContext;
  let mockOfflineAudioContext: OfflineAudioContext;
  
  beforeEach(() => {
    // Mock AudioContext
    mockAudioContext = {
      createGain: vi.fn().mockReturnValue({
        connect: vi.fn(),
        gain: { value: 1 }
      }),
      createBufferSource: vi.fn().mockReturnValue({
        connect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
        buffer: null
      }),
      destination: {},
      close: vi.fn()
    } as unknown as AudioContext;
    
    // Mock OfflineAudioContext
    mockOfflineAudioContext = {
      startRendering: vi.fn().mockResolvedValue({} as AudioBuffer),
      destination: {},
      createGain: vi.fn().mockReturnValue({
        connect: vi.fn(),
        gain: { value: 1 }
      }),
      createBufferSource: vi.fn().mockReturnValue({
        connect: vi.fn(),
        start: vi.fn(),
        buffer: null
      }),
    } as unknown as OfflineAudioContext;
    
    // Patch global objects
    global.AudioContext = vi.fn().mockImplementation(() => mockAudioContext);
    global.OfflineAudioContext = vi.fn().mockImplementation(() => mockOfflineAudioContext);
    
    // Create a mock audio buffer
    const mockAudioBuffer = {
      duration: 2.5,
      length: 110250,
      numberOfChannels: 2,
      sampleRate: 44100,
      getChannelData: vi.fn().mockReturnValue(new Float32Array(110250))
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
    
    // Initialize audio exporter
    audioExporter = new AudioExporter();
  });
  
  test('should export a single audio clip to WAV format', async () => {
    const result = await audioExporter.exportClip(testClip, {
      format: 'wav',
      sampleRate: 44100,
      bitDepth: 16
    });
    
    expect(result).toBeDefined();
    expect(result!.filePath).toBe('/path/to/export/output.wav');
    expect(mockOfflineAudioContext.startRendering).toHaveBeenCalled();
  });
  
  test('should export a single audio clip to MP3 format', async () => {
    const result = await audioExporter.exportClip(testClip, {
      format: 'mp3',
      sampleRate: 44100,
      bitRate: 320
    });
    
    expect(result).toBeDefined();
    expect(result!.filePath).toBe('/path/to/export/output.wav'); // We're using the mock return value
    expect(mockOfflineAudioContext.startRendering).toHaveBeenCalled();
  });
  
  test('should export multiple clips to a single audio file', async () => {
    const testClip2 = { ...testClip, id: 'test-clip-2', start: new TimelinePosition(0, 2, 0) };
    const clips = [testClip, testClip2];
    
    const result = await audioExporter.exportMultipleClips(clips, {
      format: 'wav',
      sampleRate: 44100,
      bitDepth: 24,
      normalize: true
    });
    
    expect(result).toBeDefined();
    expect(result!.filePath).toBe('/path/to/export/output.wav');
    expect(mockOfflineAudioContext.startRendering).toHaveBeenCalled();
  });
  
  test('should export a section of the timeline', async () => {
    const startPosition = new TimelinePosition(0, 0, 0);
    const endPosition = new TimelinePosition(0, 4, 0);
    
    const result = await audioExporter.exportTimelineSection(
      [testClip],
      startPosition,
      endPosition,
      {
        format: 'wav',
        sampleRate: 48000,
        bitDepth: 24
      }
    );
    
    expect(result).toBeDefined();
    expect(result!.filePath).toBe('/path/to/export/output.wav');
    expect(mockOfflineAudioContext.startRendering).toHaveBeenCalled();
  });
  
  test('should handle export cancellation by user', async () => {
    // Override the mock for this test only
    const showSaveDialogMock = vi.fn().mockResolvedValueOnce({ canceled: true, filePath: '' });
    vi.mocked(require('../../services/electron/utils').electronAPI).showSaveDialog = showSaveDialogMock;
    
    const result = await audioExporter.exportClip(testClip, { format: 'wav' });
    
    expect(result).toBeNull();
    expect(showSaveDialogMock).toHaveBeenCalled();
    expect(mockOfflineAudioContext.startRendering).not.toHaveBeenCalled();
  });
});
