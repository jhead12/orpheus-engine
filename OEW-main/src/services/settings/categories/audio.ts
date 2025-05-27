import { AudioSettings } from '../types';

export const updateAudioSettings = (
  current: AudioSettings,
  updates: Partial<AudioSettings>
): AudioSettings => {
  return {
    ...current,
    ...updates
  };
};

export const audioSettingsFields = [
  {
    id: 'inputDevice',
    label: 'Input Device',
    description: 'Audio input device',
    type: 'select',
    options: [
      { label: 'Default Input', value: 'default' },
      // Dynamically populated options will be added at runtime
    ]
  },
  {
    id: 'outputDevice',
    label: 'Output Device',
    description: 'Audio output device',
    type: 'select',
    options: [
      { label: 'Default Output', value: 'default' },
      // Dynamically populated options will be added at runtime
    ]
  },
  {
    id: 'sampleRate',
    label: 'Sample Rate',
    description: 'Audio sample rate (Hz)',
    type: 'select',
    options: [
      { label: '44.1 kHz', value: 44100 },
      { label: '48 kHz', value: 48000 },
      { label: '88.2 kHz', value: 88200 },
      { label: '96 kHz', value: 96000 },
      { label: '192 kHz', value: 192000 }
    ]
  },
  {
    id: 'bufferSize',
    label: 'Buffer Size',
    description: 'Audio buffer size (samples)',
    type: 'select',
    options: [
      { label: '64 samples', value: 64 },
      { label: '128 samples', value: 128 },
      { label: '256 samples', value: 256 },
      { label: '512 samples', value: 512 },
      { label: '1024 samples', value: 1024 },
      { label: '2048 samples', value: 2048 }
    ]
  }
];

// Function to enumerate available audio devices
export async function getAudioDevices() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
    return { inputs: [], outputs: [] };
  }

  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    
    const inputs = devices
      .filter(device => device.kind === 'audioinput')
      .map(device => ({ label: device.label || `Input ${device.deviceId}`, value: device.deviceId }));
      
    const outputs = devices
      .filter(device => device.kind === 'audiooutput')
      .map(device => ({ label: device.label || `Output ${device.deviceId}`, value: device.deviceId }));
      
    return { inputs, outputs };
  } catch (error) {
    console.error('Error enumerating audio devices:', error);
    return { inputs: [], outputs: [] };
  }
}
