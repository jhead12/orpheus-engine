import React, { createContext, useContext, useState, ReactNode } from 'react';
import { audioService } from '../services/AudioService';

interface SearchResult {
  id: string;
  text: string;
  confidence: number;
  start_time: number;
  end_time: number;
  file_path?: string;
  audio_file?: string;
}

interface AudioSearchContextType {
  results: SearchResult[];
  isSearching: boolean;
  error: string | null;
  lastQuery: string;
  search: (query: string) => Promise<void>;
  clearResults: () => void;
  selectedResult: SearchResult | null;
  selectResult: (result: SearchResult | null) => void;
}

const AudioSearchContext = createContext<AudioSearchContextType | undefined>(undefined);

interface AudioSearchProviderProps {
  children: ReactNode;
}

export const AudioSearchProvider: React.FC<AudioSearchProviderProps> = ({ children }) => {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastQuery, setLastQuery] = useState('');
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);

  const search = async (query: string) => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    setError(null);
    setLastQuery(query);
    
    try {
      const response = await audioService.searchAudio(query);
      setResults(response.results || []);
    } catch (err) {
      console.error('Audio search error:', err);
      setError('Failed to search audio content. Please try again.');
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const clearResults = () => {
    setResults([]);
    setLastQuery('');
    setError(null);
    setSelectedResult(null);
  };

  const selectResult = (result: SearchResult | null) => {
    setSelectedResult(result);
  };

  const contextValue: AudioSearchContextType = {
    results,
    isSearching,
    error,
    lastQuery,
    search,
    clearResults,
    selectedResult,
    selectResult
  };

  return (
    <AudioSearchContext.Provider value={contextValue}>
      {children}
    </AudioSearchContext.Provider>
  );
};

// Custom hook to use the AudioSearch context
export const useAudioSearch = (): AudioSearchContextType => {
  const context = useContext(AudioSearchContext);
  
  if (context === undefined) {
    throw new Error('useAudioSearch must be used within an AudioSearchProvider');
  }
  
  return context;
};

export default AudioSearchContext;
