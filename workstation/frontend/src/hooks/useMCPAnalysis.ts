import { useState, useEffect } from 'react';
import { AudioAnalysisType } from '../services/types/types';

interface MCPAnalysisOptions {
  type: AudioAnalysisType;
  resolution: number;
  windowSize: number;
}

interface MCPAnalysisResults {
  spectralData?: number[][];
  waveform?: number[];
  features?: Record<string, number>;
  statistics?: {
    rmsEnergy: { mean: number; stdDev: number };
    sampleRate: number;
  };
}

interface SerializedAudioData {
  sampleRate: number;
  length: number;
  numberOfChannels: number;
  channelData: number[][];
}

interface MCPAnalysisRequest {
  data: SerializedAudioData;
  type: AudioAnalysisType;
  params: {
    resolution: number;
    windowSize: number;
  };
}

export function useMCPAnalysis(buffer: AudioBuffer | null, options: MCPAnalysisOptions) {
  const [results, setResults] = useState<MCPAnalysisResults | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!buffer) return;

    const analyze = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Convert AudioBuffer to serializable format for IPC
        const channelData: Float32Array[] = [];
        for (let i = 0; i < buffer.numberOfChannels; i++) {
          channelData.push(buffer.getChannelData(i));
        }

        const audioData = {
          sampleRate: buffer.sampleRate,
          length: buffer.length,
          numberOfChannels: buffer.numberOfChannels,
          channelData: channelData.map(channel => Array.from(channel))
        };

        const response = await window.electronAPI?.invoke('mcp:analyze', {
          data: audioData,
          type: options.type,
          params: {
            resolution: options.resolution,
            windowSize: options.windowSize
          }
        } as MCPAnalysisRequest);

        setResults(response);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Analysis failed');
      } finally {
        setIsLoading(false);
      }
    };

    analyze();
  }, [buffer, options.type, options.resolution, options.windowSize]);

  return { results, error, isLoading };
}
