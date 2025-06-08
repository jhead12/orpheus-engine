import React, { useState } from 'react';
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
    setTempo,
    timeSignature,
    setTimeSignature
  } = useDAW();
  
  const [isRecording, setIsRecording] = useState(false);
  const [isLooping, setIsLooping] = useState(false);

  const handleStop = () => {
    // Stop playback and reset position
    if (isPlaying) {
      togglePlayback();
    }
    setPosition({ bar: 0, beat: 0, fraction: 0 });
  };

  const handleRecord = () => {
    setIsRecording(!isRecording);
  };

  const handleLoop = () => {
    setIsLooping(!isLooping);
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

  const handleTimeSignatureChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [beats, noteValue] = e.target.value.split('/').map(Number);
    setTimeSignature({ beats, noteValue });
  };

  return (
    <div className={`transport-controls ${className || ''}`}>
      {/* Left section - Main transport controls */}
      <div className="transport-section main-controls">
        <button 
          className="transport-button undo-btn"
          title="Undo"
        >
          ↶
        </button>
        <button 
          className="transport-button redo-btn"
          title="Redo"
        >
          ↷
        </button>
        <button 
          className="transport-button save-btn"
          title="Save"
        >
          💾
        </button>
        
        <div className="transport-divider"></div>
        
        <button 
          className="transport-button"
          onClick={() => setPosition({ bar: 0, beat: 0, fraction: 0 })}
          title="To Start"
        >
          ⏮
        </button>
        <button 
          className={`transport-button play-button ${isPlaying ? 'active' : ''}`} 
          onClick={togglePlayback}
          title={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>
        <button 
          className="transport-button" 
          onClick={handleStop}
          title="Stop"
        >
          ⏹
        </button>
        <button 
          className={`transport-button record-button ${isRecording ? 'recording' : ''}`}
          onClick={handleRecord}
          title={isRecording ? "Stop Recording" : "Record"}
        >
          ⏺
        </button>
        
        <div className="transport-divider"></div>
        
        <button 
          className={`transport-button loop-button ${isLooping ? 'active' : ''}`}
          onClick={handleLoop}
          title={isLooping ? "Disable Loop" : "Enable Loop"}
        >
          🔁
        </button>
      </div>

      {/* Center section - Time signature and tempo */}
      <div className="transport-section tempo-section">
        <div className="time-signature-display">
          <select
            className="time-sig-select"
            value={`${timeSignature.beats}/${timeSignature.noteValue}`}
            onChange={handleTimeSignatureChange}
          >
            <option value="4/4">4/4</option>
            <option value="3/4">3/4</option>
            <option value="2/4">2/4</option>
            <option value="6/8">6/8</option>
          </select>
        </div>
        
        <div className="tempo-display">
          <input
            type="number"
            className="tempo-input"
            value={tempo}
            onChange={handleTempoChange}
            min="40"
            max="240"
          />
        </div>
      </div>

      {/* Right section - Position display */}
      <div className="transport-section position-section">
        <div className="position-display">
          <div className="position-value">{formatPosition(currentPosition)}</div>
        </div>
        
        <button 
          className="transport-button add-track-button"
          title="Add Track"
        >
          ➕
        </button>
      </div>
    </div>
  );
};

export default TransportControls;
