import React from 'react';
import { useDAW } from '../../contexts/DAWContext';

interface TransportControlsProps {
  className?: string;
}

const TransportControls: React.FC<TransportControlsProps> = ({ className }) => {
  const { 
    isPlaying, 
    togglePlayback, 
    currentPosition, 
    setPosition,
    tempo,
    setTempo
  } = useDAW();

  const handleStop = () => {
    // Stop playback and reset position
    if (isPlaying) {
      togglePlayback();
    }
    setPosition({ bar: 0, beat: 0, fraction: 0 });
  };

  const formatPosition = (pos: { bar: number; beat: number; fraction: number }) => {
    return `${pos.bar + 1}.${pos.beat + 1}.${Math.floor(pos.fraction * 1000).toString().padStart(3, '0')}`;
  };

  const handleTempoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTempo = parseInt(e.target.value);
    if (!isNaN(newTempo) && newTempo >= 40 && newTempo <= 240) {
      setTempo(newTempo);
    }
  };

  return (
    <div className={`transport-controls ${className || ''}`}>
      <div className="transport-section position-display">
        <div className="position-label">Position:</div>
        <div className="position-value">{formatPosition(currentPosition)}</div>
      </div>
      
      <div className="transport-section buttons">
        <button 
          className="transport-button" 
          onClick={handleStop}
          title="Stop"
        >
          ■
        </button>
        <button 
          className={`transport-button ${isPlaying ? 'active' : ''}`} 
          onClick={togglePlayback}
          title={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? '❚❚' : '▶'}
        </button>
        <button 
          className="transport-button"
          onClick={() => setPosition({ bar: 0, beat: 0, fraction: 0 })}
          title="Return to Start"
        >
          ⏮
        </button>
      </div>
      
      <div className="transport-section tempo-control">
        <div className="tempo-label">Tempo:</div>
        <input
          type="number"
          className="tempo-input"
          value={tempo}
          onChange={handleTempoChange}
          min="40"
          max="240"
        />
        <div className="tempo-unit">BPM</div>
      </div>
    </div>
  );
};

export default TransportControls;
