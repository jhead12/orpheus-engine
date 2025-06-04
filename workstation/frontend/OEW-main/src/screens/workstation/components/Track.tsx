import React, { useState } from 'react';
import { useWorkstation } from '../../../contexts/WorkstationContext';
import TrackVolumeSlider from './TrackVolumeSlider';
import AutomationLaneComponent from './AutomationLaneComponent';
import ClipComponent from './ClipComponent';
import AudioClipComponent from './AudioClipComponent';

interface TrackProps {
  track: {
    id: string;
    name: string;
    color: string;
    muted: boolean;
    solo: boolean;
    volume: number;
    clips: any[];
    automationLanes: any[];
  };
  height: number;
  index: number;
}

const Track: React.FC<TrackProps> = ({ track, height, index }) => {
  const { setSelectedTrackId, selectedTrackId } = useWorkstation();
  const [showAutomation, setShowAutomation] = useState(false);
  const isSelected = selectedTrackId === track.id;

  const handleTrackHeaderClick = () => {
    setSelectedTrackId(track.id);
  };

  const toggleAutomation = () => {
    setShowAutomation(!showAutomation);
  };

  return (
    <div className={`track ${isSelected ? 'selected' : ''}`}>
      <div 
        className="track-header" 
        onClick={handleTrackHeaderClick}
        style={{ background: isSelected ? '#3a3a3a' : '#2d2d2d' }}
      >
        <div className="track-color-indicator" style={{ backgroundColor: track.color }}></div>
        <div className="track-name">{track.name}</div>
        <div className="track-controls">
          <button className={`track-button ${track.muted ? 'active' : ''}`} title="Mute">M</button>
          <button className={`track-button ${track.solo ? 'active' : ''}`} title="Solo">S</button>
          <button 
            className={`track-button ${showAutomation ? 'active' : ''}`} 
            title="Show/Hide Automation"
            onClick={toggleAutomation}
          >A</button>
          <TrackVolumeSlider value={track.volume} onChange={() => {}} />
        </div>
      </div>
      
      <div className="track-content" style={{ height: `${height}px` }}>
        {track.clips.map((clip, i) => 
          clip.type === 'audio' ? (
            <AudioClipComponent 
              key={i} 
              clip={clip} 
              trackId={track.id} 
            />
          ) : (
            <ClipComponent 
              key={i} 
              clip={clip} 
              trackId={track.id} 
            />
          )
        )}
      </div>
      
      {showAutomation && track.automationLanes.map((lane, i) => (
        <AutomationLaneComponent 
          key={i} 
          lane={lane} 
          trackId={track.id}
        />
      ))}
    </div>
  );
};

export default Track;
