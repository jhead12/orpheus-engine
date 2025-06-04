import { useState, useEffect, useCallback } from 'react';
import { AudioFile } from '../../shared/types/audio';
import { ragService } from '../services/ai/RagService';

interface RagService {
  query: (query: string) => Promise<any>;
  // Add the methods that are being called
  searchAudioLibrary?: (query: string) => Promise<AudioFile[]>;
  queryWithContext?: (context: any) => Promise<any>;
}

interface AudioFile {
  id: string;
  name: string; // Changed from 'filename' to 'name'
  path: string;
  duration: number;
}

interface RAGService {
  queryWithContext?: (query: string, context: string) => Promise<AudioFile[]>;
}

export function useAudioLibrary() {
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [ragService] = useState<RAGService>({});

  const searchFiles = async (query: string) => {
    if (ragService.queryWithContext) {
      const results = await ragService.queryWithContext(query, 'audio');
      return results.map(file => file.name); // Use 'name' instead of 'filename'
    }
    return [];
  };

  const searchByDescription = async (description: string) => {
    if (ragService.queryWithContext) {
      const results = await ragService.queryWithContext(description, 'description');
      return results.map(file => file.name); // Use 'name' instead of 'filename'
    }
    return [];
  };

  // AI-powered search function
  const searchWithAI = useCallback(async (query: string) => {
    setLoading(true);
    try {
      if (ragService.searchAudioLibrary) {
        const results = await ragService.searchAudioLibrary(query);
        const enhancedResults = await Promise.all(
          results.map(async (file) => {
            const analysis = await ragService.queryWithContext({
              text: `Analyze this audio file: ${file.filename}`,
              context: { audioFile: file }
            });
            
            return {
              ...file,
              aiAnalysis: analysis.audioSegments?.[0] || null
            };
          })
        );
        
        setAudioFiles(enhancedResults);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  }, []);

  // Get AI suggestions for current selection
  const getAISuggestions = useCallback(async (selectedFiles: AudioFile[]) => {
    try {
      if (ragService.queryWithContext) {
        const context = selectedFiles.map((file: any) => ({
          name: file.name,
          metadata: file
        }));
        const results = await ragService.queryWithContext(context);
        setSuggestions(results);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get suggestions');
    }
  }, []);

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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load library');
    } finally {
      setLoading(false);
    }
  }, []);

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
    reload: loadLibrary,
    searchFiles,
    searchByDescription
  };
}
