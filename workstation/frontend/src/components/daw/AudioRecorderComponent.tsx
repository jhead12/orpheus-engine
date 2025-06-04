import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useDAW } from '../../contexts/DAWContext';
import { Button, Box, FormControl, InputLabel, Select, MenuItem, Typography, SelectChangeEvent } from '@mui/material';

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
        audioService.stopRecording().catch(err => 
          console.error('Error while stopping recording on cleanup:', err)
        );
      }
    };
  }, []);

  // No longer needed handleDeviceChange - we handle directly in onChange

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
      
      const recordedBuffer = await audioService.stopRecording();
      setIsRecording(false);
      setRecordingDuration(0);
      
      // Notify parent component
      if (onRecordingComplete && recordedBuffer) {
        // Create proper AudioData structure
        const audioData = {
          type: 'audio' as const,
          buffer: recordedBuffer,
          waveform: Array.from(recordedBuffer.getChannelData(0)).slice(0, 1000).map(Number) // Sample first 1000 points for waveform and ensure they are numbers
        };
        
        const newClip = clipService.createClip('recording', audioData);
        
        // Convert AudioBuffer to Blob for the callback
        const audioContext = new AudioContext();
        const numberOfChannels = recordedBuffer.numberOfChannels;
        const length = recordedBuffer.length * numberOfChannels * 2; // 16-bit
        const arrayBuffer = new ArrayBuffer(44 + length);
        const view = new DataView(arrayBuffer);
        
        // Simple WAV header
        const writeString = (offset: number, string: string) => {
          for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
          }
        };
        
        writeString(0, 'RIFF');
        view.setUint32(4, 36 + length, true);
        writeString(8, 'WAVE');
        writeString(12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, numberOfChannels, true);
        view.setUint32(24, recordedBuffer.sampleRate, true);
        view.setUint32(28, recordedBuffer.sampleRate * numberOfChannels * 2, true);
        view.setUint16(32, numberOfChannels * 2, true);
        view.setUint16(34, 16, true);
        writeString(36, 'data');
        view.setUint32(40, length, true);
        
        // Convert audio data to 16-bit PCM
        let offset = 44;
        for (let i = 0; i < recordedBuffer.length; i++) {
          for (let channel = 0; channel < numberOfChannels; channel++) {
            const sample = Math.max(-1, Math.min(1, recordedBuffer.getChannelData(channel)[i]));
            view.setInt16(offset, sample * 0x7FFF, true);
            offset += 2;
          }
        }
        
        const audioBlob = new Blob([arrayBuffer], { type: 'audio/wav' });
        onRecordingComplete(audioBlob);
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

  const drawWaveform = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = async () => {
      try {
        const data = await audioService.getWaveformData();
        // Draw waveform logic here
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.beginPath();
        ctx.strokeStyle = '#646cff';
        ctx.lineWidth = 2;
        
        if (data.length > 0) {
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
        }
        ctx.stroke();
        
        animationRef.current = requestAnimationFrame(draw);
      } catch (error) {
        console.warn('Failed to draw waveform:', error);
        // Fallback to drawing a flat line
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath();
        ctx.strokeStyle = '#646cff';
        ctx.lineWidth = 2;
        ctx.moveTo(0, canvas.height / 2);
        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.stroke();
        
        animationRef.current = requestAnimationFrame(draw);
      }
    };
    
    draw();
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
            onChange={(event) => setSelectedDeviceId(event.target.value)}
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
    </Box>
  );
};

export default AudioRecorderComponent;
