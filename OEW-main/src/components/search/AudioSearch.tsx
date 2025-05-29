/**
 * AudioSearch Component
 * 
 * A searchable interface for audio content that integrates with the backend
 * audio search API. It allows users to search through audio content using natural
 * language and displays the results with confidence scores and timestamps.
 */
import React, { useState } from 'react';
import { useAudioSearch } from '../../contexts/AudioSearchContext';
import './AudioSearch.css';

/**
 * Search result interface matching the backend API response structure
 */
interface SearchResult {
  id: string;
  text: string;
  confidence: number;
  start_time: number;
  end_time: number;
  file_path?: string;
}

/**
 * Props for the AudioSearch component
 */
interface AudioSearchProps {
  onResultSelect?: (result: SearchResult) => void;
}

/**
 * AudioSearch Component
 * 
 * Provides a user interface for searching audio content and displaying results
 * with confidence scores and timestamps.
 */
const AudioSearch: React.FC<AudioSearchProps> = ({ onResultSelect }) => {
  // State for the search query input
  const [queryInput, setQueryInput] = useState('');
  
  // Pull in shared audio search state from context
  const { results, isSearching, error, search, selectResult } = useAudioSearch();

  /**
   * Initiate a search when the user submits the query
   */
  const handleSearch = async () => {
    if (!queryInput.trim()) return;
    await search(queryInput);
  };

  /**
   * Handle Enter key to submit search
   */
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  /**
   * Handle result selection by notifying parent and updating context
   */
  const handleResultClick = (result: SearchResult) => {
    selectResult(result);
    if (onResultSelect) {
      onResultSelect(result);
    }
  };

  /**
   * Format seconds into MM:SS display format
   * @param seconds - Time in seconds
   * @returns Formatted time string (MM:SS)
   */
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="audio-search-container">
      <div className="audio-search-header">
        <h2>Audio Search</h2>
        <div className="audio-search-input">
          <input
            type="text"
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Search for audio content..."
            className="search-input"
            aria-label="Search audio content"
          />
          <button 
            onClick={handleSearch} 
            disabled={isSearching || !queryInput.trim()}
            className="search-button"
            aria-label="Submit search"
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>
      
      <div className="audio-search-results">
        {error && <div className="error-message" role="alert">{error}</div>}
        
        {results.length > 0 ? (
          <ul className="results-list" role="listbox">
            {results.map((result, index) => (
              <li 
                key={result.id || index} 
                className="result-item"
                onClick={() => handleResultClick(result)}
                role="option"
                aria-selected={false}
              >
                <div className="result-text">{result.text}</div>
                <div className="result-meta">
                  <span className="time-range">
                    {formatTime(result.start_time)} - {formatTime(result.end_time)}
                  </span>
                  <span className="confidence">
                    Match: {Math.round(result.confidence * 100)}%
                  </span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          !isSearching && <p className="no-results">No results found</p>
        )}
        
        {isSearching && <div className="loading" role="status">Searching audio content...</div>}
      </div>
    </div>
  );
};

export default AudioSearch;
