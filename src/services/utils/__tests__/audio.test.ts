import {
  audioContext,
  audioBufferToBuffer,
  reverseAudio,
  getAudioContext,
} from "../audio";

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
    const ctx = getAudioContext(); // This will throw if audioContext is null
    const sampleRate = 44100;
    const audioBuffer = ctx.createBuffer(1, sampleRate, sampleRate);

    // Fill with test pattern (using simple integers to avoid floating point issues)
    const channelData = audioBuffer.getChannelData(0);
    channelData[0] = 1; // Start
    channelData[1] = 2; // Second
    channelData[sampleRate - 2] = 3; // Second to last
    channelData[sampleRate - 1] = 4; // End

    const reversed = await reverseAudio(audioBuffer);
    const reversedData = reversed.getChannelData(0);

    // Check if the values are reversed using exact equality
    // This should work because we're using simple integer values
    expect(reversedData[0]).toBe(channelData[sampleRate - 1]); // 4
    expect(reversedData[1]).toBe(channelData[sampleRate - 2]); // 3
    expect(reversedData[sampleRate - 2]).toBe(channelData[1]); // 2
    expect(reversedData[sampleRate - 1]).toBe(channelData[0]); // 1
  });
});
