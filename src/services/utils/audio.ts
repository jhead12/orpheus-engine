// Audio utilities and context management

export type AudioContextConstructor = {
  new (contextOptions?: AudioContextOptions): AudioContext;
};

declare global {
  interface Window {
    webkitAudioContext: AudioContextConstructor;
  }
}

// Mock function for test environments
const mockFn = () => () => {};

// Basic audio utilities
export function createAudioContext() {
  // Add test environment check
  if (process.env.NODE_ENV === "test" || !globalThis.AudioContext) {
    return new (class MockAudioContext {
      destination = {};
      sampleRate = 44100;
      createBuffer(channels: number, length: number, sampleRate: number) {
        return {
          length,
          numberOfChannels: channels,
          sampleRate,
          duration: length / sampleRate,
          getChannelData: () => new Float32Array(length),
          copyToChannel: mockFn(),
          copyFromChannel: mockFn(),
        };
      }
      createBufferSource() {
        return {
          connect: mockFn(),
          start: mockFn(),
          stop: mockFn(),
          buffer: null,
        };
      }
    })();
  }
  return new AudioContext();
}

export const audioContext = createAudioContext();

// Ensure audioContext is available for operations that require it
export const getAudioContext = () => {
  if (!audioContext) {
    throw new Error("AudioContext is not available in this environment");
  }
  return audioContext;
};

export const audioBufferToBuffer = async (
  audioBuffer: AudioBuffer
): Promise<Buffer> => {
  const numberOfChannels = audioBuffer.numberOfChannels;
  const length = audioBuffer.length;
  const sampleRate = audioBuffer.sampleRate;
  const buffer = Buffer.alloc(44 + length * numberOfChannels * 2);

  // Write WAV header
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + length * numberOfChannels * 2, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(numberOfChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * numberOfChannels * 2, 28);
  buffer.writeUInt16LE(numberOfChannels * 2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(length * numberOfChannels * 2, 40);

  // Write audio data
  let offset = 44;
  for (let i = 0; i < length; i++) {
    for (let channel = 0; channel < numberOfChannels; channel++) {
      const sample = Math.max(
        -1,
        Math.min(1, audioBuffer.getChannelData(channel)[i])
      );
      const value = Math.floor(sample < 0 ? sample * 0x8000 : sample * 0x7fff);
      buffer.writeInt16LE(value, offset);
      offset += 2;
    }
  }

  return buffer;
};

export const reverseAudio = async (
  audioBuffer: AudioBuffer
): Promise<AudioBuffer> => {
  const numberOfChannels = audioBuffer.numberOfChannels;
  const length = audioBuffer.length;
  const sampleRate = audioBuffer.sampleRate;

  const context = getAudioContext();
  const reversedBuffer = context.createBuffer(
    numberOfChannels,
    length,
    sampleRate
  );

  for (let channel = 0; channel < numberOfChannels; channel++) {
    const channelData = audioBuffer.getChannelData(channel);
    const reversedData = new Float32Array(length);

    // First copy all data to a temporary array to avoid mutating the original
    for (let i = 0; i < length; i++) {
      reversedData[i] = channelData[length - 1 - i];
    }

    // Then copy the reversed data to the new buffer
    const targetChannel = reversedBuffer.getChannelData(channel);
    targetChannel.set(reversedData);
  }

  return reversedBuffer;
};

// Additional audio utility functions
export const analyzeAudio = async (audioBuffer: AudioBuffer): Promise<any> => {
  // Basic audio analysis - placeholder implementation
  return {
    duration: audioBuffer.duration,
    sampleRate: audioBuffer.sampleRate,
    numberOfChannels: audioBuffer.numberOfChannels,
    length: audioBuffer.length
  };
};

export const normalizeAudio = async (audioBuffer: AudioBuffer): Promise<AudioBuffer> => {
  const numberOfChannels = audioBuffer.numberOfChannels;
  const length = audioBuffer.length;
  const sampleRate = audioBuffer.sampleRate;
  
  const context = getAudioContext();
  const normalizedBuffer = context.createBuffer(numberOfChannels, length, sampleRate);
  
  for (let channel = 0; channel < numberOfChannels; channel++) {
    const channelData = audioBuffer.getChannelData(channel);
    const normalizedData = new Float32Array(length);
    
    // Find peak value
    let peak = 0;
    for (let i = 0; i < length; i++) {
      peak = Math.max(peak, Math.abs(channelData[i]));
    }
    
    // Normalize if peak is greater than 0
    const gain = peak > 0 ? 1 / peak : 1;
    for (let i = 0; i < length; i++) {
      normalizedData[i] = channelData[i] * gain;
    }
    
    normalizedBuffer.getChannelData(channel).set(normalizedData);
  }
  
  return normalizedBuffer;
};

export const generateWaveform = (audioBuffer: AudioBuffer, width: number = 800): number[] => {
  const channelData = audioBuffer.getChannelData(0); // Use first channel
  const blockSize = Math.floor(channelData.length / width);
  const waveform: number[] = [];
  
  for (let i = 0; i < width; i++) {
    const start = i * blockSize;
    const end = Math.min(start + blockSize, channelData.length);
    
    let peak = 0;
    for (let j = start; j < end; j++) {
      peak = Math.max(peak, Math.abs(channelData[j]));
    }
    
    waveform.push(peak);
  }
  
  return waveform;
};

/**
 * Format panning value for display
 */
export function formatPanning(pan: number): string {
  if (pan === 0) return 'C';
  if (pan > 0) return `R${Math.round(pan * 100)}`;
  return `L${Math.round(Math.abs(pan) * 100)}`;
}

/**
 * Get volume gradient for visual representation
 */
export function getVolumeGradient(volume: number): string {
  // Convert dB to linear scale for gradient
  const linear = Math.pow(10, volume / 20);
  const clampedLinear = Math.max(0, Math.min(1, linear));
  
  // Create gradient from green to red based on volume level
  const red = Math.round(255 * clampedLinear);
  const green = Math.round(255 * (1 - clampedLinear * 0.5));
  
  return `rgb(${red}, ${green}, 0)`;
}

/**
 * Slice a clip (placeholder implementation)
 */
export function sliceClip(clip: any, startTime: number, endTime: number): any {
  // Placeholder implementation for audio clip slicing
  return {
    ...clip,
    start: startTime,
    end: endTime,
    duration: endTime - startTime
  };
}
