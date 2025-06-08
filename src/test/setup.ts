import "@testing-library/jest-dom";
import { vi, beforeEach, beforeAll, afterAll } from "vitest";
import type { Mock } from "vitest";

// Add jest globals
const mockJest = {
  ...vi,
  fn: vi.fn.bind(vi) as unknown as typeof jest.fn,
  spyOn: vi.spyOn.bind(vi) as unknown as typeof jest.spyOn,
} as unknown as typeof jest;

globalThis.jest = mockJest;

// Basic Audio Mock Types
interface MockEventTarget {
  addEventListener: typeof vi.fn;
  removeEventListener: typeof vi.fn;
  dispatchEvent: typeof vi.fn;
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

// Define and set up AudioContext mock before any other code uses it
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

  createMediaElementSource = vi.fn(
    () =>
      ({
        connect: vi.fn(),
        disconnect: vi.fn(),
      } as unknown as MediaElementAudioSourceNode)
  );

  createMediaStreamDestination = vi.fn(
    () =>
      ({
        stream: new MediaStream(),
        connect: vi.fn(),
        disconnect: vi.fn(),
      } as unknown as MediaStreamAudioDestinationNode)
  );

  createMediaStreamSource = vi.fn(
    () =>
      ({
        connect: vi.fn(),
        disconnect: vi.fn(),
      } as unknown as MediaStreamAudioSourceNode)
  );

  getOutputTimestamp = vi.fn(() => ({
    contextTime: 0,
    performanceTime: 0,
  }));

  createBiquadFilter = vi.fn(
    () =>
      ({
        connect: vi.fn(),
        disconnect: vi.fn(),
      } as unknown as BiquadFilterNode)
  );

  createOscillator = vi.fn(
    () =>
      ({
        connect: vi.fn(),
        disconnect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
      } as unknown as OscillatorNode)
  );

  createPanner = vi.fn(
    () =>
      ({
        connect: vi.fn(),
        disconnect: vi.fn(),
      } as unknown as PannerNode)
  );

  createDynamicsCompressor = vi.fn(
    () =>
      ({
        connect: vi.fn(),
        disconnect: vi.fn(),
      } as unknown as DynamicsCompressorNode)
  );

  createStereoPanner = vi.fn(
    () =>
      ({
        connect: vi.fn(),
        disconnect: vi.fn(),
      } as unknown as StereoPannerNode)
  );

  createDelay = vi.fn(
    () =>
      ({
        connect: vi.fn(),
        disconnect: vi.fn(),
      } as unknown as DelayNode)
  );

  createConvolver = vi.fn(
    () =>
      ({
        connect: vi.fn(),
        disconnect: vi.fn(),
      } as unknown as ConvolverNode)
  );

  createConstantSource = vi.fn(
    () =>
      ({
        connect: vi.fn(),
        disconnect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
      } as unknown as ConstantSourceNode)
  );

  createChannelMerger = vi.fn(
    () =>
      ({
        connect: vi.fn(),
        disconnect: vi.fn(),
      } as unknown as ChannelMergerNode)
  );

  createChannelSplitter = vi.fn(
    () =>
      ({
        connect: vi.fn(),
        disconnect: vi.fn(),
      } as unknown as ChannelSplitterNode)
  );

  createWaveShaper = vi.fn(
    () =>
      ({
        connect: vi.fn(),
        disconnect: vi.fn(),
      } as unknown as WaveShaperNode)
  );

  createIIRFilter = vi.fn(
    () =>
      ({
        connect: vi.fn(),
        disconnect: vi.fn(),
      } as unknown as IIRFilterNode)
  );

  createPeriodicWave = vi.fn(() => ({} as unknown as PeriodicWave));

  createScriptProcessor = vi.fn(
    () =>
      ({
        connect: vi.fn(),
        disconnect: vi.fn(),
        onaudioprocess: null,
      } as unknown as ScriptProcessorNode)
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

// Ensure AudioContext is available globally before any imports
globalThis.AudioContext = MockAudioContext as unknown as typeof AudioContext;
globalThis.webkitAudioContext =
  MockAudioContext as unknown as typeof AudioContext;

// Define constructor types
type AudioContextConstructor = {
  new (contextOptions?: AudioContextOptions): AudioContext;
};

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
  // Extend Window interface
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
