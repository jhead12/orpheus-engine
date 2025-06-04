import React, { useState } from 'react';
import './TrackManager.css';

const Track = ({ track, onVolumeChange, onPanChange, onMute, onSolo, onRemoveTrack }) => {
  return (
    <div className="track">
      <div className="track-header">
        <div className="track-name">{track.name}</div>
        <div className="track-controls">
          <button 
            className={`track-control-button ${track.mute ? 'active' : ''}`}
            onClick={() => onMute(track.id)}
          >
            M
          </button>
          <button 
            className={`track-control-button ${track.solo ? 'active' : ''}`}
            onClick={() => onSolo(track.id)}
          >
            S
          </button>
          <button 
            className="track-control-button remove"
            onClick={() => onRemoveTrack(track.id)}
          >
            X
          </button>
        </div>
      </div>
      
      <div className="track-parameters">
        <div className="parameter">
          <label>Volume</label>
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={track.volume} 
            onChange={(e) => onVolumeChange(track.id, parseInt(e.target.value))}
          />
          <span className="value">{track.volume}</span>
        </div>
        
        <div className="parameter">
          <label>Pan</label>
          <input 
            type="range" 
            min="-100" 
            max="100" 
            value={track.pan} 
            onChange={(e) => onPanChange(track.id, parseInt(e.target.value))}
          />
          <span className="value">{track.pan}</span>
        </div>
      </div>
      
      <div className="track-content">
        {track.clips.map(clip => (
          <div 
            key={clip.id}
            className="audio-clip"
            style={{ 
              left: `${clip.startTime * 100 / 60}%`,
              width: `${clip.duration * 100 / 60}%`,
              backgroundColor: track.color
            }}
          >
            {clip.name}
          </div>
        ))}
      </div>
    </div>
  );
};

const TrackManager = () => {
  const [tracks, setTracks] = useState([
    {
      id: 1,
      name: 'Track 1',
      volume: 80,
      pan: 0,
      mute: false,
      solo: false,
      color: '#809fff',
      clips: [
        { id: 1, name: 'Clip 1', startTime: 5, duration: 15 },
        { id: 2, name: 'Clip 2', startTime: 25, duration: 10 }
      ]
    },
    {
      id: 2,
      name: 'Track 2',
      volume: 70,
      pan: -20,
      mute: false,
      solo: false,
      color: '#ff8080',
      clips: [
        { id: 3, name: 'Clip 3', startTime: 0, duration: 20 }
      ]
    }
  ]);

  const handleVolumeChange = (trackId, value) => {
    setTracks(tracks.map(track => 
      track.id === trackId ? { ...track, volume: value } : track
    ));
  };

  const handlePanChange = (trackId, value) => {
    setTracks(tracks.map(track => 
      track.id === trackId ? { ...track, pan: value } : track
    ));
  };

  const handleMute = (trackId) => {
    setTracks(tracks.map(track => 
      track.id === trackId ? { ...track, mute: !track.mute } : track
    ));
  };

  const handleSolo = (trackId) => {
    setTracks(tracks.map(track => 
      track.id === trackId ? { ...track, solo: !track.solo } : track
    ));
  };

  const handleRemoveTrack = (trackId) => {
    setTracks(tracks.filter(track => track.id !== trackId));
  };

  const addNewTrack = () => {
    const newId = Math.max(0, ...tracks.map(t => t.id)) + 1;
    const colors = ['#809fff', '#ff8080', '#80ff80', '#ffff80', '#ff80ff'];
    
    setTracks([
      ...tracks,
      {
        id: newId,
        name: `Track ${newId}`,
        volume: 75,
        pan: 0,
        mute: false,
        solo: false,
        color: colors[newId % colors.length],
        clips: []
      }
    ]);
  };

  return (
    <div className="track-manager">
      <div className="tracks-container">
        {tracks.map(track => (
          <Track 
            key={track.id}
            track={track}
            onVolumeChange={handleVolumeChange}
            onPanChange={handlePanChange}
            onMute={handleMute}
            onSolo={handleSolo}
            onRemoveTrack={handleRemoveTrack}
          />
        ))}
      </div>
      <button className="add-track-button" onClick={addNewTrack}>
        + Add Track
      </button>
    </div>
  );
};

export default TrackManager;
