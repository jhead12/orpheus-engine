import { vi } from 'vitest';

/**
 * Audio-specific test utilities
 * Provides mocks and utilities for testing audio-related functionality
 */

// Audio context and API mocks
export const createMockAudioContext = (overrides = {}) => ({
  createGain: vi.fn(() => ({
    gain: { value: 1, setValueAtTime: vi.fn() },
    connect: vi.fn(),
    disconnect: vi.fn(),
  })),
  createAnalyser: vi.fn(() => ({
    fftSize: 2048,
    frequencyBinCount: 1024,
    getByteFrequencyData: vi.fn(),
    getByteTimeDomainData: vi.fn(),
    connect: vi.fn(),
    disconnect: vi.fn(),
  })),
  createOscillator: vi.fn(() => ({
    frequency: { value: 440, setValueAtTime: vi.fn() },
    type: 'sine',
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
  })),
  createBiquadFilter: vi.fn(() => ({
    type: 'lowpass',
    frequency: { value: 350, setValueAtTime: vi.fn() },
    Q: { value: 1, setValueAtTime: vi.fn() },
    gain: { value: 0, setValueAtTime: vi.fn() },
    connect: vi.fn(),
    disconnect: vi.fn(),
  })),
  createConvolver: vi.fn(() => ({
    buffer: null,
    normalize: true,
    connect: vi.fn(),
    disconnect: vi.fn(),
  })),
  createDelay: vi.fn(() => ({
    delayTime: { value: 0, setValueAtTime: vi.fn() },
    connect: vi.fn(),
    disconnect: vi.fn(),
  })),
  destination: {},
  sampleRate: 44100,
  currentTime: 0,
  state: 'running',
  suspend: vi.fn(),
  resume: vi.fn(),
  close: vi.fn(),
  ...overrides,
});

// Audio buffer mock
export const createMockAudioBuffer = (length = 44100, channels = 2, sampleRate = 44100) => ({
  length,
  numberOfChannels: channels,
  sampleRate,
  duration: length / sampleRate,
  getChannelData: vi.fn((channel) => new Float32Array(length)),
  copyFromChannel: vi.fn(),
  copyToChannel: vi.fn(),
});

// Audio node mocks for effects
export const createMockReverbNode = () => ({
  wetness: { value: 0.3, setValueAtTime: vi.fn() },
  roomSize: { value: 0.7, setValueAtTime: vi.fn() },
  enabled: true,
  connect: vi.fn(),
  disconnect: vi.fn(),
});

export const createMockCompressorNode = () => ({
  threshold: { value: -24, setValueAtTime: vi.fn() },
  knee: { value: 30, setValueAtTime: vi.fn() },
  ratio: { value: 12, setValueAtTime: vi.fn() },
  attack: { value: 0.003, setValueAtTime: vi.fn() },
  release: { value: 0.25, setValueAtTime: vi.fn() },
  connect: vi.fn(),
  disconnect: vi.fn(),
});

export const createMockEQNode = () => ({
  lowGain: { value: 0, setValueAtTime: vi.fn() },
  midGain: { value: 0, setValueAtTime: vi.fn() },
  highGain: { value: 0, setValueAtTime: vi.fn() },
  lowFreq: { value: 320, setValueAtTime: vi.fn() },
  midFreq: { value: 1000, setValueAtTime: vi.fn() },
  highFreq: { value: 3200, setValueAtTime: vi.fn() },
  connect: vi.fn(),
  disconnect: vi.fn(),
});

// Audio meter mocks
export const createMockMeterData = (trackId: string, levels = { left: 0.5, right: 0.6, peak: 0.8 }) => ({
  [trackId]: levels,
});

export const createMockMeterContext = (trackIds: string[] = ['track-1', 'track-2']) => {
  const meters: Record<string, { left: number; right: number; peak: number }> = {};
  
  trackIds.forEach((id, index) => {
    meters[id] = {
      left: Math.random() * 0.8,
      right: Math.random() * 0.8,
      peak: Math.random() * 1.0,
    };
  });
  
  return {
    meters,
    updateMeter: vi.fn(),
    resetMeter: vi.fn(),
    resetAllMeters: vi.fn(),
  };
};

// Audio file and media mocks
export const createMockAudioFile = (overrides = {}) => ({
  name: 'test-audio.wav',
  size: 1024000,
  type: 'audio/wav',
  duration: 30.5,
  sampleRate: 44100,
  channels: 2,
  bitRate: 1411,
  ...overrides,
});

export const createMockMediaStream = () => ({
  getAudioTracks: vi.fn(() => []),
  getVideoTracks: vi.fn(() => []),
  getTracks: vi.fn(() => []),
  addTrack: vi.fn(),
  removeTrack: vi.fn(),
  clone: vi.fn(),
  active: true,
  id: 'mock-stream-id',
});

// Audio recording mocks
export const createMockMediaRecorder = () => ({
  start: vi.fn(),
  stop: vi.fn(),
  pause: vi.fn(),
  resume: vi.fn(),
  requestData: vi.fn(),
  state: 'inactive',
  stream: createMockMediaStream(),
  mimeType: 'audio/webm',
  audioBitsPerSecond: 128000,
  videoBitsPerSecond: 0,
  ondataavailable: null,
  onerror: null,
  onpause: null,
  onresume: null,
  onstart: null,
  onstop: null,
});

// Setup all audio mocks at once
export const setupAudioTestEnvironment = () => {
  // Mock AudioContext
  global.AudioContext = vi.fn().mockImplementation(() => createMockAudioContext());
  global.webkitAudioContext = global.AudioContext;
  
  // Mock MediaDevices
  Object.defineProperty(navigator, 'mediaDevices', {
    writable: true,
    value: {
      getUserMedia: vi.fn().mockResolvedValue(createMockMediaStream()),
      enumerateDevices: vi.fn().mockResolvedValue([]),
    },
  });
  
  // Mock MediaRecorder
  global.MediaRecorder = vi.fn().mockImplementation(() => createMockMediaRecorder());
  
  // Mock URL.createObjectURL
  global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
  global.URL.revokeObjectURL = vi.fn();
};

// Audio testing utilities
export const simulateAudioProcessing = async (duration = 100) => {
  await new Promise(resolve => setTimeout(resolve, duration));
};

export const waitForAudioContextReady = async (context: any) => {
  if (context.state === 'suspended') {
    await context.resume();
  }
  await simulateAudioProcessing(50);
};

export const triggerAudioEvent = (element: HTMLElement, eventType: string, data = {}) => {
  const event = new CustomEvent(eventType, { detail: data });
  element.dispatchEvent(event);
};

// Audio assertion helpers
export const assertAudioContextCreated = () => {
  expect(global.AudioContext).toHaveBeenCalled();
};

export const assertAudioNodeConnected = (node: any, destination: any) => {
  expect(node.connect).toHaveBeenCalledWith(destination);
};

export const assertAudioParameterSet = (parameter: any, value: number, time?: number) => {
  if (time !== undefined) {
    expect(parameter.setValueAtTime).toHaveBeenCalledWith(value, time);
  } else {
    expect(parameter.value).toBe(value);
  }
};
