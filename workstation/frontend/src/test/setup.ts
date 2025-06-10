// Test setup file for audio testing
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock AudioBuffer with proper getChannelData
class MockAudioBuffer {
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

// Mock Web Audio API
class MockAudioContext {
  sampleRate = 44100;
  destination = {
    channelCount: 2,
    channelCountMode: 'explicit',
    channelInterpretation: 'speakers'
  };
  currentTime = 0;
  state = 'running';

  createMediaStreamDestination = vi.fn().mockReturnValue({
    stream: {
      getTracks: () => [{ kind: 'audio' }],
    }
  });
  createGain = vi.fn().mockReturnValue({
    connect: vi.fn(),
    gain: { value: 1 }
  });
  createAnalyser = vi.fn().mockReturnValue({
    connect: vi.fn(),
    fftSize: 2048,
    getByteTimeDomainData: vi.fn(),
  });
  createBufferSource = vi.fn().mockReturnValue({
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
  });
  createMediaStreamSource = vi.fn().mockReturnValue({
    connect: vi.fn(),
  });
  
  decodeAudioData = vi.fn((arrayBuffer: ArrayBuffer) => {
    return Promise.resolve(new MockAudioBuffer({
      numberOfChannels: 2,
      length: 44100,
      sampleRate: 44100,
    }));
  });
  
  resume = vi.fn().mockResolvedValue(undefined);
  suspend = vi.fn().mockResolvedValue(undefined);
}

// Mock MediaRecorder
class MockMediaRecorder {
  start = vi.fn();
  stop = vi.fn();
  ondataavailable: ((event: any) => void) | null = null;
  onstop: ((event: any) => void) | null = null;
  state = 'inactive';
  stream: any;
  
  constructor(stream: any) {
    this.stream = stream;
  }
  
  // Simulate data generation
  simulateDataAvailable(data: any) {
    if (this.ondataavailable) {
      this.ondataavailable({ data } as any);
    }
  }
  
  // Simulate stopping
  simulateStop() {
    this.state = 'inactive';
    if (this.onstop) {
      this.onstop(new Event('stop'));
    }
  }

  static isTypeSupported(type: string): boolean {
    return true;
  }
}

// Define MediaStream mock
class MockMediaStream {
  tracks: any[] = [];
  
  addTrack(track: any) {
    this.tracks.push(track);
  }
  
  getTracks() {
    return this.tracks;
  }
  
  getAudioTracks() {
    return this.tracks.filter((track: any) => track.kind === 'audio');
  }
}

// Set up global mocks
(global as any).AudioContext = MockAudioContext;
(global as any).AudioBuffer = MockAudioBuffer;
(global as any).MediaRecorder = MockMediaRecorder;
(global as any).MediaStream = MockMediaStream;

// Mock HTMLCanvasElement for visualization components
HTMLCanvasElement.prototype.getContext = vi.fn((contextType: string) => {
  if (contextType === '2d') {
    return {
      fillRect: vi.fn(),
      clearRect: vi.fn(),
      getImageData: vi.fn(() => ({ data: new Uint8ClampedArray(4) })),
      putImageData: vi.fn(),
      createImageData: vi.fn(() => ({ data: new Uint8ClampedArray(4) })),
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
      canvas: {
        width: 800,
        height: 400,
      },
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 1,
      font: '10px Arial',
      textAlign: 'start',
      textBaseline: 'alphabetic',
      globalAlpha: 1,
      shadowColor: 'rgba(0, 0, 0, 0)',
      shadowBlur: 0,
      shadowOffsetX: 0,
      shadowOffsetY: 0,
    } as any;
  }
  return null;
}) as any;

// Mock getUserMedia
Object.defineProperty(global.navigator, 'mediaDevices', {
  value: {
    getUserMedia: vi.fn().mockResolvedValue(new MockMediaStream()),
    enumerateDevices: vi.fn().mockResolvedValue([
      { deviceId: 'default', kind: 'audioinput', label: 'Default Microphone' },
      { deviceId: 'remote1', kind: 'audioinput', label: 'Remote Source 1' },
      { deviceId: 'remote2', kind: 'audioinput', label: 'Remote Source 2' }
    ]),
  },
  configurable: true,
});
