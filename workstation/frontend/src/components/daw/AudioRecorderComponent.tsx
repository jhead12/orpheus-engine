import React, { useState, useEffect, useCallback } from 'react';
import { AudioRecorder } from '../../services/audio/audioRecorder';
import { Button, Box, FormControl, InputLabel, Select, MenuItem, Typography } from '@mui/material';

interface AudioRecorderComponentProps {
  onRecordingComplete?: (audioBlob: Blob) => void;
}

/**
 * Component for recording audio in the DAW
 */
const AudioRecorderComponent: React.FC<AudioRecorderComponentProps> = ({ onRecordingComplete }) => {
  const [recorder] = useState(() => new AudioRecorder());
  const [isRecording, setIsRecording] = useState(false);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [timer, setTimer] = useState<number | null>(null);

  // Load available audio devices
  useEffect(() => {
    const loadDevices = async () => {
      try {
        const devices = await recorder.getAudioInputDevices();
        setAudioDevices(devices);
        
        // Auto-select first device if available
        if (devices.length > 0 && !selectedDeviceId) {
          setSelectedDeviceId(devices[0].deviceId);
        }
      } catch (error) {
        console.error('Failed to load audio devices:', error);
      }
    };

    loadDevices();

    // Cleanup
    return () => {
      recorder.dispose();
      if (timer) {
        window.clearInterval(timer);
      }
    };
  }, []);

  // Handle device selection
  const handleDeviceChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedDeviceId(event.target.value as string);
  };

  // Start recording
  const startRecording = useCallback(async () => {
    try {
      await recorder.startRecording({ deviceId: selectedDeviceId });
      setIsRecording(true);
      
      // Start timer to track recording duration
      const intervalId = window.setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
      
      setTimer(intervalId as unknown as number);
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  }, [recorder, selectedDeviceId]);

  // Stop recording
  const stopRecording = useCallback(async () => {
    try {
      if (timer) {
        window.clearInterval(timer);
        setTimer(null);
      }
      
      const audioBlob = await recorder.stopRecording();
      setIsRecording(false);
      setRecordingDuration(0);
      
      // Notify parent component
      if (onRecordingComplete) {
        onRecordingComplete(audioBlob);
      }
    } catch (error) {
      console.error('Failed to stop recording:', error);
    }
  }, [recorder, timer, onRecordingComplete]);

  // Format seconds as MM:SS
  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <Box sx={{ margin: 2 }}>
      <Typography variant="h6" gutterBottom>
        Audio Recorder
      </Typography>
      
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <FormControl sx={{ minWidth: 200, mr: 2 }}>
          <InputLabel id="audio-device-label">Audio Input</InputLabel>
          <Select
            labelId="audio-device-label"
            value={selectedDeviceId}
            onChange={handleDeviceChange}
            disabled={isRecording}
            label="Audio Input"
            data-testid="audio-device-select"
          >
            {audioDevices.map(device => (
              <MenuItem key={device.deviceId} value={device.deviceId}>
                {device.label || `Device ${device.deviceId}`}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        {isRecording ? (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                bgcolor: 'error.main',
                mr: 1,
                animation: 'pulse 1.5s infinite'
              }}
            />
            <Typography variant="body2" sx={{ mr: 2 }}>
              Recording: {formatDuration(recordingDuration)}
            </Typography>
            <Button 
              variant="contained" 
              color="error" 
              onClick={stopRecording}
              data-testid="stop-recording-button"
            >
              Stop Recording
            </Button>
          </Box>
        ) : (
          <Button 
            variant="contained" 
            color="primary" 
            onClick={startRecording}
            disabled={!selectedDeviceId}
            data-testid="start-recording-button"
          >
            Start Recording
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default AudioRecorderComponent;
