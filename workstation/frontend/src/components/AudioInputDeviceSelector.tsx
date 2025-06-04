/**
 * Audio Input Device Selector Component
 * Provides UI for selecting and configuring audio input devices
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Chip,
  Alert,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Slider,
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  Mic as MicIcon,
  MicOff as MicOffIcon,
  Bluetooth as BluetoothIcon,
  Usb as UsbIcon,
  Router as RouterIcon,
  SignalCellularAlt as SignalIcon,
  Battery90 as BatteryIcon,
} from '@mui/icons-material';

import { audioInputPluginManager } from '../services/plugins/audio-input/AudioInputPluginManager';
import {
  AudioInputDevice,
  AudioInputConfiguration,
  AudioInputStream,
  AudioChannelConfiguration,
} from '../services/plugins/audio-input/types';

interface AudioInputDeviceSelectorProps {
  onDeviceSelected?: (device: AudioInputDevice) => void;
  onStreamStarted?: (stream: AudioInputStream) => void;
  onStreamStopped?: () => void;
  onError?: (error: string) => void;
}

export const AudioInputDeviceSelector: React.FC<AudioInputDeviceSelectorProps> = ({
  onDeviceSelected,
  onStreamStarted,
  onStreamStopped,
  onError,
}) => {
  const [devices, setDevices] = useState<AudioInputDevice[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<AudioInputDevice | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfig, setShowConfig] = useState(false);
  const [currentStream, setCurrentStream] = useState<AudioInputStream | null>(null);
  const [deviceStatus, setDeviceStatus] = useState<any>(null);

  const [configuration, setConfiguration] = useState<AudioInputConfiguration>({
    sampleRate: 48000,
    bitDepth: 24,
    bufferSize: 512,
    channels: [
      { index: 0, name: 'Left', enabled: true, gain: 0 },
      { index: 1, name: 'Right', enabled: true, gain: 0 },
    ],
    monitoring: {
      enabled: false,
      volume: 0.5,
      latency: 10,
    },
    processing: {
      gainControl: false,
      noiseGate: false,
      compression: false,
      eq: false,
    },
  });

  // Load plugins and discover devices on mount
  useEffect(() => {
    const initializeDevices = async () => {
      setIsLoading(true);
      try {
        await audioInputPluginManager.loadPlugins();
        await refreshDevices();
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to initialize audio devices';
        setError(errorMsg);
        onError?.(errorMsg);
      } finally {
        setIsLoading(false);
      }
    };

    initializeDevices();

    // Set up event listeners
    audioInputPluginManager.on('device-connected', handleDeviceConnected);
    audioInputPluginManager.on('device-disconnected', handleDeviceDisconnected);
    audioInputPluginManager.on('stream-started', handleStreamStarted);
    audioInputPluginManager.on('stream-stopped', handleStreamStopped);
    audioInputPluginManager.on('error', handleError);

    return () => {
      audioInputPluginManager.off('device-connected', handleDeviceConnected);
      audioInputPluginManager.off('device-disconnected', handleDeviceDisconnected);
      audioInputPluginManager.off('stream-started', handleStreamStarted);
      audioInputPluginManager.off('stream-stopped', handleStreamStopped);
      audioInputPluginManager.off('error', handleError);
    };
  }, []);

  const refreshDevices = useCallback(async () => {
    setIsLoading(true);
    try {
      const discoveredDevices = await audioInputPluginManager.discoverAllDevices();
      setDevices(discoveredDevices);
      setError(null);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to discover devices';
      setError(errorMsg);
      onError?.(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [onError]);

  const handleDeviceConnected = useCallback((device: AudioInputDevice) => {
    setIsConnected(true);
    setSelectedDevice(device);
    onDeviceSelected?.(device);
  }, [onDeviceSelected]);

  const handleDeviceDisconnected = useCallback(() => {
    setIsConnected(false);
    setIsStreaming(false);
    setSelectedDevice(null);
    setCurrentStream(null);
    setDeviceStatus(null);
  }, []);

  const handleStreamStarted = useCallback((stream: AudioInputStream) => {
    setIsStreaming(true);
    setCurrentStream(stream);
    onStreamStarted?.(stream);
  }, [onStreamStarted]);

  const handleStreamStopped = useCallback(() => {
    setIsStreaming(false);
    setCurrentStream(null);
    onStreamStopped?.();
  }, [onStreamStopped]);

  const handleError = useCallback((error: Error) => {
    const errorMsg = error.message;
    setError(errorMsg);
    onError?.(errorMsg);
  }, [onError]);

  const connectToDevice = async (device: AudioInputDevice) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await audioInputPluginManager.connectToDevice(device.id, configuration);
      
      if (result.success) {
        setSelectedDevice(device);
        setIsConnected(true);
        setDeviceStatus(result.metadata);
        onDeviceSelected?.(device);
      } else {
        setError(result.error || 'Failed to connect to device');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Connection failed';
      setError(errorMsg);
      onError?.(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const startStream = async () => {
    if (!isConnected) return;
    
    setIsLoading(true);
    try {
      const result = await audioInputPluginManager.startStream();
      
      if (result.success && result.stream) {
        setIsStreaming(true);
        setCurrentStream(result.stream);
        onStreamStarted?.(result.stream);
      } else {
        setError(result.error || 'Failed to start stream');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to start stream';
      setError(errorMsg);
      onError?.(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const stopStream = async () => {
    setIsLoading(true);
    try {
      await audioInputPluginManager.stopStream();
      setIsStreaming(false);
      setCurrentStream(null);
      onStreamStopped?.();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to stop stream';
      setError(errorMsg);
      onError?.(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const disconnect = async () => {
    setIsLoading(true);
    try {
      await audioInputPluginManager.disconnect();
      setIsConnected(false);
      setIsStreaming(false);
      setSelectedDevice(null);
      setCurrentStream(null);
      setDeviceStatus(null);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to disconnect';
      setError(errorMsg);
      onError?.(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const updateConfiguration = async (newConfig: Partial<AudioInputConfiguration>) => {
    const updatedConfig = { ...configuration, ...newConfig };
    setConfiguration(updatedConfig);
    
    if (isConnected && selectedDevice) {
      try {
        await audioInputPluginManager.configurePlugin(selectedDevice.id, updatedConfig);
      } catch (err) {
        console.error('Failed to update configuration:', err);
      }
    }
  };

  const getDeviceIcon = (device: AudioInputDevice) => {
    switch (device.type) {
      case 'nrf':
      case 'bluetooth':
        return <BluetoothIcon />;
      case 'usb':
        return <UsbIcon />;
      case 'madi':
      case 'network':
        return <RouterIcon />;
      default:
        return <MicIcon />;
    }
  };

  const getStatusColor = (device: AudioInputDevice) => {
    if (!device.isAvailable) return 'error';
    if (selectedDevice?.id === device.id && isConnected) return 'success';
    return 'default';
  };

  return (
    <Card sx={{ maxWidth: '100%', margin: 'auto' }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" component="h2">
            Audio Input Devices
          </Typography>
          <Box>
            <IconButton onClick={refreshDevices} disabled={isLoading}>
              <RefreshIcon />
            </IconButton>
            <IconButton onClick={() => setShowConfig(true)} disabled={!selectedDevice}>
              <SettingsIcon />
            </IconButton>
          </Box>
        </Box>

        {isLoading && <LinearProgress sx={{ mb: 2 }} />}
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Device Selection */}
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Select Audio Device</InputLabel>
          <Select
            value={selectedDevice?.id || ''}
            onChange={(e) => {
              const device = devices.find(d => d.id === e.target.value);
              if (device) connectToDevice(device);
            }}
            disabled={isLoading}
          >
            {devices.map((device) => (
              <MenuItem key={device.id} value={device.id}>
                <Box display="flex" alignItems="center" gap={1}>
                  {getDeviceIcon(device)}
                  <Box>
                    <Typography variant="body2">{device.name}</Typography>
                    <Typography variant="caption" color="textSecondary">
                      {device.manufacturer} • {device.channels}ch • {device.type.toUpperCase()}
                    </Typography>
                  </Box>
                  <Box ml="auto">
                    <Chip
                      size="small"
                      label={device.isAvailable ? 'Available' : 'Unavailable'}
                      color={getStatusColor(device)}
                    />
                  </Box>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Selected Device Info */}
        {selectedDevice && (
          <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">
                  {selectedDevice.name}
                </Typography>
                <Typography variant="caption" display="block">
                  {selectedDevice.manufacturer} • {selectedDevice.channels} channels
                </Typography>
                {selectedDevice.capabilities.wirelessRange && (
                  <Box display="flex" alignItems="center" gap={1} mt={1}>
                    <SignalIcon fontSize="small" />
                    <Typography variant="caption">
                      Range: {selectedDevice.capabilities.wirelessRange}m
                    </Typography>
                  </Box>
                )}
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Box display="flex" justifyContent="flex-end" gap={1}>
                  {isConnected && (
                    <Button
                      variant={isStreaming ? "contained" : "outlined"}
                      color={isStreaming ? "error" : "primary"}
                      startIcon={isStreaming ? <MicOffIcon /> : <MicIcon />}
                      onClick={isStreaming ? stopStream : startStream}
                      disabled={isLoading}
                    >
                      {isStreaming ? 'Stop' : 'Start'}
                    </Button>
                  )}
                  
                  <Button
                    variant="outlined"
                    onClick={isConnected ? disconnect : () => connectToDevice(selectedDevice)}
                    disabled={isLoading}
                  >
                    {isConnected ? 'Disconnect' : 'Connect'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
            
            {/* Device Status */}
            {deviceStatus && (
              <Box mt={2}>
                <Typography variant="caption" color="textSecondary">
                  Latency: {deviceStatus.actualLatency}ms • 
                  Sample Rate: {deviceStatus.actualSampleRate}Hz • 
                  Channels: {deviceStatus.actualChannels}
                  {deviceStatus.batteryLevel && ` • Battery: ${deviceStatus.batteryLevel}%`}
                  {deviceStatus.signalStrength && ` • Signal: ${deviceStatus.signalStrength}dBm`}
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {/* Stream Info */}
        {currentStream && (
          <Accordion sx={{ mb: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle2">Stream Information</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" display="block">
                    Stream ID: {currentStream.id}
                  </Typography>
                  <Typography variant="caption" display="block">
                    Sample Rate: {currentStream.sampleRate}Hz
                  </Typography>
                  <Typography variant="caption" display="block">
                    Bit Depth: {currentStream.bitDepth}-bit
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" display="block">
                    Channels: {currentStream.channels}
                  </Typography>
                  <Typography variant="caption" display="block">
                    Latency: {currentStream.latency}ms
                  </Typography>
                  <Typography variant="caption" display="block">
                    Status: {currentStream.isActive ? 'Active' : 'Inactive'}
                  </Typography>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        )}

        {/* Configuration Dialog */}
        <Dialog open={showConfig} onClose={() => setShowConfig(false)} maxWidth="md" fullWidth>
          <DialogTitle>Audio Configuration</DialogTitle>
          <DialogContent>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              {/* Sample Rate */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Sample Rate</InputLabel>
                  <Select
                    value={configuration.sampleRate}
                    onChange={(e) => updateConfiguration({ sampleRate: e.target.value as number })}
                  >
                    {[44100, 48000, 96000, 192000].map((rate) => (
                      <MenuItem key={rate} value={rate}>{rate}Hz</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Bit Depth */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Bit Depth</InputLabel>
                  <Select
                    value={configuration.bitDepth}
                    onChange={(e) => updateConfiguration({ bitDepth: e.target.value as number })}
                  >
                    {[16, 24, 32].map((depth) => (
                      <MenuItem key={depth} value={depth}>{depth}-bit</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Buffer Size */}
              <Grid item xs={12}>
                <Typography gutterBottom>Buffer Size: {configuration.bufferSize} samples</Typography>
                <Slider
                  value={configuration.bufferSize}
                  onChange={(_, value) => updateConfiguration({ bufferSize: value as number })}
                  min={64}
                  max={2048}
                  step={64}
                  marks={[64, 128, 256, 512, 1024, 2048].map(v => ({ value: v, label: v.toString() }))}
                />
              </Grid>

              {/* Monitoring */}
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={configuration.monitoring.enabled}
                      onChange={(e) => updateConfiguration({
                        monitoring: { ...configuration.monitoring, enabled: e.target.checked }
                      })}
                    />
                  }
                  label="Enable Monitoring"
                />
              </Grid>

              {configuration.monitoring.enabled && (
                <Grid item xs={12}>
                  <Typography gutterBottom>Monitor Volume: {Math.round(configuration.monitoring.volume * 100)}%</Typography>
                  <Slider
                    value={configuration.monitoring.volume}
                    onChange={(_, value) => updateConfiguration({
                      monitoring: { ...configuration.monitoring, volume: value as number }
                    })}
                    min={0}
                    max={1}
                    step={0.01}
                  />
                </Grid>
              )}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowConfig(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default AudioInputDeviceSelector;
