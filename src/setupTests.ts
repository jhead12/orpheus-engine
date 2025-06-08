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
  strokeRect: vi.fn(), // Add missing strokeRect method
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
  // Add common canvas context properties
  fillStyle: "#000000",
  strokeStyle: "#000000",
  lineWidth: 1,
  font: "10px sans-serif",
};

// Mock HTMLCanvasElement.getContext
HTMLCanvasElement.prototype.getContext = vi.fn((contextType) => {
  if (contextType === "2d") {
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
  if (module === "electron") {
    return { ipcRenderer: mockIpcRenderer };
  }
  return {};
});

// Mock react-router-dom
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: vi.fn(() => vi.fn()),
    useLocation: vi.fn(() => ({
      pathname: "/",
      search: "",
      hash: "",
      state: null,
    })),
    useParams: vi.fn(() => ({})),
    useSearchParams: vi.fn(() => [new URLSearchParams(), vi.fn()]),
    BrowserRouter: ({ children }: { children: React.ReactNode }) => children,
    MemoryRouter: ({ children }: { children: React.ReactNode }) => children,
    Link: ({ children, to, ...props }: any) => {
      const React = require("react");
      return React.createElement("a", { href: to, ...props }, children);
    },
    NavLink: ({ children, to, ...props }: any) => {
      const React = require("react");
      return React.createElement("a", { href: to, ...props }, children);
    },
  };
});

// Mock TimelinePosition for both @orpheus alias and relative path
const createMockTimeline = (bar = 0, beat = 0, tick = 0) => ({
  bar,
  beat,
  tick,
  ticks: bar * 4 * 480 + beat * 480 + tick,
  compareTo: vi.fn().mockReturnValue(0),
  toMargin: vi.fn().mockReturnValue(0),
  toTicks() {
    return this.bar * 4 * 480 + this.beat * 480 + this.tick;
  },
  toSeconds() {
    return (this.bar * 4 + this.beat) * 0.5 + this.tick * 0.001;
  },
  copy() {
    return createMockTimeline(this.bar, this.beat, this.tick);
  },
  equals: vi.fn().mockReturnValue(true),
  diff() {
    return this;
  },
  add() {
    return this;
  },
  snap() {
    return this;
  },
  translate() {
    return this;
  },
  diffInMargin: vi.fn().mockReturnValue(0),
});

// Create static methods factory
const createMockTimelineStatics = () => ({
  parseFromString: vi.fn().mockImplementation((str) => {
    if (!str) return null;
    return createMockTimeline(1, 0, 0);
  }),
  start: createMockTimeline(0, 0, 0),
  toDisplayString: vi.fn().mockImplementation(() => "0:00:00"),
  fromTicks: vi.fn().mockImplementation(() => createMockTimeline(0, 0, 0)),
  fromSpan: vi.fn().mockReturnValue(createMockTimeline(0, 0, 0)),
  fromSixteenths: vi.fn().mockReturnValue(createMockTimeline(0, 0, 0)),
  fromSeconds: vi.fn().mockReturnValue(createMockTimeline(0, 0, 0)),
  fromMargin: vi.fn().mockReturnValue(createMockTimeline(0, 0, 0)),
  fromTime: vi.fn().mockReturnValue(createMockTimeline(0, 0, 0)),
  fromGrid: vi.fn().mockReturnValue(createMockTimeline(0, 0, 0)),
  add: vi.fn().mockReturnValue(createMockTimeline(0, 0, 0)),
  subtract: vi.fn().mockReturnValue(createMockTimeline(0, 0, 0)),
  compare: vi.fn().mockReturnValue(0),
  max: vi.fn().mockReturnValue(createMockTimeline(0, 0, 0)),
  min: vi.fn().mockReturnValue(createMockTimeline(0, 0, 0)),
  defaultSettings: {
    tempo: 120,
    timeSignature: { beats: 4, noteValue: 4 },
    snap: true,
    snapUnit: "beat",
    horizontalScale: 1,
  },
});

// Common mock module export
const createMockModule = () => ({
  TimelinePosition: Object.assign(
    vi.fn().mockImplementation((bar = 0, beat = 0, tick = 0) => {
      return createMockTimeline(bar, beat, tick);
    }),
    createMockTimelineStatics()
  ),
  TrackType: { Audio: "audio", Midi: "midi", Sequencer: "sequencer" },
  AutomationMode: {
    Off: "off",
    Read: "read",
    Write: "write",
    Touch: "touch",
    Latch: "latch",
    Trim: "trim",
  },
  AutomationLaneEnvelope: {
    Volume: "volume",
    Pan: "pan",
    Send: "send",
    Filter: "filter",
    Tempo: "tempo",
    Effect: "effect",
  },
});

// Mock Canvas and CanvasRenderingContext2D
class MockCanvas {
  width = 800;
  height = 600;

  getContext(contextType: string) {
    if (contextType === "2d") {
      return {
        // Drawing methods
        clearRect: vi.fn(),
        fillRect: vi.fn(),
        strokeRect: vi.fn(),
        rect: vi.fn(),
        beginPath: vi.fn(),
        closePath: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        arc: vi.fn(),
        stroke: vi.fn(),
        fill: vi.fn(),

        // Text methods
        fillText: vi.fn(),
        strokeText: vi.fn(),
        measureText: vi.fn().mockReturnValue({ width: 50 }),

        // Style properties
        fillStyle: "#000000",
        strokeStyle: "#000000",
        lineWidth: 1,
        font: "10px sans-serif",
        textAlign: "start",
        textBaseline: "alphabetic",

        // Path methods
        clip: vi.fn(),
        save: vi.fn(),
        restore: vi.fn(),

        // Transform methods
        translate: vi.fn(),
        rotate: vi.fn(),
        scale: vi.fn(),
        transform: vi.fn(),
        setTransform: vi.fn(),
        resetTransform: vi.fn(),

        // Image methods
        drawImage: vi.fn(),
        createImageData: vi.fn(),
        getImageData: vi.fn(),
        putImageData: vi.fn(),

        // Gradient methods
        createLinearGradient: vi.fn().mockReturnValue({
          addColorStop: vi.fn(),
        }),
        createRadialGradient: vi.fn().mockReturnValue({
          addColorStop: vi.fn(),
        }),

        // Shadow properties
        shadowBlur: 0,
        shadowColor: "rgba(0, 0, 0, 0)",
        shadowOffsetX: 0,
        shadowOffsetY: 0,

        // Compositing
        globalAlpha: 1.0,
        globalCompositeOperation: "source-over",

        // Line styles
        lineCap: "butt",
        lineJoin: "miter",
        miterLimit: 10,
        setLineDash: vi.fn(),
        getLineDash: vi.fn().mockReturnValue([]),
        lineDashOffset: 0,
      };
    }
    return null;
  }

  toDataURL = vi.fn().mockReturnValue("data:image/png;base64,");
  toBlob = vi.fn();
}

// Mock HTMLCanvasElement
global.HTMLCanvasElement = MockCanvas as any;

// Mock canvas creation
const originalCreateElement = document.createElement;
document.createElement = vi.fn().mockImplementation((tagName: string) => {
  if (tagName === "canvas") {
    return new MockCanvas();
  }
  return originalCreateElement.call(document, tagName);
});

vi.mock("@orpheus/types/core", () => createMockModule());

// Also mock the relative path import used by Timeline component
vi.mock("../../../types/core", () => createMockModule());

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
