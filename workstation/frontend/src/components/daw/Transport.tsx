import React from 'react';
import { useDAW } from '../../contexts/DAWContext';
import { TimelinePosition } from '../../services/types/types';

interface TransportProps {
  isPlaying: boolean;
  isRecording: boolean;
  position: TimelinePosition;
  tempo: number;
  onTempoChange: (tempo: number) => void;
}

const Transport: React.FC<TransportProps> = ({
  isPlaying,
  isRecording,
  position,
  tempo,
  onTempoChange
}) => {
  const { audioService } = useDAW();

  return (
    <div className="transport-controls">
      <div className="transport-buttons">
        <button className="rewind-btn">⏪</button>
        <button className={`play-btn ${isPlaying ? 'active' : ''}`}>
          {isPlaying ? '⏸' : '▶'}
        </button>
        <button className={`record-btn ${isRecording ? 'active' : ''}`}>⏺</button>
        <button className="stop-btn">⏹</button>
      </div>
      
      <div className="transport-position">
        <span className="position-display">
          {`${position.bar}:${position.beat}:${position.fraction}`}
        </span>
      </div>
      
      <div className="transport-tempo">
        <input
          type="number"
          value={tempo}
          onChange={(e) => onTempoChange(parseInt(e.target.value))}
          min="20"
          max="300"
        />
        <span>BPM</span>
      </div>
      
      <div className="transport-meters">
        <div className="cpu-meter">CPU: 0%</div>
        <div className="memory-meter">MEM: 0%</div>
      </div>
    </div>
  );
};

export default Transport;
