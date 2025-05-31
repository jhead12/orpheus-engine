import React from 'react';
import { Track as TrackType } from '../../services/types/types';
import { useDAW } from '../../contexts/DAWContext';

interface TrackProps {
  track: TrackType;
  isSelected?: boolean;
  onSelect?: (trackId: string) => void;
}

const Track: React.FC<TrackProps> = ({ track, isSelected, onSelect }) => {
  const { audioService } = useDAW();

  return (
    <div className={`track ${isSelected ? 'selected' : ''}`} onClick={() => onSelect?.(track.id)}>
      <div className="track-header">
        <input type="text" value={track.name} className="track-name" />
        <div className="track-controls">
          <button className={`solo-btn ${track.solo ? 'active' : ''}`}>S</button>
          <button className={`mute-btn ${track.mute ? 'active' : ''}`}>M</button>
          <button className={`record-btn ${track.armed ? 'active' : ''}`}>R</button>
        </div>
      </div>
      <div className="track-content">
        {track.clips.map(clip => (
          <div key={clip.id} className="clip">
            {/* Clips will be rendered here */}
          </div>
        ))}
      </div>
      <div className="track-footer">
        <input type="range" className="volume-slider" min="-inf" max="6" value={track.volume} />
        <input type="range" className="pan-slider" min="-100" max="100" value={track.pan} />
      </div>
    </div>
  );
};

export default Track;
