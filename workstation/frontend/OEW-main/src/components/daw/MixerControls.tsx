import React, { useState } from 'react';
import { useWorkstation } from '../../contexts/WorkstationContext';
import { useDAW } from '../../contexts/DAWContext';

const MixerControls: React.FC = () => {
  const { tracks } = useWorkstation();
  const { isPlaying, togglePlayback, tempo, setTempo } = useDAW();
  const [showMixer, setShowMixer] = useState(true);

  return (
    <div className="mixer-container">
      <div className="mixer-header">
        <button 
          className={`control-button ${isPlaying ? 'active' : ''}`}
          onClick={togglePlayback}
        >
          {isPlaying ? '⏸ Pause' : '▶ Play'}
        </button>
        
        <div className="tempo-control">
          <label htmlFor="tempo">Tempo:</label>
          <input
            id="tempo"
            type="number"
            min="40"
            max="240"
            value={tempo}
            onChange={(e) => setTempo(Number(e.target.value))}
          />
          <span>BPM</span>
        </div>
        
        <button 
          className="toggle-mixer-button"
          onClick={() => setShowMixer(!showMixer)}
        >
          {showMixer ? 'Hide Mixer' : 'Show Mixer'}
        </button>
      </div>
      
      {showMixer && (
        <div className="mixer-tracks">
          {tracks.map(track => (
            <div key={track.id} className="mixer-track">
              <div className="track-name">{track.name}</div>
              <div className="track-controls">
                <div className="volume-slider">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={track.volume || 0.75}
                    onChange={(e) => {
                      // Handle volume change through Workstation context
                    }}
                    className="vertical-slider"
                  />
                </div>
                <div className="track-buttons">
                  <button 
                    className={`track-button ${track.muted ? 'active' : ''}`}
                    title="Mute"
                  >
                    M
                  </button>
                  <button 
                    className={`track-button ${track.solo ? 'active' : ''}`}
                    title="Solo"
                  >
                    S
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MixerControls;
