import { AudioAnalysisResults } from "../../types/audio";

export class AudioAnalysisAPI {
  async analyze(audioBuffer: AudioBuffer): Promise<AudioAnalysisResults> {
    // Perform spectral analysis
    const fftSize = 2048;
    const analyzer = new AnalyserNode(new AudioContext(), { fftSize });
    const frequencyData = new Float32Array(analyzer.frequencyBinCount);
    const timeData = new Float32Array(fftSize);

    // Create a temporary source to connect to the analyzer
    const source = new AudioContext().createBufferSource();
    source.buffer = audioBuffer;
    source.connect(analyzer);

    // Get frequency data
    analyzer.getFloatFrequencyData(frequencyData);
    analyzer.getFloatTimeDomainData(timeData);

    // Calculate frequency axis
    const sampleRate = audioBuffer.sampleRate;
    const frequencies = Array.from(
      { length: analyzer.frequencyBinCount },
      (_, i) => (i * sampleRate) / fftSize
    );

    return {
      waveform: Array.from(timeData),
      spectrum: {
        frequencies,
        magnitudes: Array.from(frequencyData),
      },
      spectrogram: {
        data: [Array.from(frequencyData)], // Simplified spectrogram - just one time slice
        timeAxis: [0],
        frequencyAxis: frequencies,
      },
    };
  }
}
