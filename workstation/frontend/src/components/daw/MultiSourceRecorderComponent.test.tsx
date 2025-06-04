/// <reference types="vitest" />
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import MultiSourceRecorderComponent from './MultiSourceRecorderComponent';
import { MultiSourceRecorder } from '../../services/audio/multiSourceRecorder';
import { AudioRecorder } from '../../services/audio/audioRecorder';

// Mock AudioRecorder and MultiSourceRecorder
vi.mock('../../services/audio/audioRecorder', () => {
  return {
    AudioRecorder: vi.fn().mockImplementation(() => ({
      getAudioInputDevices: vi.fn().mockResolvedValue([
        { deviceId: 'default', kind: 'audioinput', label: 'Default Microphone' },
        { deviceId: 'remote1', kind: 'audioinput', label: 'Remote Source 1' },
        { deviceId: 'remote2', kind: 'audioinput', label: 'Remote Source 2' }
      ]),
      dispose: vi.fn()
    }))
  };
});

vi.mock('../../services/audio/multiSourceRecorder', () => {
  return {
    MultiSourceRecorder: vi.fn().mockImplementation(() => ({
      activeSources: [],
      isRecording: false,
      syncEnabled: false,
      enableSynchronization: vi.fn(),
      addSource: vi.fn().mockResolvedValue(undefined),
      removeSource: vi.fn(),
      startRecording: vi.fn().mockResolvedValue(undefined),
      stopRecording: vi.fn().mockResolvedValue([
        new Blob([], { type: 'audio/webm' }),
        new Blob([], { type: 'audio/webm' })
      ]),
      dispose: vi.fn()
    }))
  };
});

describe('MultiSourceRecorderComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  test('renders with available devices', async () => {
    render(<MultiSourceRecorderComponent />);
    
    // Wait for component to load
    await screen.findByText('Multi-Source Recorder');
    
    // Should show synchronize toggle
    const syncToggle = screen.getByTestId('sync-toggle');
    expect(syncToggle).toBeInTheDocument();
    
    // Should show "No sources added"
    expect(screen.getByText('No sources added')).toBeInTheDocument();
    
    // Should show available sources
    expect(screen.getByText('Available Sources')).toBeInTheDocument();
    
    // Should have a disabled start button (no sources added yet)
    const startButton = screen.getByTestId('start-multi-recording-button');
    expect(startButton).toBeInTheDocument();
    expect(startButton).toBeDisabled();
  });
  
  test('adds and removes sources', async () => {
    render(<MultiSourceRecorderComponent />);
    
    // Wait for component to load
    await screen.findByText('Multi-Source Recorder');
    
    // Add Default Microphone
    const defaultMicSource = await screen.findByTestId('add-source-default');
    await act(async () => {
      fireEvent.click(defaultMicSource);
    });
    
    // Wait for source list to update
    await screen.findByText('Default Microphone');
    
    // Check if MultiSourceRecorder.addSource was called
    expect(MultiSourceRecorder.prototype.addSource).toHaveBeenCalledWith('default', 'Default Microphone');
    
    // Add Remote Source 1
    const remoteSource = await screen.findByTestId('add-source-remote1');
    await act(async () => {
      fireEvent.click(remoteSource);
    });
    
    // Check if Start button is enabled now
    const startButton = screen.getByTestId('start-multi-recording-button');
    expect(startButton).not.toBeDisabled();
    
    // Remove Default Microphone
    const removeSource = await screen.findByTestId('remove-source-default');
    await act(async () => {
      fireEvent.click(removeSource);
    });
    
    // Check if MultiSourceRecorder.removeSource was called
    expect(MultiSourceRecorder.prototype.removeSource).toHaveBeenCalledWith('default');
  });
  
  test('toggles synchronization', async () => {
    render(<MultiSourceRecorderComponent />);
    
    // Wait for component to load
    await screen.findByText('Multi-Source Recorder');
    
    // Toggle synchronization
    const syncToggle = screen.getByTestId('sync-toggle');
    fireEvent.click(syncToggle);
    
    // Check if MultiSourceRecorder.enableSynchronization was called
    expect(MultiSourceRecorder.prototype.enableSynchronization).toHaveBeenCalled();
  });
  
  test('starts and stops recording', async () => {
    // Reset mocks to avoid issues
    vi.clearAllMocks();
    
    // Use beforeEach setup to provide mock implementation with one source
    const mockMultiSourceRecorderInstance = {
      activeSources: [
        { 
          deviceId: 'default', 
          isRecording: false, 
          label: 'Default Microphone', 
          recorder: new AudioRecorder() 
        }
      ],
      isRecording: false,
      syncEnabled: false,
      enableSynchronization: vi.fn(),
      addSource: vi.fn().mockResolvedValue(undefined),
      removeSource: vi.fn(),
      startRecording: vi.fn().mockResolvedValue(undefined),
      stopRecording: vi.fn().mockResolvedValue([
        new Blob([], { type: 'audio/webm' })
      ]),
      dispose: vi.fn()
    };
    
    const mockOnRecordingsComplete = vi.fn();
    render(<MultiSourceRecorderComponent onRecordingsComplete={mockOnRecordingsComplete} />);
    
    // Wait for component to load and add a source
    await screen.findByText('Multi-Source Recorder');
    
    // Start recording
    const startButton = screen.getByTestId('start-multi-recording-button');
    expect(startButton).not.toBeDisabled(); // Should be enabled as we mocked active sources
    await act(async () => {
      fireEvent.click(startButton);
    });
    
    // Check if MultiSourceRecorder.startRecording was called
    expect(MultiSourceRecorder.prototype.startRecording).toHaveBeenCalled();
    
    // Stop recording
    const stopButton = await screen.findByTestId('stop-multi-recording-button');
    await act(async () => {
      fireEvent.click(stopButton);
    });
    
    // Check if MultiSourceRecorder.stopRecording was called
    expect(MultiSourceRecorder.prototype.stopRecording).toHaveBeenCalled();
    
    // Should call onRecordingsComplete with the blobs
    expect(mockOnRecordingsComplete).toHaveBeenCalled();
    expect(mockOnRecordingsComplete.mock.calls[0][0]).toBeInstanceOf(Array);
    expect(mockOnRecordingsComplete.mock.calls[0][0][0]).toBeInstanceOf(Blob);
  });
});
