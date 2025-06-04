import React, { useState } from 'react';
import './TransportControls.css';

const TransportControls = ({ 
  onPlay, 
  onPause, 
  onStop, 
  onRecord,
  onRewind,
  onForward,
  isPlaying = false,
  isRecording = false
}) => {
  const [tempo, setTempo] = useState(120);

  const handleTempoChange = (e) => {
    const value = parseInt(e.target.value, 10);
    setTempo(value);
    // You might want to add an onTempoChange callback here
  };

  return (
    <div className="transport-controls">
      <div className="transport-buttons">
        <button 
          className="transport-button"
          onClick={onRewind}
          title="Rewind"
        >
          <i className="fas fa-backward"></i>
        </button>
        
        {isPlaying ? (
          <button 
            className="transport-button"
            onClick={onPause}
            title="Pause"
          >
            <i className="fas fa-pause"></i>
          </button>
        ) : (
          <button 
            className="transport-button"
            onClick={onPlay}
            title="Play"
          >
            <i className="fas fa-play"></i>
          </button>
        )}
        
        <button 
          className="transport-button"
          onClick={onStop}
          title="Stop"
        >
          <i className="fas fa-stop"></i>
        </button>
        
        <button 
          className={`transport-button ${isRecording ? 'recording' : ''}`}
          onClick={onRecord}
          title="Record"
        >
          <i className="fas fa-circle"></i>
        </button>
        
        <button 
          className="transport-button"
          onClick={onForward}
          title="Forward"
        >
          <i className="fas fa-forward"></i>
        </button>
      </div>
      
      <div className="tempo-control">
        <label htmlFor="tempo">BPM</label>
        <input 
          type="number" 
          id="tempo" 
          min="40"
          max="240"
          value={tempo}
          onChange={handleTempoChange}
        />
        <input 
          type="range"
          min="40"
          max="240"
          value={tempo}
          onChange={handleTempoChange}
        />
      </div>
    </div>
  );
};

export default TransportControls;
