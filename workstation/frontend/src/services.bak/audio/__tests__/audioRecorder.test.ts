import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { AudioRecorder } from '../audioRecorder';

// Mock electron if needed
vi.mock('../../electron/utils', () => ({
  electronAPI: {
    invoke: vi.fn(),
  },
  isElectron: vi.fn().mockReturnValue(true),
}));

// Mock navigator.mediaDevices
Object.defineProperty(global.navigator, 'mediaDevices', {
  value: {
    getUserMedia: vi.fn().mockResolvedValue({}),
    enumerateDevices: vi.fn().mockResolvedValue([
      { deviceId: 'default', kind: 'audioinput', label: 'Default Microphone' },
      { deviceId: 'device1', kind: 'audioinput', label: 'Remote Source 1' },
      { deviceId: 'device2', kind: 'audioinput', label: 'Remote Source 2' },
    ])
  },
  configurable: true
});

// Mock MediaRecorder
global.MediaRecorder = vi.fn().mockImplementation(() => ({
  start: vi.fn(),
  stop: vi.fn(),
  state: 'inactive',
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
}));

describe('AudioRecorder', () => {
  let audioRecorder: AudioRecorder;
  
  beforeEach(() => {
    audioRecorder = new AudioRecorder();
  });
  
  afterEach(() => {
    vi.clearAllMocks();
  });
  
  test('should initialize with default settings', () => {
    expect(audioRecorder).toBeDefined();
    expect(audioRecorder.isRecording).toBe(false);
  });
  
  test('should start recording when startRecording is called', async () => {
    await audioRecorder.startRecording();
    expect(audioRecorder.isRecording).toBe(true);
  });
  
  test('should stop recording when stopRecording is called', async () => {
    await audioRecorder.startRecording();
    
    // Mock MediaRecorder dataavailable event
    const mockBlob = new Blob([], { type: 'audio/webm' });
    const mockDataAvailable = new Event('dataavailable');
    Object.defineProperty(mockDataAvailable, 'data', { value: mockBlob });
    
    // Simulate recording stop by calling event handlers directly
    const startRecordingPromise = audioRecorder.stopRecording();
    
    // Trigger the dataavailable event handler
    const dataAvailableHandler = vi.mocked(MediaRecorder).mock.instances[0].addEventListener.mock.calls[0][1];
    dataAvailableHandler(mockDataAvailable);
    
    // Trigger the stop event handler
    const stopHandler = vi.mocked(MediaRecorder).mock.instances[0].addEventListener.mock.calls[1][1];
    stopHandler();
    
    const recordingData = await startRecordingPromise;
    
    expect(audioRecorder.isRecording).toBe(false);
    expect(recordingData).toBeDefined();
    expect(recordingData).toBeInstanceOf(Blob);
  });
  
  test('should list available audio input devices', async () => {
    const devices = await audioRecorder.getAudioInputDevices();
    
    expect(devices).toHaveLength(3);
    expect(devices[0].label).toBe('Default Microphone');
    expect(navigator.mediaDevices.enumerateDevices).toHaveBeenCalled();
  });
  
  test('should allow recording from a specific device', async () => {
    await audioRecorder.startRecording({ deviceId: 'device1' });
    expect(audioRecorder.isRecording).toBe(true);
    expect(audioRecorder.currentDeviceId).toBe('device1');
    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith(
      expect.objectContaining({
        audio: expect.objectContaining({
          deviceId: expect.objectContaining({ exact: 'device1' })
        })
      })
    );
  });
});
