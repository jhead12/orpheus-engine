// Test setup file for audio testing
import '@testing-library/jest-dom';

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
  ondataavailable = null;
  onstop = null;
  state = 'inactive';
  
  constructor(stream) {
    this.stream = stream;
  }
  
  // Simulate data generation
  simulateDataAvailable(data) {
    if (this.ondataavailable) {
      this.ondataavailable(new Event('dataavailable', { data }));
    }
  }
  
  // Simulate stopping
  simulateStop() {
    this.state = 'inactive';
    if (this.onstop) {
      this.onstop(new Event('stop'));
    }
  }
}

// Define MediaStream mock
class MockMediaStream {
  tracks = [];
  
  addTrack(track) {
    this.tracks.push(track);
  }
  
  getTracks() {
    return this.tracks;
  }
  
  getAudioTracks() {
    return this.tracks.filter(track => track.kind === 'audio');
  }
}

// Set up global mocks
global.AudioContext = MockAudioContext;
global.MediaRecorder = MockMediaRecorder;
global.MediaStream = MockMediaStream;

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
