/**
 * Global Test Mocks
 * Centralized mock setup for all browser APIs, audio context, and DOM functionality
 * used across the Orpheus Engine test suite.
 */

import { vi } from 'vitest';

/**
 * Audio Context Mock Implementation
 * Provides comprehensive Web Audio API mocking for DAW components
 */
export class MockAudioContext implements AudioContext {
  readonly destination: AudioDestinationNode = {} as AudioDestinationNode;
  readonly sampleRate: number = 44100;
  readonly currentTime: number = 0;
  readonly listener: AudioListener = {} as AudioListener;
  readonly state: AudioContextState = 'running';
  readonly audioWorklet: AudioWorklet = {} as AudioWorklet;
  readonly baseLatency: number = 0;
  readonly outputLatency: number = 0;

  createGain = vi.fn(() => ({
    gain: { value: 1 },
    connect: vi.fn(),
    disconnect: vi.fn(),
  }));

  createAnalyser = vi.fn(() => ({
    fftSize: 2048,
    frequencyBinCount: 1024,
    getByteFrequencyData: vi.fn(),
    getByteTimeDomainData: vi.fn(),
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

  createBufferSource = vi.fn(() => ({
    buffer: null,
    loop: false,
    connect: vi.fn(),
    disconnect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
  }));

  decodeAudioData = vi.fn().mockResolvedValue({
    duration: 1.0,
    sampleRate: 44100,
    numberOfChannels: 2,
    length: 44100,
    getChannelData: vi.fn(() => new Float32Array([0.1, 0.2, 0.3, 0.4])),
    copyFromChannel: vi.fn(),
    copyToChannel: vi.fn(),
  });

  // Required AudioContext methods
  suspend = vi.fn().mockResolvedValue(undefined);
  resume = vi.fn().mockResolvedValue(undefined);
  close = vi.fn().mockResolvedValue(undefined);
  createMediaElementSource = vi.fn();
  createMediaStreamSource = vi.fn();
  createMediaStreamDestination = vi.fn();
  createScriptProcessor = vi.fn();
  createStereoPanner = vi.fn();
  createChannelSplitter = vi.fn();
  createChannelMerger = vi.fn();
  createConvolver = vi.fn();
  createDelay = vi.fn();
  createDynamicsCompressor = vi.fn();
  createBiquadFilter = vi.fn();
  createWaveShaper = vi.fn();
  createPanner = vi.fn();
  createPeriodicWave = vi.fn();
  createIIRFilter = vi.fn();

  // EventTarget methods
  addEventListener = vi.fn();
  removeEventListener = vi.fn();
  dispatchEvent = vi.fn();
}

/**
 * Audio Buffer Mock Implementation
 */
export class MockAudioBuffer implements AudioBuffer {
  private _channelData: Float32Array[];
  readonly numberOfChannels: number;
  readonly length: number;
  readonly sampleRate: number;
  readonly duration: number;

  constructor(options: AudioBufferOptions) {
    this.numberOfChannels = options.numberOfChannels ?? 2;
    this.length = options.length;
    this.sampleRate = options.sampleRate;
    this.duration = options.length / options.sampleRate;
    this._channelData = Array(this.numberOfChannels)
      .fill(null)
      .map(() => new Float32Array(options.length));
  }

  getChannelData(channel: number): Float32Array {
    if (channel >= this.numberOfChannels) {
      throw new Error("Channel index out of bounds");
    }
    return this._channelData[channel];
  }

  copyToChannel(
    source: Float32Array,
    channelNumber: number,
    startInChannel = 0
  ): void {
    if (channelNumber >= this.numberOfChannels) {
      throw new Error("Channel index out of bounds");
    }
    this._channelData[channelNumber].set(source, startInChannel);
  }

  copyFromChannel(
    destination: Float32Array,
    channelNumber: number,
    startInChannel = 0
  ): void {
    if (channelNumber >= this.numberOfChannels) {
      throw new Error("Channel index out of bounds");
    }
    destination.set(
      this._channelData[channelNumber].slice(startInChannel, startInChannel + destination.length)
    );
  }
}

/**
 * ResizeObserver Mock Implementation
 */
export class MockResizeObserver implements ResizeObserver {
  private callback: ResizeObserverCallback;

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
  }

  observe = vi.fn((element: Element) => {
    // Simulate immediate resize observation with default dimensions
    this.callback([{
      target: element,
      contentRect: { width: 800, height: 400, top: 0, left: 0, bottom: 400, right: 800 },
      borderBoxSize: [{ inlineSize: 800, blockSize: 400 }],
      contentBoxSize: [{ inlineSize: 800, blockSize: 400 }],
      devicePixelContentBoxSize: [{ inlineSize: 800, blockSize: 400 }],
    }], this);
  });

  unobserve = vi.fn();
  disconnect = vi.fn();
}

/**
 * DOMMatrix Mock Implementation
 */
export class MockDOMMatrix {
  m41: number;
  m42: number;

  constructor(transform?: string) {
    const values = transform
      ? transform
          .match(/matrix\((.*)\)/)![1]
          .split(",")
          .map(Number)
      : [1, 0, 0, 1, 0, 0];
    this.m41 = values[4] || 0;
    this.m42 = values[5] || 0;
  }
}

/**
 * FileReader Mock Implementation
 */
export const createMockFileReader = () => ({
  readAsArrayBuffer: vi.fn(),
  readAsText: vi.fn(),
  readAsDataURL: vi.fn(),
  result: new ArrayBuffer(1024),
  onload: null,
  onerror: null,
  onprogress: null,
  readyState: FileReader.DONE,
  error: null,
  abort: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
});

/**
 * Setup comprehensive global mocks for browser APIs
 * This function should be called once in test setup
 */
export const setupGlobalTestMocks = () => {
  // Audio Context mocking
  global.AudioContext = MockAudioContext as any;
  global.webkitAudioContext = MockAudioContext as any;
  global.AudioBuffer = MockAudioBuffer as any;

  // Set window properties for browser compatibility
  Object.defineProperty(window, 'AudioContext', {
    value: MockAudioContext,
    writable: true,
    configurable: true,
  });

  Object.defineProperty(window, 'webkitAudioContext', {
    value: MockAudioContext,
    writable: true,
    configurable: true,
  });

  Object.defineProperty(window, 'AudioBuffer', {
    value: MockAudioBuffer,
    writable: true,
    configurable: true,
  });

  // ResizeObserver
  global.ResizeObserver = MockResizeObserver;
  window.ResizeObserver = MockResizeObserver as any;

  // DOMMatrix
  global.DOMMatrix = MockDOMMatrix as any;
  window.DOMMatrix = MockDOMMatrix as any;

  // FileReader
  global.FileReader = vi.fn().mockImplementation(() => createMockFileReader());

  // matchMedia for responsive testing
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });

  // RequestAnimationFrame
  global.requestAnimationFrame = vi.fn(callback => {
    setTimeout(callback, 16); // 60fps
    return 1;
  });
  global.cancelAnimationFrame = vi.fn();

  // Performance API
  Object.defineProperty(window, 'performance', {
    value: {
      now: vi.fn(() => Date.now()),
      mark: vi.fn(),
      measure: vi.fn(),
      getEntriesByName: vi.fn(() => []),
      getEntriesByType: vi.fn(() => []),
    },
    writable: true,
  });

  // URL and Blob APIs for file handling
  global.URL = {
    createObjectURL: vi.fn(() => 'blob:mock-url'),
    revokeObjectURL: vi.fn(),
  } as any;

  // ElectronAPI mock for tests that need it
  Object.defineProperty(window, 'electronAPI', {
    value: {
      ipcRenderer: {
        invoke: vi.fn().mockResolvedValue([]),
        send: vi.fn(),
        on: vi.fn(),
        removeAllListeners: vi.fn(),
      },
    },
    writable: true,
    configurable: true,
  });

  // Console methods for cleaner test output
  const mockConsole = {
    log: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  };

  // Only mock console in test environments to avoid breaking actual logging
  if (process.env.NODE_ENV === 'test') {
    Object.assign(console, mockConsole);
  }
};

/**
 * Cleanup function to restore original implementations
 */
export const cleanupGlobalTestMocks = () => {
  vi.clearAllMocks();
  vi.resetAllMocks();
};

/**
 * Get a fresh Audio Context mock instance
 */
export const createFreshAudioContextMock = (): MockAudioContext => {
  return new MockAudioContext();
};

/**
 * Create a mock File object for testing file uploads
 */
export const createMockFile = (name: string, type: string, data?: Uint8Array) => {
  const mockArrayBuffer = data ? data.buffer : new ArrayBuffer(1024);
  return {
    name,
    size: mockArrayBuffer.byteLength,
    type,
    arrayBuffer: vi.fn().mockResolvedValue(mockArrayBuffer),
    slice: vi.fn(),
    stream: vi.fn(),
    text: vi.fn().mockResolvedValue('mock file content'),
    lastModified: Date.now(),
    webkitRelativePath: '',
  } as unknown as File;
};

export default {
  setupGlobalTestMocks,
  cleanupGlobalTestMocks,
  createFreshAudioContextMock,
  createMockFile,
  MockAudioContext,
  MockAudioBuffer,
  MockResizeObserver,
  MockDOMMatrix,
};
