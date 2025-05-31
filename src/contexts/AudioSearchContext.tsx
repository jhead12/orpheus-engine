import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

// Define SearchResult interface for audio search results
export interface SearchResult {
  id?: string;
  text: string;
  start_time: number;
  end_time: number;
  confidence: number;
  audio_file?: string;
  metadata?: Record<string, any>;
}

// Define the context type
interface AudioSearchContextType {
  results: SearchResult[];
  isSearching: boolean;
  error: string | null;
  search: (query: string) => Promise<void>;
  selectResult: (result: SearchResult) => void;
  selectedResult: SearchResult | null;
  clearResults: () => void;
}

// Create the context with default values
const AudioSearchContext = createContext<AudioSearchContextType>({
  results: [],
  isSearching: false,
  error: null,
  search: async () => {},
  selectResult: () => {},
  selectedResult: null,
  clearResults: () => {}
});

// Props for the AudioSearchProvider component
interface AudioSearchProviderProps {
  children: ReactNode;
  apiEndpoint?: string;
}

// Provider component
export const AudioSearchProvider = ({ 
  children, 
  apiEndpoint = '/api/audio-search'
}: AudioSearchProviderProps) => {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);

  // Search function that makes API request
  const search = useCallback(async (query: string) => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    setError(null);
    
    try {
      // Make API request to search endpoint
      const response = await fetch(`${apiEndpoint}?query=${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        throw new Error(`Search failed with status: ${response.status}`);
      }
      
      const data = await response.json();
      setResults(data.results || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [apiEndpoint]);

  // Select a result
  const selectResult = useCallback((result: SearchResult) => {
    setSelectedResult(result);
  }, []);

  // Clear results
  const clearResults = useCallback(() => {
    setResults([]);
    setSelectedResult(null);
    setError(null);
  }, []);

  const value = {
    results,
    isSearching,
    error,
    search,
    selectResult,
    selectedResult,
    clearResults
  };

  return (
    <AudioSearchContext.Provider value={value}>
      {children}
    </AudioSearchContext.Provider>
  );
};

// Custom hook to use the audio search context
export const useAudioSearch = () => {
  const context = useContext(AudioSearchContext);
  
  if (context === undefined) {
    throw new Error('useAudioSearch must be used within an AudioSearchProvider');
  }
  
  return context;
};

export default AudioSearchContext;
