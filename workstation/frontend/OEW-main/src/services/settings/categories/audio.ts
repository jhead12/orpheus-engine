// Default audio settings
export const audioSettings = {
  // Playback settings
  sampleRate: parseInt(process.env.VITE_AUDIO_SAMPLE_RATE || '44100'),
  bufferSize: parseInt(process.env.VITE_AUDIO_BUFFER_SIZE || '4096'),
  latencyHint: (process.env.VITE_AUDIO_LATENCY_HINT || "interactive") as AudioContextLatencyCategory,

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
