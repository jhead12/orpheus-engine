import { vi, beforeEach } from "vitest";
import {
  audioContext,
  audioBufferToBuffer,
  reverseAudio,
  getAudioContext,
} from "../audio";

// Mock audio.ts to use our test AudioContext
vi.mock("../audio", async () => {
  const actual = await vi.importActual<typeof import("../audio")>("../audio");
  const mockContext = new (global.AudioContext as any)();
  return {
    ...actual,
    audioContext: mockContext,
    getAudioContext: () => mockContext,
  };
});

describe("Audio Utilities", () => {
  beforeEach(() => {
    // Fail the test if audioContext is null
    if (!audioContext) {
      throw new Error("AudioContext failed to initialize");
    }
  });

  it("audioContext is initialized", () => {
    expect(audioContext).toBeTruthy();
    // Type-safe check for AudioContext instance
    expect(audioContext).toBeInstanceOf(
      window.AudioContext ||
        // TypeScript doesn't know about webkitAudioContext, but it might exist at runtime
        Object.getPrototypeOf(audioContext).constructor
    );
  });

  it("converts AudioBuffer to Buffer", async () => {
    const ctx = getAudioContext(); // This will throw if audioContext is null
    const sampleRate = 44100;
    const audioBuffer = ctx.createBuffer(2, sampleRate, sampleRate);

    // Fill with sample data
    const channelData = audioBuffer.getChannelData(0);
    channelData.fill(0.5);

    const buffer = await audioBufferToBuffer(audioBuffer);
    expect(buffer).toBeInstanceOf(Buffer);
  });

  it("reverses audio data", async () => {
    const ctx = getAudioContext();
    const bufferSize = 4;
    const audioBuffer = ctx.createBuffer(1, bufferSize, 44100);

    // Create test data
    const inputChannel = audioBuffer.getChannelData(0);
    const testValues = [0.1, 0.2, 0.3, 0.4];
    testValues.forEach((value, i) => {
      inputChannel[i] = value;
    });

    const reversed = await reverseAudio(audioBuffer);
    const reversedData = reversed.getChannelData(0);

    // Verify reversed values
    const expectedValues = testValues.slice().reverse();
    expectedValues.forEach((expected, i) => {
      expect(reversedData[i]).toBeCloseTo(expected, 5);
    });
  });
});
