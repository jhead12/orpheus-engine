import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import AudioRecorderComponent from './AudioRecorderComponent';
import { AudioRecorder } from '../../services/audio/audioRecorder';
import { DAWProvider } from '../../contexts/DAWContext';
import { MixerProvider } from '../../contexts/MixerContext';

// Mock AudioRecorder
vi.mock('../../services/audio/audioRecorder', () => {
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

// Test wrapper with required providers
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <MixerProvider>
    <DAWProvider>
      {children}
    </DAWProvider>
  </MixerProvider>
);

describe('AudioRecorderComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  test('renders with device selection', async () => {
    render(
      <TestWrapper>
        <AudioRecorderComponent />
      </TestWrapper>
    );
    
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
    render(
      <TestWrapper>
        <AudioRecorderComponent onRecordingComplete={mockOnRecordingComplete} />
      </TestWrapper>
    );
    
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
    render(
      <TestWrapper>
        <AudioRecorderComponent />
      </TestWrapper>
    );
    
    // Wait for device loading
    await screen.findByText('Audio Recorder');
    
    // Check if AudioRecorder.getAudioInputDevices was called
    expect(AudioRecorder.prototype.getAudioInputDevices).toHaveBeenCalled();
  });
});
