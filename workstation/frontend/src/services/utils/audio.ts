/**
 * Audio utilities for the OEW application
 */

// Audio context utility
export const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

/**
 * Convert an AudioBuffer to a Buffer
 */
export function audioBufferToBuffer(audioBuffer: AudioBuffer): Buffer {
  // Get the raw audio data
  const numChannels = audioBuffer.numberOfChannels;
  const length = audioBuffer.length;
  const sampleRate = audioBuffer.sampleRate;
  const bytesPerSample = 2; // 16-bit
  const bitsPerSample = bytesPerSample * 8;
  
  // Calculate sizes
  const dataSize = length * numChannels * bytesPerSample;
  const bufferSize = 44 + dataSize; // 44 is the WAV header size
  
  // Create buffer
  const buffer = Buffer.alloc(bufferSize);
  
  // Write WAV header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(bufferSize - 8, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // fmt chunk size
  buffer.writeUInt16LE(1, 20); // audio format (PCM)
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * numChannels * bytesPerSample, 28); // byte rate
  buffer.writeUInt16LE(numChannels * bytesPerSample, 32); // block align
  buffer.writeUInt16LE(bitsPerSample, 34); // bits per sample
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);
  
  // Write audio data
  let offset = 44;
  const channels = [];
  
  // Get audio channels
  for (let i = 0; i < numChannels; i++) {
    channels.push(audioBuffer.getChannelData(i));
  }
  
  // Interleave channels and convert to 16-bit
  for (let i = 0; i < length; i++) {
    for (let c = 0; c < numChannels; c++) {
      // Convert float -1.0...1.0 to 16-bit PCM
      const sample = Math.max(-1, Math.min(1, channels[c][i]));
      const value = (sample < 0 ? sample * 0x8000 : sample * 0x7FFF) | 0;
      buffer.writeInt16LE(value, offset);
      offset += 2;
    }
  }
  
  return buffer;
}

/**
 * Reverses an audio buffer
 */
export async function reverseAudio(audioBuffer: AudioBuffer): Promise<AudioBuffer> {
  const numChannels = audioBuffer.numberOfChannels;
  const length = audioBuffer.length;
  
  // Create a new buffer with the same specifications
  const reversedBuffer = audioContext.createBuffer(
    numChannels,
    length,
    audioBuffer.sampleRate
  );
  
  // Reverse each channel
  for (let channel = 0; channel < numChannels; channel++) {
    const originalData = audioBuffer.getChannelData(channel);
    const reversedData = reversedBuffer.getChannelData(channel);
    
    for (let i = 0; i < length; i++) {
      reversedData[i] = originalData[length - 1 - i];
    }
  }
  
  return reversedBuffer;
}

/**
 * Create an audio buffer from raw PCM data
 */
export function createAudioBufferFromPCM(
  pcmData: Float32Array | Float32Array[],
  numChannels: number,
  sampleRate: number
): AudioBuffer {
  // Get the length from the appropriate source
  const bufferLength = Array.isArray(pcmData) ? pcmData[0].length : pcmData.length;
  const buffer = audioContext.createBuffer(numChannels, bufferLength, sampleRate);
  
  if (Array.isArray(pcmData)) {
    // Multi-channel data
    for (let i = 0; i < numChannels; i++) {
      buffer.getChannelData(i).set(pcmData[i]);
    }
  } else {
    // Single channel data
    buffer.getChannelData(0).set(pcmData);
  }
  
  return buffer;
}

export function createAudioBuffer(length: number, sampleRate: number): AudioBuffer {
  return audioContext.createBuffer(2, length, sampleRate);
}

export function decodeAudioData(arrayBuffer: ArrayBuffer): Promise<AudioBuffer> {
  return audioContext.decodeAudioData(arrayBuffer);
}
