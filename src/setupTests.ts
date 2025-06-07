import "@testing-library/jest-dom";
import { vi, expect, beforeEach, beforeAll, afterAll } from "vitest";
import { toMatchImageSnapshot } from "jest-image-snapshot";
import type { Mock } from "vitest";

// Add jest-image-snapshot matcher
expect.extend({ toMatchImageSnapshot });

// Add jest globals
const mockJest = {
  ...vi,
  fn: vi.fn.bind(vi) as unknown as typeof jest.fn,
  spyOn: vi.spyOn.bind(vi) as unknown as typeof jest.spyOn,
} as unknown as typeof jest;

globalThis.jest = mockJest;

// Mock ResizeObserver
class MockResizeObserver implements ResizeObserver {
  constructor(_callback: ResizeObserverCallback) {}
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

global.ResizeObserver = MockResizeObserver;

// Mock DOMMatrix
class MockDOMMatrix {
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
  m41: number;
  m42: number;
}

global.DOMMatrix = MockDOMMatrix as any;

// Mock AudioContext
class MockAudioContext {
  destination = {};
  sampleRate = 44100;

  createBuffer(
    channels: number,
    length: number,
    sampleRate: number
  ): AudioBuffer {
    return new MockAudioBuffer({
      numberOfChannels: channels,
      length,
      sampleRate,
    });
  }

  createBufferSource = vi.fn(() => ({
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
  }));
}

// Update MockAudioBuffer implementation
class MockAudioBuffer implements AudioBuffer {
  private _channels: Float32Array[];
  readonly numberOfChannels: number;
  readonly length: number;
  readonly sampleRate: number;
  readonly duration: number;

  constructor(options: AudioBufferOptions) {
    const { numberOfChannels = 1, length, sampleRate } = options;
    this._channels = Array(numberOfChannels)
      .fill(null)
      .map(() => new Float32Array(length));
    this.numberOfChannels = numberOfChannels;
    this.length = length;
    this.sampleRate = sampleRate;
    this.duration = length / sampleRate;
  }

  getChannelData(channel: number): Float32Array {
    if (channel >= this.numberOfChannels) {
      throw new Error("Invalid channel index");
    }
    return this._channels[channel];
  }

  copyToChannel(
    source: Float32Array,
    channelNumber: number,
    startInChannel = 0
  ): void {
    const target = this._channels[channelNumber];
    target.set(source, startInChannel);
  }

  copyFromChannel(
    destination: Float32Array,
    channelNumber: number,
    startInChannel = 0
  ): void {
    const source = this._channels[channelNumber];
    const length = Math.min(destination.length, this.length - startInChannel);
    for (let i = 0; i < length; i++) {
      destination[i] = source[startInChannel + i];
    }
  }
}

// Set up global AudioBuffer constructor
global.AudioBuffer = MockAudioBuffer as any;

// Mock HTMLCanvas context
const mockCanvasContext = {
  fillRect: vi.fn(),
  clearRect: vi.fn(),
  getImageData: vi.fn(() => ({
    data: new Uint8ClampedArray(4),
    width: 1,
    height: 1,
  })),
  putImageData: vi.fn(),
  createImageData: vi.fn(() => ({
    data: new Uint8ClampedArray(4),
    width: 1,
    height: 1,
  })),
  setTransform: vi.fn(),
  drawImage: vi.fn(),
  save: vi.fn(),
  fillText: vi.fn(),
  restore: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  closePath: vi.fn(),
  stroke: vi.fn(),
  translate: vi.fn(),
  scale: vi.fn(),
  rotate: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  measureText: vi.fn(() => ({ width: 0 })),
  transform: vi.fn(),
  rect: vi.fn(),
  clip: vi.fn(),
};

// Mock HTMLCanvasElement.getContext
HTMLCanvasElement.prototype.getContext = vi.fn((contextType) => {
  if (contextType === '2d') {
    return mockCanvasContext;
  }
  return null;
}) as any;

// Mock electron IPC renderer
const mockIpcRenderer = {
  invoke: vi.fn().mockResolvedValue({}),
  send: vi.fn(),
  on: vi.fn(),
  removeListener: vi.fn(),
};

global.window = Object.assign(global.window || {}, {
  electron: {
    ipcRenderer: mockIpcRenderer,
  },
});

// Also make it available as window.require for older electron patterns
global.window.require = vi.fn((module) => {
  if (module === 'electron') {
    return { ipcRenderer: mockIpcRenderer };
  }
  return {};
});

// Console error handling
const SUPPRESSED_ERRORS = [
  "Warning:",
  "Error: Uncaught [Error: useWorkstation must be used within a WorkstationProvider]",
  "The above error occurred in the <TestComponent> component",
  "Consider adding an error boundary",
];

const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  // Mock console.error
  console.error = (...args: Parameters<typeof console.error>) => {
    const firstArg = args[0];
    if (
      typeof firstArg === "string" &&
      SUPPRESSED_ERRORS.some((err) => firstArg.includes(err))
    ) {
      return;
    }
    originalConsoleError.apply(console, args);
  };

  // Mock console.warn
  console.warn = (...args: Parameters<typeof console.warn>) => {
    const firstArg = args[0];
    if (typeof firstArg === "string" && firstArg.includes("Warning:")) {
      return;
    }
    originalConsoleWarn.apply(console, args);
  };
});

// Reset mocks between tests
beforeEach(() => {
  vi.clearAllMocks();
});

// Restore console functions after tests
afterAll(() => {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});
