import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useDAW } from '../../contexts/DAWContext';
import { Button, Box, FormControl, InputLabel, Select, MenuItem, Typography } from '@mui/material';

interface AudioRecorderComponentProps {
  onRecordingComplete?: (audioBlob: Blob) => void;
}

/**
 * Component for recording audio in the DAW
 */
const AudioRecorderComponent: React.FC<AudioRecorderComponentProps> = ({ onRecordingComplete }) => {
  const { audioService, clipService } = useDAW();
  const [isRecording, setIsRecording] = useState(false);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [timer, setTimer] = useState<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  // Load available audio devices
  useEffect(() => {
    const loadDevices = async () => {
      try {
        const devices = await audioService.getAudioInputDevices();
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
      if (timer) {
        window.clearInterval(timer);
      }
      // Only stop recording on cleanup, don't dispose the service
      if (isRecording) {
        audioService.stop();
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
      setIsRecording(true);
      await audioService.startRecording({ deviceId: selectedDeviceId });
      
      // Start timer to track recording duration
      const intervalId = window.setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
      
      setTimer(intervalId as unknown as number);
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  }, [audioService, selectedDeviceId]);

  // Stop recording
  const stopRecording = useCallback(async () => {
    try {
      if (timer) {
        window.clearInterval(timer);
        setTimer(null);
      }
      
      const recordedBuffer = await audioService.stop();
      setIsRecording(false);
      setRecordingDuration(0);
      
      // Notify parent component
      if (onRecordingComplete && recordedBuffer) {
        const newClip = clipService.createClip('recording', { buffer: recordedBuffer });
        onRecordingComplete(newClip);
      }
    } catch (error) {
      console.error('Failed to stop recording:', error);
    }
  }, [audioService, timer, onRecordingComplete, clipService]);

  // Format seconds as MM:SS
  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Waveform visualization
  useEffect(() => {
    if (isRecording) {
      drawWaveform();
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }
  }, [isRecording]);

  const drawWaveform = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      const data = audioService.getWaveformData();
      // Draw waveform logic here
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.beginPath();
      ctx.strokeStyle = '#646cff';
      ctx.lineWidth = 2;
      
      const sliceWidth = canvas.width / data.length;
      let x = 0;
      
      for (let i = 0; i < data.length; i++) {
        const v = data[i] / 128.0;
        const y = (v * canvas.height) / 2;
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
        x += sliceWidth;
      }
      
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
      
      animationRef.current = requestAnimationFrame(draw);
    };
    
    draw();
  };

  const handleRecord = async () => {
    const audioBuffer = new ArrayBuffer(1024);
    const uint8Data = await Promise.resolve(new Uint8Array(audioBuffer));
    
    // Check the actual length of the resolved data
    if (uint8Data.length > 0) {
      const firstByte = uint8Data[0];
      console.log('First byte:', firstByte);
    }

    const audioData = {
      type: 'audio' as const,
      waveform: new Float32Array(1024),
      buffer: audioBuffer
    };

    const clipBlob = new Blob([audioBuffer]);
    // Process the blob
  };

  const handleInputChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    // Convert to the expected SelectChangeEvent format
    const value = event.target.value as string;
    console.log('Input changed:', value);
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

      <div className="waveform-container">
        <canvas ref={canvasRef} width="600" height="100" />
      </div>

      <select onChange={handleInputChange}>
        <option value="default">Default Input</option>
      </select>
    </Box>
  );
};

export default AudioRecorderComponent;
