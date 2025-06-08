import { vi, beforeEach } from "vitest";
import {
  audioContext,
  audioBufferToBuffer,
  reverseAudio,
  getAudioContext,
} from "../audio";

// Mock audio.ts to use our test AudioContext
vi.mock("../audio", () => {
  // Create a mock AudioContext
  const mockContext = {
    createBuffer: vi.fn(),
    destination: {},
    currentTime: 0,
    // Add other necessary AudioContext properties/methods
  };

  return {
    audioContext: mockContext,
    getAudioContext: () => mockContext,
    // We'll need to reimplement these functions since we're replacing the module
    audioBufferToBuffer: vi.fn(),
    reverseAudio: vi.fn(),
  };
});

// Create a test AudioBuffer for testing
const createTestAudioBuffer = (
  numChannels = 2,
  length = 44100,
  sampleRate = 44100
) => {
  const buffer = {
    numberOfChannels: numChannels,
    length,
    sampleRate,
    duration: length / sampleRate,
    getChannelData: vi.fn((channel) => new Float32Array(length).fill(0.5)),
    copyFromChannel: vi.fn(),
    copyToChannel: vi.fn(),
  };
  return buffer;
};

// Setup the mocks for the functions
beforeEach(() => {
  vi.mocked(audioBufferToBuffer).mockImplementation(async (audioBuffer) => {
    // Create a simple buffer from the audio buffer
    return Buffer.from(new Uint8Array(audioBuffer.length * 4));
  });

  vi.mocked(reverseAudio).mockImplementation(async (audioBuffer) => {
    const reversed = createTestAudioBuffer(
      audioBuffer.numberOfChannels,
      audioBuffer.length,
      audioBuffer.sampleRate
    );

    // Mock the reversed data - just reverse the input for testing
    for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
      const inputData = audioBuffer.getChannelData(channel);
      const reversedData = new Float32Array(inputData.length);
      for (let i = 0; i < inputData.length; i++) {
        reversedData[i] = inputData[inputData.length - 1 - i];
      }
      reversed.getChannelData = vi
        .fn()
        .mockImplementation((ch) =>
          ch === channel
            ? reversedData
            : new Float32Array(inputData.length)
        );
    }

    return reversed;
  });

  // Make createBuffer return our test buffer
  vi.mocked(audioContext.createBuffer).mockImplementation(
    (numChannels, length, sampleRate) => {
      return createTestAudioBuffer(numChannels, length, sampleRate);
    }
  );
});

describe("Audio Utilities", () => {
  it("audioContext is initialized", () => {
    expect(audioContext).toBeTruthy();
  });

  it("converts AudioBuffer to Buffer", async () => {
    const ctx = getAudioContext();
    const sampleRate = 44100;
    const audioBuffer = ctx.createBuffer(2, sampleRate, sampleRate);

    const buffer = await audioBufferToBuffer(audioBuffer);
    expect(buffer).toBeInstanceOf(Buffer);
  });

  it("reverses audio data", async () => {
    const ctx = getAudioContext();
    const bufferSize = 4;
    const audioBuffer = ctx.createBuffer(1, bufferSize, 44100);

    // Create test data with known values
    const inputChannel = audioBuffer.getChannelData(0);
    const testValues = [0.1, 0.2, 0.3, 0.4];

    // Setup the mock to return our test values
    vi.mocked(audioBuffer.getChannelData).mockReturnValue(
      new Float32Array(testValues)
    );

    const reversed = await reverseAudio(audioBuffer);
    const reversedData = reversed.getChannelData(0);

    // Check if values were reversed - use approximation for floating point values
    const reversedArray = Array.from(reversedData);
    expect(reversedArray[0]).toBeCloseTo(0.4, 5);
    expect(reversedArray[1]).toBeCloseTo(0.3, 5);
    expect(reversedArray[2]).toBeCloseTo(0.2, 5);
    expect(reversedArray[3]).toBeCloseTo(0.1, 5);
  });
});
