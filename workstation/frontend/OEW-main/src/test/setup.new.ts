import "@testing-library/jest-dom";
import { vi, beforeEach, beforeAll, afterAll } from "vitest";

// Add jest globals
globalThis.jest = {
  ...vi,
  fn: vi.fn,
  spyOn: vi.spyOn,
};

// Basic Audio Mock Types
interface MockAudioParam {
  value: number;
  defaultValue?: number;
  minValue?: number;
  maxValue?: number;
}

interface MockEventTarget {
  addEventListener: typeof vi.fn;
  removeEventListener: typeof vi.fn;
  dispatchEvent: typeof vi.fn;
}

interface MockAudioNode extends MockEventTarget {
  context: AudioContext;
  numberOfInputs: number;
  numberOfOutputs: number;
  channelCount: number;
  channelCountMode: ChannelCountMode;
  channelInterpretation: ChannelInterpretation;
  connect: typeof vi.fn;
  disconnect: typeof vi.fn;
}

// Mock AudioBuffer implementation
class MockAudioBuffer implements AudioBuffer {
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
    const end = Math.min(startInChannel + destination.length, this.length);
    destination.set(
      this._channelData[channelNumber].subarray(startInChannel, end)
    );
  }
}

// Mock AudioContext implementation
class MockAudioContext implements AudioContext {
  readonly baseLatency = 0;
  readonly outputLatency = 0;
  readonly destination: AudioDestinationNode;
  readonly sampleRate = 44100;
  readonly state: AudioContextState = "running";
  readonly audioWorklet: AudioWorklet;
  readonly listener: AudioListener;
  readonly currentTime = 0;
  readonly onstatechange: ((this: BaseAudioContext, ev: Event) => any) | null =
    null;

  constructor(_options?: AudioContextOptions) {
    this.audioWorklet = {
      addModule: vi.fn().mockResolvedValue(undefined),
    } as AudioWorklet;
    this.listener = {
      positionX: { value: 0 },
      positionY: { value: 0 },
      positionZ: { value: 0 },
      forwardX: { value: 0 },
      forwardY: { value: 0 },
      forwardZ: { value: -1 },
      upX: { value: 0 },
      upY: { value: 1 },
      upZ: { value: 0 },
    } as AudioListener;

    this.destination = {
      context: this,
      numberOfInputs: 1,
      numberOfOutputs: 0,
      channelCount: 2,
      channelCountMode: "explicit",
      channelInterpretation: "speakers",
      maxChannelCount: 2,
      connect: vi.fn(),
      disconnect: vi.fn(),
    } as unknown as AudioDestinationNode;
  }

  createBuffer = vi.fn(
    (numChannels: number, length: number, sampleRate: number) =>
      new MockAudioBuffer({ numberOfChannels: numChannels, length, sampleRate })
  );

  createBufferSource = vi.fn(
    () =>
      ({
        buffer: null,
        playbackRate: { value: 1 },
        detune: { value: 0 },
        loop: false,
        connect: vi.fn(),
        disconnect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
      } as unknown as AudioBufferSourceNode)
  );

  createGain = vi.fn(
    () =>
      ({
        gain: { value: 1 },
        connect: vi.fn(),
        disconnect: vi.fn(),
      } as unknown as GainNode)
  );

  createAnalyser = vi.fn(
    () =>
      ({
        fftSize: 2048,
        frequencyBinCount: 1024,
        connect: vi.fn(),
        disconnect: vi.fn(),
        getFloatFrequencyData: vi.fn(),
        getByteFrequencyData: vi.fn(),
      } as unknown as AnalyserNode)
  );

  decodeAudioData = vi.fn().mockResolvedValue(
    new MockAudioBuffer({
      numberOfChannels: 2,
      length: 44100,
      sampleRate: 44100,
    })
  );

  close = vi.fn().mockResolvedValue(undefined);
  suspend = vi.fn().mockResolvedValue(undefined);
  resume = vi.fn().mockResolvedValue(undefined);

  addEventListener = vi.fn();
  removeEventListener = vi.fn();
  dispatchEvent = vi.fn().mockReturnValue(true);
}

// Define constructor types
interface AudioContextConstructor {
  new (options?: AudioContextOptions): AudioContext;
  prototype: AudioContext;
}

interface AudioBufferConstructor {
  new (options: AudioBufferOptions): AudioBuffer;
  prototype: AudioBuffer;
}

// Cast constructors to expected types
const TypedAudioContext =
  MockAudioContext as unknown as AudioContextConstructor;
const TypedAudioBuffer = MockAudioBuffer as unknown as AudioBufferConstructor;

// Declare globals
declare global {
  interface Window {
    AudioContext: AudioContextConstructor;
    webkitAudioContext: AudioContextConstructor;
    AudioBuffer: AudioBufferConstructor;
    electronAPI?: {
      openFile: () => Promise<string>;
      saveFile: (content: string) => Promise<void>;
    };
  }

  var AudioContext: AudioContextConstructor;
  var webkitAudioContext: AudioContextConstructor;
  var AudioBuffer: AudioBufferConstructor;
}

// Set up globals
const setupGlobals = () => {
  const audioMocks = {
    AudioContext: TypedAudioContext,
    webkitAudioContext: TypedAudioContext,
    AudioBuffer: TypedAudioBuffer,
  };

  // Set on globalThis
  Object.entries(audioMocks).forEach(([key, value]) => {
    Object.defineProperty(globalThis, key, {
      value,
      writable: true,
      configurable: true,
    });
  });

  // Set on window if it exists
  if (typeof window !== "undefined") {
    Object.entries(audioMocks).forEach(([key, value]) => {
      Object.defineProperty(window, key, {
        value,
        writable: true,
        configurable: true,
      });
    });

    // Add electron API mock
    window.electronAPI = {
      openFile: vi.fn().mockResolvedValue(""),
      saveFile: vi.fn().mockResolvedValue(undefined),
    };
  }
};

// Run setup
setupGlobals();

// Mock ResizeObserver
class MockResizeObserver implements ResizeObserver {
  constructor(_callback: ResizeObserverCallback) {}
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

global.ResizeObserver = MockResizeObserver;

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
