import { describe, test, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders as render, screen, fireEvent, act } from '../../../test/testUtils';
import AudioRecorderComponent from '../AudioRecorderComponent';
import { AudioRecorder } from '../../../services/audio/audioRecorder';

// Mock AudioRecorder
vi.mock('../../../services/audio/audioRecorder', () => {
  return {
    AudioRecorder: vi.fn().mockImplementation(() => ({
      isRecording: false,
      getAudioInputDevices: vi.fn().mockResolvedValue([
        { deviceId: 'default', kind: 'audioinput', label: 'Default Microphone' },
        { deviceId: 'remote1', kind: 'audioinput', label: 'Remote Source 1' }
      ]),
      startRecording: vi.fn().mockResolvedValue(undefined),
      stopRecording: vi.fn().mockResolvedValue(new Blob([], { type: 'audio/webm' })),
      dispose: vi.fn()
    }))
  };
});

describe('AudioRecorderComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  test('renders with device selection', async () => {
    render(<AudioRecorderComponent />);
    
    // Wait for device loading to complete
    await screen.findByText('Audio Recorder');
    
    // Should show a select dropdown
    const dropdown = screen.getByTestId('audio-device-select');
    expect(dropdown).toBeInTheDocument();
    
    // Should have a start recording button
    const startButton = screen.getByTestId('start-recording-button');
    expect(startButton).toBeInTheDocument();
    expect(startButton).not.toBeDisabled();
  });
  
  test('starts and stops recording', async () => {
    const mockOnRecordingComplete = vi.fn();
    render(<AudioRecorderComponent onRecordingComplete={mockOnRecordingComplete} />);
    
    // Wait for device loading
    await screen.findByText('Audio Recorder');
    
    // Start recording
    const startButton = screen.getByTestId('start-recording-button');
    fireEvent.click(startButton);
    
    // Should show recording indicator
    await screen.findByText(/Recording: 00:00/i);
    
    // Stop recording
    const stopButton = await screen.findByTestId('stop-recording-button');
    await act(async () => {
      fireEvent.click(stopButton);
    });
    
    // Should call onRecordingComplete with the blob
    expect(mockOnRecordingComplete).toHaveBeenCalled();
    expect(mockOnRecordingComplete.mock.calls[0][0]).toBeInstanceOf(Blob);
  });
  
  test('handles device selection', async () => {
    render(<AudioRecorderComponent />);
    
    // Wait for device loading
    await screen.findByText('Audio Recorder');
    
    // Check if AudioRecorder.getAudioInputDevices was called
    expect(AudioRecorder.prototype.getAudioInputDevices).toHaveBeenCalled();
    
    // Change device
    const dropdown = screen.getByTestId('audio-device-select');
    fireEvent.change(dropdown, { target: { value: 'remote1' } });
    
    // Start recording with selected device
    const startButton = screen.getByTestId('start-recording-button');
    fireEvent.click(startButton);
    
    // Check if startRecording was called with the correct device
    expect(AudioRecorder.prototype.startRecording).toHaveBeenCalledWith(
      expect.objectContaining({ deviceId: 'remote1' })
    );
  });
});
