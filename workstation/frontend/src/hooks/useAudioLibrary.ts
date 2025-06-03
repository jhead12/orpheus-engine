import { useState, useEffect, useCallback } from 'react';
import { useQuery, gql } from '@apollo/client';
import { ragService } from '../services/ai/RagService';

const GET_AUDIO_LIBRARY = gql`
  query GetAudioLibrary {
    audioLibrary {
      description
      location
      files {
        id
        filename
        type
        description
        usage
        path
      }
      supported_formats
    }
  }
`;

const GET_AUDIO_FILES = gql`
  query GetAudioFiles {
    audioFiles {
      id
      filename
      type
      description
      usage
      path
      size
      duration
      created_at
      updated_at
    }
  }
`;

interface AudioFile {
  id: string;
  filename: string;
  path: string;
  metadata?: any;
  aiAnalysis?: {
    genre: string;
    mood: string;
    key: string;
    bpm: number;
    tags: string[];
  };
}

interface UseAudioLibraryOptions {
  enableAIAnalysis?: boolean;
  autoSuggest?: boolean;
}

export function useAudioLibrary(options: UseAudioLibraryOptions = {}) {
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<any[]>([]);

  // AI-powered search function
  const searchWithAI = useCallback(async (query: string) => {
    setLoading(true);
    try {
      const results = await ragService.searchAudioLibrary(query);
      const enhancedResults = await Promise.all(
        results.map(async (file) => {
          if (options.enableAIAnalysis) {
            const analysis = await ragService.queryWithContext({
              text: `Analyze this audio file: ${file.filename}`,
              context: { audioFile: file }
            });
            
            return {
              ...file,
              aiAnalysis: analysis.audioSegments?.[0] || null
            };
          }
          return file;
        })
      );
      
      setAudioFiles(enhancedResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  }, [options.enableAIAnalysis]);

  // Get AI suggestions for current selection
  const getAISuggestions = useCallback(async (selectedFiles: AudioFile[]) => {
    if (!options.autoSuggest) return;

    try {
      const response = await ragService.queryWithContext({
        text: 'Suggest related audio files and creative combinations',
        context: {
          selectedFiles,
          currentLibrary: audioFiles
        }
      });

      setSuggestions(response.suggestions || []);
    } catch (err) {
      console.warn('Failed to get AI suggestions:', err);
    }
  }, [audioFiles, options.autoSuggest]);

  // Load library with optional AI enhancement
  const loadLibrary = useCallback(async () => {
    setLoading(true);
    try {
      // Load from GraphQL endpoint
      const response = await fetch('/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            query {
              audioFiles {
                id
                filename
                path
                duration
                type
              }
            }
          `
        })
      });

      const data = await response.json();
      const files = data.data.audioFiles;

      if (options.enableAIAnalysis) {
        // Enhance with AI analysis
        const enhancedFiles = await Promise.all(
          files.map(async (file: AudioFile) => {
            try {
              const analysis = await ragService.queryWithContext({
                text: `Provide metadata analysis for: ${file.filename}`,
                context: { audioFile: file }
              });
              
              return {
                ...file,
                aiAnalysis: analysis.audioSegments?.[0]
              };
            } catch {
              return file;
            }
          })
        );
        setAudioFiles(enhancedFiles);
      } else {
        setAudioFiles(files);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load library');
    } finally {
      setLoading(false);
    }
  }, [options.enableAIAnalysis]);

  useEffect(() => {
    loadLibrary();
  }, [loadLibrary]);

  return {
    audioFiles,
    loading,
    error,
    suggestions,
    searchWithAI,
    getAISuggestions,
    reload: loadLibrary
  };
}
