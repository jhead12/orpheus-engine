import React, { useState } from 'react';
import AudioSearch from './AudioSearch';
import { audioService } from '../../services/AudioService';
import './AudioSearchPanel.css';

interface SearchResult {
  id: string;
  text: string;
  confidence: number;
  start_time: number;
  end_time: number;
  file_path?: string;
  audio_file?: string;
}

interface AudioSearchPanelProps {
  onImportAudio?: (filePath: string, startTime?: number, endTime?: number) => void;
  isVisible?: boolean;
}

const AudioSearchPanel: React.FC<AudioSearchPanelProps> = ({ 
  onImportAudio,
  isVisible = true
}) => {
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleResultSelect = async (result: SearchResult) => {
    setSelectedResult(result);
    setIsLoading(true);
    setError(null);
    
    try {
      // If we have a file_path in the result, we can use it directly
      if (result.file_path) {
        onImportAudio?.(result.file_path, result.start_time, result.end_time);
        return;
      }
      
      // Otherwise, fetch the segment details to get the file path
      if (result.id) {
        const details = await audioService.getSegmentDetails(result.id);
        if (details && details.file_path) {
          onImportAudio?.(details.file_path, result.start_time, result.end_time);
        } else {
          setError('Could not retrieve audio file location');
        }
      }
    } catch (err) {
      console.error('Error handling result selection:', err);
      setError('Failed to import the selected audio');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="audio-search-panel">
      <AudioSearch onResultSelect={handleResultSelect} />
      
      {selectedResult && (
        <div className="selected-result">
          <h3>Selected Audio</h3>
          <div className="selected-content">
            <p className="selected-text">{selectedResult.text}</p>
            <p className="selected-time">
              Time: {formatTime(selectedResult.start_time)} - {formatTime(selectedResult.end_time)}
            </p>
            {isLoading && <div className="loading-import">Loading audio file...</div>}
            {error && <div className="error-message">{error}</div>}
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function to format seconds as MM:SS
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export default AudioSearchPanel;
