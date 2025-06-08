import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AudioService } from '../audio/AudioService';
import { PlatformService } from '../PlatformService';

// Mock PlatformService
vi.mock('../PlatformService', () => ({
  PlatformService: {
    isElectron: vi.fn(),
    isBrowser: vi.fn(),
    isPython: vi.fn(),
    getApiEndpoint: vi.fn(),
  }
}));

// Mock fetch for API calls
global.fetch = vi.fn();

// Mock AudioContext for Web Audio API tests
const mockAudioContext = {
  createAnalyser: vi.fn(() => ({
    fftSize: 2048,
    frequencyBinCount: 1024,
    getByteFrequencyData: vi.fn(),
    getByteTimeDomainData: vi.fn(),
    connect: vi.fn(),
    disconnect: vi.fn(),
  })),
  createGain: vi.fn(() => ({
    gain: { value: 1 },
    connect: vi.fn(),
    disconnect: vi.fn(),
  })),
  createBufferSource: vi.fn(() => ({
    buffer: null,
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
  })),
  decodeAudioData: vi.fn().mockResolvedValue({
    duration: 1.0,
    sampleRate: 44100,
    numberOfChannels: 2,
    length: 44100,
    getChannelData: vi.fn(() => new Float32Array([0.1, 0.2, 0.3, 0.4])),
  }),
  destination: {},
  state: 'running',
  sampleRate: 44100,
  close: vi.fn(),
};

// Mock AudioContext constructor
const MockAudioContextConstructor = vi.fn().mockImplementation(() => mockAudioContext);

global.AudioContext = MockAudioContextConstructor;
global.webkitAudioContext = MockAudioContextConstructor;

// Ensure window AudioContext is also mocked - this is critical for browser environment tests
Object.defineProperty(window, 'AudioContext', {
  writable: true,
  value: MockAudioContextConstructor
});
Object.defineProperty(window, 'webkitAudioContext', {
  writable: true,
  value: MockAudioContextConstructor
});

// Mock File and FileReader
const createMockFile = (name: string, type: string, data?: Uint8Array) => {
  const mockArrayBuffer = data ? data.buffer : new ArrayBuffer(1024);
  return {
    name,
    size: mockArrayBuffer.byteLength,
    type,
    arrayBuffer: vi.fn().mockResolvedValue(mockArrayBuffer),
  } as unknown as File;
};

global.FileReader = vi.fn().mockImplementation(() => ({
  readAsArrayBuffer: vi.fn(),
  result: new ArrayBuffer(1024),
  onload: null,
  onerror: null,
}));

describe('AudioService', () => {
  let audioService: AudioService;
  let mockFile: any;

  beforeEach(() => {
    // Reset the singleton instance before each test
    (AudioService as any).instance = null;
    
    // Make sure AudioContext mock is properly set up
    vi.clearAllMocks();
    
    // Re-mock AudioContext with fresh mocks for each test
    mockAudioContext.decodeAudioData = vi.fn().mockResolvedValue({
      duration: 1.0,
      sampleRate: 44100,
      numberOfChannels: 2,
      length: 44100,
      getChannelData: vi.fn(() => new Float32Array([0.1, 0.2, 0.3, 0.4])),
    });
    
    audioService = AudioService.getInstance();
    mockFile = createMockFile('test.wav', 'audio/wav');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Platform Detection', () => {
    it('should detect Electron environment', () => {
      (PlatformService.isElectron as any).mockReturnValue(true);
      (PlatformService.isBrowser as any).mockReturnValue(false);
      (PlatformService.isPython as any).mockReturnValue(false);

      expect(audioService.getPlatform()).toBe('electron');
    });

    it('should detect Browser environment', () => {
      (PlatformService.isElectron as any).mockReturnValue(false);
      (PlatformService.isBrowser as any).mockReturnValue(true);
      (PlatformService.isPython as any).mockReturnValue(false);

      expect(audioService.getPlatform()).toBe('browser');
    });

    it('should detect Python backend environment', () => {
      (PlatformService.isElectron as any).mockReturnValue(false);
      (PlatformService.isBrowser as any).mockReturnValue(false);
      (PlatformService.isPython as any).mockReturnValue(true);

      expect(audioService.getPlatform()).toBe('python');
    });
  });

  describe('Audio Loading', () => {
    it('should load audio file successfully', async () => {
      const mockArrayBuffer = new ArrayBuffer(1024);
      mockFile.arrayBuffer = vi.fn().mockResolvedValue(mockArrayBuffer);

      const result = await audioService.loadAudioFile(mockFile);

      expect(result).toBeDefined();
      expect(result).not.toBeNull();
      expect(result!.buffer).toBe(mockArrayBuffer);
      expect(result!.name).toBe('test.wav');
      expect(result!.type).toBe('audio/wav');
    });

    it('should handle audio loading errors', async () => {
      mockFile.arrayBuffer = vi.fn().mockRejectedValue(new Error('Load failed'));

      await expect(audioService.loadAudioFile(mockFile)).rejects.toThrow('Load failed');
    });

    it('should validate supported audio formats', () => {
      expect(audioService.isAudioFormatSupported('audio/wav')).toBe(true);
      expect(audioService.isAudioFormatSupported('audio/mp3')).toBe(true);
      expect(audioService.isAudioFormatSupported('audio/ogg')).toBe(true);
      expect(audioService.isAudioFormatSupported('video/mp4')).toBe(false);
      expect(audioService.isAudioFormatSupported('text/plain')).toBe(false);
    });
  });

  describe('Audio Analysis - Electron Platform', () => {
    beforeEach(() => {
      (PlatformService.isElectron as any).mockReturnValue(true);
      (PlatformService.isBrowser as any).mockReturnValue(false);
    });

    it('should analyze audio using Electron IPC', async () => {
      const mockElectronAPI = {
        analyzeAudio: vi.fn().mockResolvedValue({
          waveform: [0.1, 0.2, 0.3],
          peaks: [0.5, 0.7],
          duration: 10.5,
          sampleRate: 44100,
        })
      };
      
      (global as any).electronAPI = mockElectronAPI;

      const result = await audioService.analyzeAudio(mockFile);

      expect(mockElectronAPI.analyzeAudio).toHaveBeenCalledWith({
        filePath: undefined,
        buffer: expect.any(ArrayBuffer),
        options: { includeWaveform: true, includePeaks: true }
      });
      expect(result.waveform).toEqual([0.1, 0.2, 0.3]);
      expect(result.duration).toBe(10.5);
    });

    it('should handle Electron analysis errors gracefully', async () => {
      const mockElectronAPI = {
        analyzeAudio: vi.fn().mockRejectedValue(new Error('Electron analysis failed'))
      };
      
      (global as any).electronAPI = mockElectronAPI;

      await expect(audioService.analyzeAudio(mockFile)).rejects.toThrow('Electron analysis failed');
    });
  });

  describe('Audio Analysis - Browser Platform', () => {
    beforeEach(() => {
      (PlatformService.isElectron as any).mockReturnValue(false);
      (PlatformService.isBrowser as any).mockReturnValue(true);
      (PlatformService.isPython as any).mockReturnValue(false);
    });

    it('should analyze audio using Web Audio API', async () => {
      const mockAudioBuffer = {
        duration: 10.5,
        sampleRate: 44100,
        numberOfChannels: 2,
        length: 441000,
        getChannelData: vi.fn().mockReturnValue(new Float32Array([0.1, 0.2, 0.3, 0.4, 0.5]))
      };

      const mockAudioContext = new AudioContext();
      mockAudioContext.decodeAudioData = vi.fn().mockResolvedValue(mockAudioBuffer);

      const result = await audioService.analyzeAudio(mockFile);

      expect(result.duration).toBe(10.5);
      expect(result.sampleRate).toBe(44100);
      expect(result.waveform).toBeDefined();
    });

    it('should handle Web Audio API errors', async () => {
      const mockAudioContext = new AudioContext();
      mockAudioContext.decodeAudioData = vi.fn().mockRejectedValue(new Error('Decode failed'));

      await expect(audioService.analyzeAudio(mockFile)).rejects.toThrow('Decode failed');
    });
  });

  describe('Audio Analysis - Python Backend', () => {
    beforeEach(() => {
      (PlatformService.isElectron as any).mockReturnValue(false);
      (PlatformService.isBrowser as any).mockReturnValue(false);
      (PlatformService.isPython as any).mockReturnValue(true);
      (PlatformService.getApiEndpoint as any).mockReturnValue('http://localhost:5001');
    });

    it('should analyze audio using Python backend API', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          waveform: [0.1, 0.2, 0.3],
          peaks: [0.5, 0.7],
          duration: 10.5,
          sampleRate: 44100,
          features: {
            tempo: 120,
            key: 'C',
            loudness: -12.5
          }
        })
      };

      (global.fetch as any).mockResolvedValue(mockResponse);

      const result = await audioService.analyzeAudio(mockFile);

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:5001/api/audio/analyze',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          })
        })
      );
      expect(result.features?.tempo).toBe(120);
      expect(result.features?.key).toBe('C');
    });

    it('should handle Python backend API errors', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      };

      (global.fetch as any).mockResolvedValue(mockResponse);

      await expect(audioService.analyzeAudio(mockFile)).rejects.toThrow('HTTP error! status: 500');
    });

    it('should handle network errors to Python backend', async () => {
      (global.fetch as any).mockRejectedValue(new Error('Network error'));

      await expect(audioService.analyzeAudio(mockFile)).rejects.toThrow('Network error');
    });
  });

  describe('Waveform Generation', () => {
    it('should generate waveform from audio data', () => {
      const audioData = new Float32Array([0.1, 0.2, -0.1, 0.5, -0.3, 0.8, -0.2, 0.1]);
      const samplesPerPixel = 2;

      const waveform = audioService.generateWaveform(audioData, samplesPerPixel);

      expect(waveform).toHaveLength(4); // 8 samples / 2 samplesPerPixel
      expect(waveform[0]).toBeCloseTo(0.15); // Average of 0.1 and 0.2
      expect(waveform[1]).toBeCloseTo(0.2);  // Average of abs(-0.1) and 0.5
    });

    it('should handle empty audio data', () => {
      const audioData = new Float32Array([]);
      const waveform = audioService.generateWaveform(audioData, 1);
      expect(waveform).toHaveLength(0);
    });

    it('should handle single sample', () => {
      const audioData = new Float32Array([0.5]);
      const waveform = audioService.generateWaveform(audioData, 1);
      expect(waveform).toEqual([0.5]);
    });
  });

  describe('Peak Detection', () => {
    it('should find peaks in audio data', () => {
      const audioData = new Float32Array([0.1, 0.8, 0.2, 0.9, 0.1, 0.7, 0.3]);
      const threshold = 0.6;

      const peaks = audioService.findPeaks(audioData, threshold);

      expect(peaks).toContain(1); // Index of 0.8
      expect(peaks).toContain(3); // Index of 0.9
      expect(peaks).toContain(5); // Index of 0.7
      expect(peaks).not.toContain(0); // 0.1 below threshold
    });

    it('should handle no peaks above threshold', () => {
      const audioData = new Float32Array([0.1, 0.2, 0.3, 0.1]);
      const threshold = 0.5;

      const peaks = audioService.findPeaks(audioData, threshold);
      expect(peaks).toHaveLength(0);
    });
  });

  describe('Audio Format Support', () => {
    const supportedFormats = [
      'audio/wav',
      'audio/wave',
      'audio/x-wav',
      'audio/mp3',
      'audio/mpeg',
      'audio/ogg',
      'audio/webm',
      'audio/flac',
      'audio/aac',
      'audio/m4a'
    ];

    const unsupportedFormats = [
      'video/mp4',
      'text/plain',
      'application/json',
      'image/png',
      'audio/midi'
    ];

    supportedFormats.forEach(format => {
      it(`should support ${format}`, () => {
        expect(audioService.isAudioFormatSupported(format)).toBe(true);
      });
    });

    unsupportedFormats.forEach(format => {
      it(`should not support ${format}`, () => {
        expect(audioService.isAudioFormatSupported(format)).toBe(false);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle missing electronAPI gracefully', async () => {
      (PlatformService.isElectron as any).mockReturnValue(true);
      delete (global as any).electronAPI;

      await expect(audioService.analyzeAudio(mockFile))
        .rejects.toThrow('Electron API not available');
    });

    it('should handle missing AudioContext in browser', async () => {
      (PlatformService.isBrowser as any).mockReturnValue(true);
      delete (global as any).AudioContext;
      delete (global as any).webkitAudioContext;

      await expect(audioService.analyzeAudio(mockFile))
        .rejects.toThrow('Web Audio API not supported');
    });

    it('should validate file input', async () => {
      await expect(audioService.analyzeAudio(null as any))
        .rejects.toThrow('Invalid file input');
      
      await expect(audioService.loadAudioFile(null as any))
        .rejects.toThrow('Invalid file input');
    });
  });

  describe('Performance', () => {
    it('should handle large audio files efficiently', async () => {
      const largeAudioData = new Float32Array(1000000); // 1M samples
      for (let i = 0; i < largeAudioData.length; i++) {
        largeAudioData[i] = Math.sin(i * 0.01) * 0.5;
      }

      const startTime = performance.now();
      const waveform = audioService.generateWaveform(largeAudioData, 1000);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(100); // Should complete in under 100ms
      expect(waveform).toHaveLength(1000); // 1M samples / 1000 samplesPerPixel
    });

    it('should handle peak detection on large datasets', () => {
      const largeAudioData = new Float32Array(100000);
      for (let i = 0; i < largeAudioData.length; i++) {
        largeAudioData[i] = Math.random() * 2 - 1; // Random values between -1 and 1
      }

      const startTime = performance.now();
      const peaks = audioService.findPeaks(largeAudioData, 0.8);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(50); // Should complete in under 50ms
      expect(Array.isArray(peaks)).toBe(true);
    });
  });
});
