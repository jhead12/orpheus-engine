import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, Button, Typography, FormControl, FormControlLabel, 
  Switch, List, ListItem, IconButton, ListItemText, Chip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { MultiSourceRecorder } from '../../services/audio/multiSourceRecorder';
import { AudioRecorder } from '../../services/audio/audioRecorder';

interface MultiSourceRecorderComponentProps {
  onRecordingsComplete?: (recordings: Blob[]) => void;
}

/**
 * Component for recording audio from multiple sources in the DAW
 */
const MultiSourceRecorderComponent: React.FC<MultiSourceRecorderComponentProps> = ({ 
  onRecordingsComplete 
}) => {
  const [recorder] = useState(() => new MultiSourceRecorder());
  const [isRecording, setIsRecording] = useState(false);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [syncEnabled, setSyncEnabled] = useState(true);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [timer, setTimer] = useState<number | null>(null);
  const [activeSources, setActiveSources] = useState<{deviceId: string, label: string}[]>([]);

  // Load available audio devices
  useEffect(() => {
    const loadDevices = async () => {
      try {
        // Create temporary AudioRecorder just to get the devices
        const tempRecorder = new AudioRecorder();
        const devices = await tempRecorder.getAudioInputDevices();
        setAudioDevices(devices);
        tempRecorder.dispose();
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

  // Handle sync toggle
  const handleSyncToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    const syncValue = event.target.checked;
    setSyncEnabled(syncValue);
    recorder.enableSynchronization(syncValue);
  };

  // Add a source
  const addSource = useCallback(async (deviceId: string) => {
    try {
      // Get device label
      const device = audioDevices.find(d => d.deviceId === deviceId);
      const label = device?.label || deviceId;
      
      // Add to recorder
      await recorder.addSource(deviceId, label);
      
      // Update UI
      setActiveSources(current => {
        // Check if already added
        if (current.some(s => s.deviceId === deviceId)) {
          return current;
        }
        return [...current, { deviceId, label }];
      });
    } catch (error) {
      console.error('Failed to add source:', error);
    }
  }, [recorder, audioDevices]);

  // Remove a source
  const removeSource = useCallback((deviceId: string) => {
    try {
      recorder.removeSource(deviceId);
      setActiveSources(current => current.filter(s => s.deviceId !== deviceId));
    } catch (error) {
      console.error('Failed to remove source:', error);
    }
  }, [recorder]);

  // Start recording
  const startRecording = useCallback(async () => {
    if (activeSources.length === 0) {
      console.error('No sources added');
      return;
    }
    
    try {
      await recorder.startRecording();
      setIsRecording(true);
      
      // Start timer to track recording duration
      const intervalId = window.setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
      
      setTimer(intervalId as unknown as number);
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  }, [recorder, activeSources]);

  // Stop recording
  const stopRecording = useCallback(async () => {
    try {
      if (timer) {
        window.clearInterval(timer);
        setTimer(null);
      }
      
      const recordings = await recorder.stopRecording();
      setIsRecording(false);
      setRecordingDuration(0);
      
      // Notify parent component
      if (onRecordingsComplete) {
        onRecordingsComplete(recordings);
      }
    } catch (error) {
      console.error('Failed to stop recording:', error);
    }
  }, [recorder, timer, onRecordingsComplete]);

  // Format seconds as MM:SS
  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Available devices (not yet added)
  const availableDevices = audioDevices.filter(device => 
    !activeSources.some(source => source.deviceId === device.deviceId)
  );

  return (
    <Box sx={{ margin: 2 }}>
      <Typography variant="h6" gutterBottom>
        Multi-Source Recorder
      </Typography>
      
      <Box sx={{ mb: 2 }}>
        <FormControlLabel
          control={
            <Switch
              checked={syncEnabled}
              onChange={handleSyncToggle}
              disabled={isRecording}
              data-testid="sync-toggle"
            />
          }
          label="Synchronize Sources"
        />
      </Box>
      
      <Typography variant="subtitle1" gutterBottom>
        Active Sources ({activeSources.length})
      </Typography>
      
      <List dense sx={{ maxHeight: 200, overflow: 'auto', mb: 2, border: '1px solid #eee', borderRadius: 1 }}>
        {activeSources.length === 0 ? (
          <ListItem>
            <ListItemText primary="No sources added" />
          </ListItem>
        ) : (
          activeSources.map(source => (
            <ListItem
              key={source.deviceId}
              secondaryAction={
                !isRecording && (
                  <IconButton 
                    edge="end" 
                    onClick={() => removeSource(source.deviceId)}
                    data-testid={`remove-source-${source.deviceId}`}
                  >
                    <DeleteIcon />
                  </IconButton>
                )
              }
            >
              <ListItemText
                primary={source.label}
                secondary={source.deviceId}
              />
            </ListItem>
          ))
        )}
      </List>
      
      {!isRecording && availableDevices.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Available Sources
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {availableDevices.map(device => (
              <Chip
                key={device.deviceId}
                label={device.label || `Device ${device.deviceId}`}
                onClick={() => addSource(device.deviceId)}
                icon={<AddIcon />}
                color="primary"
                variant="outlined"
                data-testid={`add-source-${device.deviceId}`}
              />
            ))}
          </Box>
        </Box>
      )}
      
      <Box sx={{ mt: 2 }}>
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
              Recording from {activeSources.length} sources: {formatDuration(recordingDuration)}
            </Typography>
            <Button 
              variant="contained" 
              color="error" 
              onClick={stopRecording}
              data-testid="stop-multi-recording-button"
            >
              Stop Recording
            </Button>
          </Box>
        ) : (
          <Button 
            variant="contained" 
            color="primary" 
            onClick={startRecording}
            disabled={activeSources.length === 0}
            data-testid="start-multi-recording-button"
          >
            Start Recording from {activeSources.length} Sources
          </Button>
        )}
      </Box>
    </Box>
  );
};

// Import at the top
import { AudioRecorder } from '../../services/audio/audioRecorder';

export default MultiSourceRecorderComponent;
