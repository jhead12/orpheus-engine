import React, { useContext, useEffect, useState } from 'react';
import { 
  FormControl,
  FormLabel,
  Select,
  MenuItem,
  Typography,
  Button
} from '@mui/material';
import { SettingsContext } from '../../../services/settings';
import { getAudioDevices } from '../../../services/settings/categories/audio';

const AudioSettings: React.FC = () => {
  const { settings, updateSettings } = useContext(SettingsContext)!;
  const { audio } = settings;
  
  const [inputDevices, setInputDevices] = useState<Array<{ label: string; value: string }>>([]);
  const [outputDevices, setOutputDevices] = useState<Array<{ label: string; value: string }>>([]);
  
  useEffect(() => {
    const loadDevices = async () => {
      const { inputs, outputs } = await getAudioDevices();
      setInputDevices([{ label: 'Default Input', value: 'default' }, ...inputs]);
      setOutputDevices([{ label: 'Default Output', value: 'default' }, ...outputs]);
    };
    
    loadDevices();
  }, []);
  
  const handleChange = <K extends keyof typeof audio>(key: K, value: typeof audio[K]) => {
    updateSettings('audio', { [key]: value });
  };
  
  const refreshDevices = async () => {
    const { inputs, outputs } = await getAudioDevices();
    setInputDevices([{ label: 'Default Input', value: 'default' }, ...inputs]);
    setOutputDevices([{ label: 'Default Output', value: 'default' }, ...outputs]);
  };
  
  return (
    <div>
      <Typography variant="h6" gutterBottom>Audio Configuration</Typography>
      
      <div style={{ display: 'grid', gap: '24px', gridTemplateColumns: 'repeat(12, 1fr)' }}>
        <div style={{ gridColumn: 'span 12' }}>
          <Button 
            onClick={refreshDevices}
            variant="outlined"
            size="small"
          >
            Refresh Audio Devices
          </Button>
        </div>
        
        <div style={{ gridColumn: 'span 6' }}>
          <FormControl fullWidth>
            <FormLabel>Input Device</FormLabel>
            <Select
              value={audio.inputDevice}
              onChange={(e) => handleChange('inputDevice', e.target.value as string)}
            >
              {inputDevices.map(device => (
                <MenuItem key={device.value} value={device.value}>
                  {device.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
        
        <div style={{ gridColumn: 'span 6' }}>
          <FormControl fullWidth>
            <FormLabel>Output Device</FormLabel>
            <Select
              value={audio.outputDevice}
              onChange={(e) => handleChange('outputDevice', e.target.value as string)}
            >
              {outputDevices.map(device => (
                <MenuItem key={device.value} value={device.value}>
                  {device.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
        
        <div style={{ gridColumn: 'span 6' }}>
          <FormControl fullWidth>
            <FormLabel>Sample Rate</FormLabel>
            <Select
              value={audio.sampleRate}
              onChange={(e) => handleChange('sampleRate', Number(e.target.value))}
            >
              <MenuItem value={44100}>44.1 kHz</MenuItem>
              <MenuItem value={48000}>48 kHz</MenuItem>
              <MenuItem value={88200}>88.2 kHz</MenuItem>
              <MenuItem value={96000}>96 kHz</MenuItem>
              <MenuItem value={192000}>192 kHz</MenuItem>
            </Select>
          </FormControl>
        </div>
        
        <div style={{ gridColumn: 'span 6' }}>
          <FormControl fullWidth>
            <FormLabel>Buffer Size</FormLabel>
            <Select
              value={audio.bufferSize}
              onChange={(e) => handleChange('bufferSize', Number(e.target.value))}
            >
              <MenuItem value={128}>128 samples</MenuItem>
              <MenuItem value={256}>256 samples</MenuItem>
              <MenuItem value={512}>512 samples</MenuItem>
              <MenuItem value={1024}>1024 samples</MenuItem>
              <MenuItem value={2048}>2048 samples</MenuItem>
            </Select>
          </FormControl>
        </div>
      </div>
    </div>
  );
};

export default AudioSettings;
