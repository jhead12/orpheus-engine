// Test setup file for audio testing
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Web Audio API
class MockAudioContext {
  destination = {
    channelCount: 2,
    channelCountMode: 'explicit',
    channelInterpretation: 'speakers'
  };
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
(global as any).MediaRecorder = MockMediaRecorder;
(global as any).MediaStream = MockMediaStream;

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
