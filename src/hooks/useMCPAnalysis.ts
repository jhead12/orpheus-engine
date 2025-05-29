import { useState, useEffect } from 'react';
import { AudioAnalysisType } from '../services/types/types';

interface MCPAnalysisOptions {
  type: AudioAnalysisType;
  resolution?: number;
  windowSize?: number;
}

export function useMCPAnalysis(audioData: ArrayBuffer | null, options: MCPAnalysisOptions) {
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!audioData) return;

    const analyze = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await window.electron.invoke('mcp:analyze', {
          data: audioData,
          type: options.type,
          params: {
            resolution: options.resolution || 1024,
            windowSize: options.windowSize || 2048
          }
        });

        setResults(response);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Analysis failed');
      } finally {
        setIsLoading(false);
      }
    };

    analyze();
  }, [audioData, options.type, options.resolution, options.windowSize]);

  return { results, error, isLoading };
}
