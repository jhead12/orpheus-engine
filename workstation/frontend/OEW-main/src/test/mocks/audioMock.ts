import { vi } from 'vitest';

/**
 * Audio Mock for Testing
 * Provides proper mocking for Web Audio API components
 */

// Mock AudioBuffer
export class MockAudioBuffer {
  sampleRate: number;
  length: number;
  duration: number;
  numberOfChannels: number;

  constructor(options: {
    numberOfChannels: number;
    length: number;
    sampleRate: number;
  }) {
    this.numberOfChannels = options.numberOfChannels;
    this.length = options.length;
    this.sampleRate = options.sampleRate;
    this.duration = this.length / this.sampleRate;
  }

  getChannelData(channel: number): Float32Array {
    // Return mock audio data
    const data = new Float32Array(this.length);
    for (let i = 0; i < this.length; i++) {
      // Generate some mock waveform data
      data[i] = Math.sin(2 * Math.PI * 440 * i / this.sampleRate) * 0.5;
    }
    return data;
  }

  copyFromChannel = vi.fn();
  copyToChannel = vi.fn();
}

// Mock AudioContext
export class MockAudioContext {
  sampleRate = 44100;
  destination = {
    channelCount: 2,
    channelCountMode: 'explicit',
    channelInterpretation: 'speakers',
  };
  currentTime = 0;
  state = 'running';

  createGain = vi.fn(() => ({
    gain: { value: 1 },
    connect: vi.fn(),
    disconnect: vi.fn(),
  }));

  createOscillator = vi.fn(() => ({
    frequency: { value: 440 },
    type: 'sine',
    connect: vi.fn(),
    disconnect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
  }));

  createAnalyser = vi.fn(() => ({
    fftSize: 2048,
    frequencyBinCount: 1024,
    connect: vi.fn(),
    disconnect: vi.fn(),
    getByteFrequencyData: vi.fn(),
    getByteTimeDomainData: vi.fn(),
    getFloatFrequencyData: vi.fn(),
    getFloatTimeDomainData: vi.fn(),
  }));

  createBufferSource = vi.fn(() => ({
    buffer: null,
    connect: vi.fn(),
    disconnect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
  }));

  createBiquadFilter = vi.fn(() => ({
    type: 'lowpass',
    frequency: { value: 350 },
    Q: { value: 1 },
    gain: { value: 0 },
    connect: vi.fn(),
    disconnect: vi.fn(),
  }));

  createConvolver = vi.fn(() => ({
    buffer: null,
    normalize: true,
    connect: vi.fn(),
    disconnect: vi.fn(),
  }));

  createDelay = vi.fn(() => ({
    delayTime: { value: 0 },
    connect: vi.fn(),
    disconnect: vi.fn(),
  }));

  createDynamicsCompressor = vi.fn(() => ({
    threshold: { value: -24 },
    knee: { value: 30 },
    ratio: { value: 12 },
    attack: { value: 0.003 },
    release: { value: 0.25 },
    connect: vi.fn(),
    disconnect: vi.fn(),
  }));

  decodeAudioData = vi.fn((arrayBuffer: ArrayBuffer) => {
    return Promise.resolve(new MockAudioBuffer({
      numberOfChannels: 2,
      length: 44100,
      sampleRate: 44100,
    }));
  });

  suspend = vi.fn(() => Promise.resolve());
  resume = vi.fn(() => Promise.resolve());
  close = vi.fn(() => Promise.resolve());

  addEventListener = vi.fn();
  removeEventListener = vi.fn();
  dispatchEvent = vi.fn();
}

// Setup Web Audio API mocks
export const setupAudioMocks = () => {
  // Mock global AudioContext
  global.AudioContext = MockAudioContext as any;
  global.webkitAudioContext = MockAudioContext as any;

  // Mock window AudioContext
  Object.defineProperty(window, 'AudioContext', {
    value: MockAudioContext,
    writable: true,
  });

  Object.defineProperty(window, 'webkitAudioContext', {
    value: MockAudioContext,
    writable: true,
  });

  // Mock AudioBuffer constructor
  global.AudioBuffer = MockAudioBuffer as any;
  Object.defineProperty(window, 'AudioBuffer', {
    value: MockAudioBuffer,
    writable: true,
  });

  return () => {
    // Cleanup if needed
  };
};

// Mock File API for audio file testing
export const createMockAudioFile = (name: string = 'test.wav', size: number = 1024) => {
  const buffer = new ArrayBuffer(size);
  const file = new File([buffer], name, { type: 'audio/wav' });
  return file;
};

// Mock audio analysis data
export const createMockAudioAnalysis = () => ({
  peaks: new Float32Array([0.5, 0.8, 0.3, 0.9, 0.4]),
  rms: 0.6,
  duration: 5.0,
  sampleRate: 44100,
  channels: 2,
  waveformData: new Float32Array(100).fill(0).map((_, i) => Math.sin(i * 0.1)),
});
