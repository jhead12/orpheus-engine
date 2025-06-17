// Default audio settings
export const audioSettings = {
  // Playback settings
  sampleRate: parseInt(process.env.VITE_AUDIO_SAMPLE_RATE || "44100"),
  bufferSize: parseInt(process.env.VITE_AUDIO_BUFFER_SIZE || "4096"),
  latencyHint: (process.env.VITE_AUDIO_LATENCY_HINT ||
    "interactive") as AudioContextLatencyCategory,

  // Default gain/volume settings
  masterGain: 1.0,
  defaultTrackGain: 0.7,

  // Audio processing settings
  enableProcessing: true,
  processingQuality: "high",

  // Recording settings
  defaultInputDevice: "default",
  recordingFormat: "wav",
  bitDepth: 16,

  // Metering settings
  meterRefreshRate: 24, // Hz
  peakHoldTime: 1000, // ms

  // Rendering settings
  defaultExportFormat: "wav",
  defaultExportBitDepth: 24,
  defaultExportSampleRate: 48000,
};

export const getAudioSettings = () => {
  // In the future, this could load from user preferences
  return audioSettings;
};

export type AudioSettings = typeof audioSettings;

// Add missing function for audio devices
export const getAudioDevices = async (): Promise<{
  inputs: Array<{ label: string; value: string }>;
  outputs: Array<{ label: string; value: string }>;
}> => {
  // Request permission and get audio devices
  try {
    await navigator.mediaDevices.getUserMedia({ audio: true });
    const devices = await navigator.mediaDevices.enumerateDevices();
    const audioDevices = devices.filter(
      (device) => device.kind === "audioinput" || device.kind === "audiooutput"
    );
    
    const inputs = audioDevices
      .filter(device => device.kind === "audioinput")
      .map(device => ({ label: device.label || `Input ${device.deviceId}`, value: device.deviceId }));
    
    const outputs = audioDevices
      .filter(device => device.kind === "audiooutput")
      .map(device => ({ label: device.label || `Output ${device.deviceId}`, value: device.deviceId }));
    
    return { inputs, outputs };
  } catch (error) {
    console.error("Failed to get audio devices:", error);
    return { inputs: [], outputs: [] };
  }
};
