/**
 * DOM Mock Utilities for Testing
 * 
 * This module provides comprehensive DOM mocking for components that interact
 * with browser APIs not available in Node.js/JSDOM test environments.
 * 
 * The Orpheus Engine DAW relies on many modern browser APIs for:
 * - Audio processing and visualization
 * - Drag and drop operations
 * - Resize detection and responsive layouts
 * - Intersection observation for performance
 * - Animation frame handling for smooth UI
 * 
 * @fileoverview DOM and Browser API mocking utilities
 * @author Orpheus Engine Team
 * @since 2024
 */

import { vi } from "vitest";

/**
 * Audio Context Mock for Web Audio API
 * 
 * The DAW relies heavily on the Web Audio API for audio processing,
 * analysis, and playback. This mock provides all the essential
 * AudioContext functionality needed for testing.
 */
export class MockAudioContext {
  /** Mock sample rate - standard 44.1kHz */
  sampleRate = 44100;
  /** Current time in audio context */
  currentTime = 0;
  /** Audio context state */
  state: AudioContextState = "running";
  
  /** Mock destination node for audio output */
  destination = {
    channelCount: 2,
    channelCountMode: "max" as ChannelCountMode,
    channelInterpretation: "speakers" as ChannelInterpretation,
    connect: vi.fn(),
    disconnect: vi.fn(),
  };

  /**
   * Creates a mock audio buffer for testing
   * @param channels - Number of audio channels
   * @param length - Buffer length in samples
   * @param sampleRate - Sample rate in Hz
   */
  createBuffer(channels: number, length: number, sampleRate: number) {
    return {
      numberOfChannels: channels,
      length,
      sampleRate,
      duration: length / sampleRate,
      getChannelData: vi.fn((channel: number) => {
        // Return a Float32Array with some mock audio data
        const data = new Float32Array(length);
        for (let i = 0; i < length; i++) {
          data[i] = Math.sin((i / sampleRate) * 440 * 2 * Math.PI) * 0.1; // 440Hz sine wave
        }
        return data;
      }),
      copyFromChannel: vi.fn(),
      copyToChannel: vi.fn(),
    };
  }

  /** Mock audio buffer source creation */
  createBufferSource = vi.fn(() => ({
    buffer: null,
    playbackRate: { value: 1 },
    detune: { value: 0 },
    loop: false,
    loopStart: 0,
    loopEnd: 0,
    connect: vi.fn(),
    disconnect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));

  /** Mock gain node creation for volume control */
  createGain = vi.fn(() => ({
    gain: { value: 1 },
    connect: vi.fn(),
    disconnect: vi.fn(),
  }));

  /** Mock analyser node for audio visualization */
  createAnalyser = vi.fn(() => ({
    fftSize: 2048,
    frequencyBinCount: 1024,
    minDecibels: -100,
    maxDecibels: -30,
    smoothingTimeConstant: 0.8,
    getByteFrequencyData: vi.fn(),
    getByteTimeDomainData: vi.fn(),
    getFloatFrequencyData: vi.fn(),
    getFloatTimeDomainData: vi.fn(),
    connect: vi.fn(),
    disconnect: vi.fn(),
  }));

  /** Mock audio decoding for file processing */
  decodeAudioData = vi.fn((audioData: ArrayBuffer) => {
    return Promise.resolve(this.createBuffer(2, 44100, 44100));
  });

  /** Mock context suspension and resumption */
  suspend = vi.fn(() => Promise.resolve());
  resume = vi.fn(() => Promise.resolve());
  close = vi.fn(() => Promise.resolve());
}

/**
 * Sets up comprehensive DOM environment mocking
 * 
 * This function sets up all the browser APIs that are commonly used
 * by DAW components but are not available in Node.js test environments.
 * 
 * Called once during test setup to prepare the global environment.
 */
export function setupDOMEnvironment(): void {
  // Mock ResizeObserver for responsive components
  global.ResizeObserver = vi.fn().mockImplementation((callback) => ({
    observe: vi.fn((element: Element) => {
      // Simulate immediate resize observation
      callback([{
        target: element,
        contentRect: { width: 800, height: 400, top: 0, left: 0, bottom: 400, right: 800 },
        borderBoxSize: [{ inlineSize: 800, blockSize: 400 }],
        contentBoxSize: [{ inlineSize: 800, blockSize: 400 }],
        devicePixelContentBoxSize: [{ inlineSize: 800, blockSize: 400 }],
      }], {} as ResizeObserver);
    }),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));

  // Mock IntersectionObserver for performance optimization
  global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
    root: null,
    rootMargin: "",
    thresholds: [],
  }));

  // Mock requestAnimationFrame for smooth animations
  global.requestAnimationFrame = vi.fn().mockImplementation((callback: FrameRequestCallback) => {
    return setTimeout(() => callback(performance.now()), 16); // ~60fps
  });

  global.cancelAnimationFrame = vi.fn().mockImplementation((id: number) => {
    clearTimeout(id);
  });

  // Mock performance API for timing measurements
  if (typeof global.performance === "undefined") {
    global.performance = {
      now: vi.fn(() => Date.now()),
      mark: vi.fn(),
      measure: vi.fn(),
      getEntriesByName: vi.fn(() => []),
      getEntriesByType: vi.fn(() => []),
      clearMarks: vi.fn(),
      clearMeasures: vi.fn(),
    } as any;
  }

  // Mock Web Audio API
  global.AudioContext = MockAudioContext as any;
  global.webkitAudioContext = MockAudioContext as any;
  
  // Mock URL.createObjectURL for file handling
  global.URL = global.URL || {};
  global.URL.createObjectURL = vi.fn(() => "blob:mock-url");
  global.URL.revokeObjectURL = vi.fn();

  // Mock FileReader for file upload handling
  global.FileReader = vi.fn().mockImplementation(() => ({
    readAsArrayBuffer: vi.fn(),
    readAsDataURL: vi.fn(),
    readAsText: vi.fn(),
    abort: vi.fn(),
    result: null,
    error: null,
    readyState: 0,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })) as any;
}

/**
 * Creates mock drag and drop events for testing
 * 
 * The DAW uses drag and drop extensively for arranging clips,
 * tracks, and effects. This factory creates proper mock events.
 * 
 * @param type - Event type ('dragstart', 'dragover', etc.)
 * @param dataTransfer - Optional mock DataTransfer object
 */
export function createMockDragEvent(
  type: string,
  dataTransfer?: Partial<DataTransfer>
): DragEvent {
  const mockDataTransfer = {
    dropEffect: "none" as const,
    effectAllowed: "uninitialized" as const,
    files: [] as any,
    items: [] as any,
    types: [],
    setData: vi.fn(),
    getData: vi.fn(() => ""),
    clearData: vi.fn(),
    setDragImage: vi.fn(),
    ...dataTransfer,
  };

  return new DragEvent(type, {
    bubbles: true,
    cancelable: true,
    dataTransfer: mockDataTransfer as DataTransfer,
  });
}

/**
 * Creates mock touch events for mobile/tablet support
 * 
 * While primarily a desktop DAW, some components support
 * touch interactions for accessibility and future mobile support.
 * 
 * @param type - Touch event type
 * @param touches - Array of touch points
 */
export function createMockTouchEvent(
  type: string,
  touches: Array<{ clientX: number; clientY: number; identifier: number }> = []
): TouchEvent {
  const mockTouches = touches.map(touch => ({
    ...touch,
    target: document.body,
    pageX: touch.clientX,
    pageY: touch.clientY,
    screenX: touch.clientX,
    screenY: touch.clientY,
    radiusX: 10,
    radiusY: 10,
    rotationAngle: 0,
    force: 1,
  }));

  return new TouchEvent(type, {
    bubbles: true,
    cancelable: true,
    touches: mockTouches as any,
    targetTouches: mockTouches as any,
    changedTouches: mockTouches as any,
  });
}

/**
 * Mock MediaStream for audio input testing
 * 
 * Used when testing microphone input and audio recording
 * functionality in the DAW.
 */
export class MockMediaStream {
  id = "mock-stream-id";
  active = true;
  
  getTracks = vi.fn(() => []);
  getAudioTracks = vi.fn(() => []);
  getVideoTracks = vi.fn(() => []);
  addTrack = vi.fn();
  removeTrack = vi.fn();
  clone = vi.fn(() => new MockMediaStream());
  addEventListener = vi.fn();
  removeEventListener = vi.fn();
  dispatchEvent = vi.fn();
}

/**
 * Sets up media device mocking for audio input/output
 * 
 * Mocks navigator.mediaDevices for testing audio device
 * selection and microphone access.
 */
export function setupMediaDevicesMock(): void {
  Object.defineProperty(navigator, "mediaDevices", {
    value: {
      getUserMedia: vi.fn(() => Promise.resolve(new MockMediaStream())),
      enumerateDevices: vi.fn(() => Promise.resolve([
        {
          deviceId: "default",
          kind: "audioinput" as MediaDeviceKind,
          label: "Default Microphone",
          groupId: "group1",
          toJSON: vi.fn(),
        },
        {
          deviceId: "speakers",
          kind: "audiooutput" as MediaDeviceKind,
          label: "Default Speakers",
          groupId: "group2",
          toJSON: vi.fn(),
        },
      ])),
      getSupportedConstraints: vi.fn(() => ({})),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    },
    writable: true,
  });
}

/**
 * Comprehensive DOM mock setup for DAW testing
 * 
 * This is the main function to call in test setup files.
 * It configures all necessary browser API mocks for the DAW.
 * 
 * @returns Cleanup function to restore original implementations
 */
export function setupDAWTestEnvironment(): () => void {
  // Store original implementations for cleanup
  const originalAPIs = {
    ResizeObserver: global.ResizeObserver,
    IntersectionObserver: global.IntersectionObserver,
    requestAnimationFrame: global.requestAnimationFrame,
    cancelAnimationFrame: global.cancelAnimationFrame,
    AudioContext: global.AudioContext,
    URL: global.URL,
    FileReader: global.FileReader,
  };

  // Set up all mocks
  setupDOMEnvironment();
  setupMediaDevicesMock();

  // Return cleanup function
  return () => {
    // Restore original implementations
    Object.assign(global, originalAPIs);
  };
}

/**
 * Default export for convenient importing
 */
export default {
  setupDOMEnvironment,
  setupDAWTestEnvironment,
  createMockDragEvent,
  createMockTouchEvent,
  MockAudioContext,
  MockMediaStream,
};
