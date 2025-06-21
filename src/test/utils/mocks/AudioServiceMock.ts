/**
 * AudioService Mock Implementation
 * Used to prevent errors with AudioContext in test environment
 */

import { vi } from 'vitest';

// Mock AudioNode type
export interface MockAudioNode {
  connect: (destination: MockAudioNode) => MockAudioNode;
  disconnect: () => void;
}

// Mock GainNode type
export interface MockGainNode extends MockAudioNode {
  gain: { value: number };
}

// Mock AnalyserNode type
export interface MockAnalyserNode extends MockAudioNode {
  fftSize: number;
  frequencyBinCount: number;
  getByteFrequencyData: (array: Uint8Array) => void;
  getByteTimeDomainData: (array: Uint8Array) => void;
}

// Mock AudioContext
export class MockAudioContext {
  public destination: MockAudioNode = {
    connect: vi.fn(),
    disconnect: vi.fn()
  };
  
  public sampleRate: number = 44100;
  public currentTime: number = 0;
  public state: AudioContextState = 'running';
  
  constructor() {}
  
  public createGain(): MockGainNode {
    return {
      gain: { value: 1 },
      connect: vi.fn().mockReturnThis(),
      disconnect: vi.fn()
    };
  }
  
  public createAnalyser(): MockAnalyserNode {
    return {
      fftSize: 2048,
      frequencyBinCount: 1024,
      getByteFrequencyData: vi.fn((array) => {
        if (array) {
          for (let i = 0; i < array.length; i++) {
            array[i] = Math.floor(Math.random() * 256);
          }
        }
      }),
      getByteTimeDomainData: vi.fn((array) => {
        if (array) {
          for (let i = 0; i < array.length; i++) {
            array[i] = Math.floor(128 + Math.random() * 10);
          }
        }
      }),
      connect: vi.fn().mockReturnThis(),
      disconnect: vi.fn()
    };
  }
  
  public createOscillator() {
    return {
      frequency: { value: 440 },
      type: 'sine',
      connect: vi.fn().mockReturnThis(),
      disconnect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn()
    };
  }
  
  public createBufferSource() {
    return {
      buffer: null,
      loop: false,
      connect: vi.fn().mockReturnThis(),
      disconnect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn()
    };
  }
  
  public resume() {
    this.state = 'running';
    return Promise.resolve();
  }
  
  public suspend() {
    this.state = 'suspended';
    return Promise.resolve();
  }
  
  public close() {
    this.state = 'closed';
    return Promise.resolve();
  }
}

/**
 * Setup global AudioContext mock
 * Call this function in test setup files or before running tests
 */
export function setupGlobalAudioContextMock(): void {
  const mockAudioContextFactory = () => new MockAudioContext();
  
  if (typeof window !== 'undefined') {
    // @ts-ignore: Mock implementation
    window.AudioContext = vi.fn().mockImplementation(mockAudioContextFactory);
    // @ts-ignore: Mock implementation
    window.webkitAudioContext = vi.fn().mockImplementation(mockAudioContextFactory);
  }
  
  global.AudioContext = vi.fn().mockImplementation(mockAudioContextFactory);
  global.webkitAudioContext = global.AudioContext;
}

export class AudioServiceMock {
  private static instance: AudioServiceMock;
  private isInitialized = false;
  private context: MockAudioContext;
  
  private constructor() {
    this.context = new MockAudioContext();
  }

  public static getInstance(): AudioServiceMock {
    if (!AudioServiceMock.instance) {
      AudioServiceMock.instance = new AudioServiceMock();
    }
    return AudioServiceMock.instance;
  }

  public initializeAudioContext(): void {
    console.log('Mock Audio Context initialized');
    this.isInitialized = true;
  }

  public getAudioContext(): MockAudioContext {
    return this.context;
  }

  public isAudioContextInitialized(): boolean {
    return this.isInitialized;
  }

  // Mock methods for audio processing
  public createAudioMeter(): any {
    return {
      connect: vi.fn().mockReturnThis(),
      disconnect: vi.fn(),
      getMeteringLevel: vi.fn().mockReturnValue(0.5),
      getPeakLevel: vi.fn().mockReturnValue(0.8),
      reset: vi.fn()
    };
  }

  public createTrackAnalyser(): any {
    return {
      connect: vi.fn().mockReturnThis(),
      disconnect: vi.fn(),
      getFrequencyData: vi.fn().mockReturnValue(new Uint8Array(128).fill(50)),
      getWaveformData: vi.fn().mockReturnValue(new Uint8Array(128).fill(128)),
      isActive: vi.fn().mockReturnValue(true)
    };
  }
}

// Set up mocks immediately to prevent AudioContext errors
setupGlobalAudioContextMock();

// Export instances and utilities
export const audioService = AudioServiceMock.getInstance();
export default AudioServiceMock;
