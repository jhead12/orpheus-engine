import React, { useState } from 'react';
import { useDAW } from '../../../contexts/DAWContext';

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
  const [isMetronomeActive, setIsMetronomeActive] = useState(false);

  const handleStop = () => {
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
  
  const handleMetronomeToggle = () => {
    setIsMetronomeActive(!isMetronomeActive);
  };

  const formatPosition = (pos: { bar: number; beat: number; fraction: number }) => {
    return `${pos.bar + 1}.${pos.beat + 1}.${Math.floor(pos.fraction * 1000).toString().padStart(3, '0')}`;
  };

  return (
    <div className={`transport-controls ${className || ''}`}>
      <div className="transport-section main-controls">
        <button 
          className="transport-button"
          onClick={() => setPosition({ bar: 0, beat: 0, fraction: 0 })}
          title="Return to Start"
        >
          <i className="fas fa-step-backward"></i>
        </button>
        <button 
          className={`transport-button play-button ${isPlaying ? 'active' : ''}`} 
          onClick={togglePlayback}
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
        
        <button 
          className={`transport-button metronome-button ${isMetronomeActive ? 'active' : ''}`}
          onClick={handleMetronomeToggle}
          title="Toggle Metronome"
        >
          🎵
        </button>
      </div>

      <div className="transport-section tempo-section">
        <div className="time-signature-display">
          <select 
            value={`${timeSignature.beats}/${timeSignature.noteValue}`}
            onChange={(e) => {
              const [beats, noteValue] = e.target.value.split('/').map(Number);
              setTimeSignature({ beats, noteValue });
            }}
          >
            <option value="4/4">4/4</option>
            <option value="3/4">3/4</option>
            <option value="6/8">6/8</option>
          </select>
        </div>
        
        <div className="tempo-display">
          <input 
            type="number" 
            value={tempo} 
            onChange={(e) => setTempo(parseInt(e.target.value) || 120)}
            min="40"
            max="240"
          />
          <span className="bpm-label">BPM</span>
        </div>
      </div>

      <div className="transport-section position-section">
        <div className="position-display">
          {formatPosition(currentPosition)}
        </div>
      </div>
    </div>
  );
};

export default TransportControls;
