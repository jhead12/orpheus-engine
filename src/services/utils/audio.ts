// Audio utilities and context management
export type AudioContextConstructor = {
  new (contextOptions?: AudioContextOptions): AudioContext;
};

declare global {
  interface Window {
    webkitAudioContext: AudioContextConstructor;
  }
}

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
          copyToChannel: vi.fn(),
          copyFromChannel: vi.fn(),
        };
      }
      createBufferSource() {
        return {
          connect: vi.fn(),
          start: vi.fn(),
          stop: vi.fn(),
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

/**
 * Formats a panning value to a readable string
 * @param panning Value between -1 (full left) and 1 (full right)
 * @returns Formatted panning string
 */
export const formatPanning = (panning: number): string => {
  if (panning === 0) return "C";
  if (panning < 0) return `L ${Math.abs(Math.round(panning * 100))}%`;
  return `R ${Math.round(panning * 100)}%`;
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
