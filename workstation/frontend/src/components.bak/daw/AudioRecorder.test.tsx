import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock electron if needed
vi.mock('../../services/electron/utils', () => ({
  electronAPI: {
    invoke: vi.fn(),
  },
  isElectron: vi.fn().mockReturnValue(true),
}));

// This is a placeholder for your audio recorder service
// Replace with the actual path when implemented
import { AudioRecorder } from '../../services/audio/audioRecorder';

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
    const recordingData = await audioRecorder.stopRecording();
    
    expect(audioRecorder.isRecording).toBe(false);
    expect(recordingData).toBeDefined();
  });
  
  test('should list available audio input devices', async () => {
    const devices = await audioRecorder.getAudioInputDevices();
    
    expect(devices).toHaveLength(3); // From our mock setup
    expect(devices[0].label).toBe('Default Microphone');
  });
  
  test('should allow recording from a specific device', async () => {
    await audioRecorder.startRecording({ deviceId: 'remote1' });
    expect(audioRecorder.isRecording).toBe(true);
    expect(audioRecorder.currentDeviceId).toBe('remote1');
  });
});
