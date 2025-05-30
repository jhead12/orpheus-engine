/**
 * Functions for working with audio settings and devices
 */

interface AudioDevice {
  id: string;
  name: string;
  maxInputChannels: number;
  maxOutputChannels: number;
  defaultSampleRate: number;
}

/**
 * Gets available audio devices using the Web Audio API
 */
export async function getAudioDevices(): Promise<{
  inputs: AudioDevice[];
  outputs: AudioDevice[];
}> {
  try {
    // Check if the browser supports the Media Devices API
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      console.error('Media Devices API not supported in this browser');
      return { inputs: [], outputs: [] };
    }
    
    // Request permission to access audio devices
    await navigator.mediaDevices.getUserMedia({ audio: true });
    
    // Get all media devices
    const devices = await navigator.mediaDevices.enumerateDevices();
    
    // Filter audio input and output devices
    const audioDevices = devices.filter(device => device.kind === 'audioinput' || device.kind === 'audiooutput');
    
    // Create lists of input and output devices
    const inputs: AudioDevice[] = [];
    const outputs: AudioDevice[] = [];
    
    for (const device of audioDevices) {
      const deviceInfo: AudioDevice = {
        id: device.deviceId,
        name: device.label || `Audio Device (${device.deviceId.slice(0, 8)}...)`,
        maxInputChannels: device.kind === 'audioinput' ? 2 : 0,
        maxOutputChannels: device.kind === 'audiooutput' ? 2 : 0,
        defaultSampleRate: 44100 // Web Audio API typically uses 44.1kHz
      };
      
      if (device.kind === 'audioinput') {
        inputs.push(deviceInfo);
      } else {
        outputs.push(deviceInfo);
      }
    }
    
    return { inputs, outputs };
  } catch (error) {
    console.error('Error enumerating audio devices:', error);
    return { inputs: [], outputs: [] };
  }
}

/**
 * Gets supported sample rates for the current audio device
 */
export function getSupportedSampleRates(): number[] {
  // Standard sample rates supported by most audio devices
  return [44100, 48000, 88200, 96000, 192000];
}

/**
 * Gets supported buffer sizes
 */
export function getSupportedBufferSizes(): number[] {
  // Common buffer sizes (power of 2 values)
  return [128, 256, 512, 1024, 2048, 4096];
}
