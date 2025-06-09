import { vi } from "vitest";

// Create an instance of MockAudioContext from test setup
const mockAudioContext = new (global.AudioContext as any)();

// Export the mock implementation
export const audioContext = mockAudioContext;
export const getAudioContext = vi.fn(() => mockAudioContext);

// Mock other utility functions
export const audioBufferToBuffer = vi.fn().mockResolvedValue(Buffer.from([]));
export const reverseAudio = vi
  .fn()
  .mockImplementation(async (audioBuffer: AudioBuffer) => {
    // Get properties from the input buffer
    const numberOfChannels = audioBuffer.numberOfChannels;
    const length = audioBuffer.length;
    const sampleRate = audioBuffer.sampleRate;

    // Create a new buffer for reversed audio
    const reversedBuffer = mockAudioContext.createBuffer(
      numberOfChannels,
      length,
      sampleRate
    );

    // Process each channel
    for (let channel = 0; channel < numberOfChannels; channel++) {
      const sourceData = audioBuffer.getChannelData(channel);
      const targetData = reversedBuffer.getChannelData(channel);

      // Copy in reverse order
      for (let i = 0; i < length; i++) {
        const reverseIndex = length - 1 - i;
        targetData[i] = sourceData[reverseIndex];
      }
    }

    return reversedBuffer;
  });
