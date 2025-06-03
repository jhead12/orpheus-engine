import React, { useState, useEffect, useMemo } from 'react';
import { useWorkstation, TrackType, TimelinePosition } from '../../contexts/src/index';
import './Workstation.css';

interface WorkstationProps {
  isDesktopMode?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

// Header Component
const WorkstationHeader: React.FC = () => {
  const { timelineSettings, isPlaying, togglePlayback, isRecording, startRecording, stopRecording } = useWorkstation();
  
  return (
    <div className="workstation-header">
      <div className="workstation-title">
        <h1>Orpheus Engine Workstation</h1>
      </div>
      
      <div className="transport-controls">
        <button 
          className={`transport-btn ${isPlaying ? 'active' : ''}`}
          onClick={togglePlayback}
        >
          {isPlaying ? '⏸️' : '▶️'}
        </button>
        <button className="transport-btn" onClick={() => {}}>⏹️</button>
        <button 
          className={`transport-btn ${isRecording ? 'recording' : ''}`}
          onClick={() => isRecording ? stopRecording() : startRecording('default')}
        >
          ⏺️
        </button>
      </div>
      
      <div className="tempo-controls">
        <label>BPM: {timelineSettings.tempo}</label>
        <input 
          type="range" 
          min="60" 
          max="200" 
          value={timelineSettings.tempo}
          onChange={(e) => {
            // Update tempo
          }}
        />
      </div>
    </div>
  );
};

// Timeline Component
const Timeline: React.FC = () => {
  const { playheadPos, numMeasures, timelineSettings } = useWorkstation();
  const [timelineWidth, setTimelineWidth] = useState(1000);
  
  const measures = Array.from({ length: numMeasures }, (_, i) => i + 1);
  
  return (
    <div className="timeline">
      <div className="timeline-ruler">
        {measures.map(measure => (
          <div key={measure} className="measure-marker">
            <span>{measure}</span>
          </div>
        ))}
      </div>
      <div 
        className="playhead" 
        style={{ 
          left: `${(playheadPos.toMargin() / timelineSettings.horizontalScale)}px` 
        }}
      />
    </div>
  );
};

// Track Component
const TrackComponent: React.FC<{ track: any; index: number }> = ({ track, index }) => {
  const { removeTrack, addClip, currentTrack, setCurrentTrack } = useWorkstation();
  const [isExpanded, setIsExpanded] = useState(true);
  
  const handleTrackClick = () => {
    setCurrentTrack(track);
  };
  
  const handleAddClip = () => {
    const newClip = {
      id: `clip_${Date.now()}`,
      trackId: track.id,
      name: 'New Clip',
      start: new TimelinePosition(0, 0, 0),
      length: new TimelinePosition(1, 0, 0),
      data: {
        type: 'audio' as const,
        buffer: new AudioBuffer({
          numberOfChannels: 2,
          length: 44100,
          sampleRate: 44100
        }),
        waveform: []
      }
    };
    addClip(track.id, newClip);
  };
  
  return (
    <div 
      className={`track ${currentTrack?.id === track.id ? 'selected' : ''}`}
      onClick={handleTrackClick}
    >
      <div className="track-header">
        <button 
          className="track-expand"
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
        >
          {isExpanded ? '▼' : '▶'}
        </button>
        
        <div className="track-info">
          <span className="track-name">{track.name}</span>
          <span className="track-type">{track.type}</span>
        </div>
        
        <div className="track-controls">
          <button 
            className={`track-btn mute ${track.mute ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              // Toggle mute
            }}
          >
            M
          </button>
          <button 
            className={`track-btn solo ${track.solo ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              // Toggle solo
            }}
          >
            S
          </button>
          <button 
            className="track-btn record"
            onClick={(e) => {
              e.stopPropagation();
              // Toggle record arm
            }}
          >
            R
          </button>
        </div>
        
        <button 
          className="track-delete"
          onClick={(e) => {
            e.stopPropagation();
            removeTrack(track.id);
          }}
        >
          ×
        </button>
      </div>
      
      {isExpanded && (
        <div className="track-content">
          <div className="track-clips">
            {track.clips.map((clip: any) => (
              <div 
                key={clip.id} 
                className="clip"
                style={{
                  left: `${clip.start.toMargin()}px`,
                  width: `${clip.length?.toMargin() || 100}px`,
                  backgroundColor: track.color || '#4ecdc4'
                }}
              >
                <span className="clip-name">{clip.name}</span>
              </div>
            ))}
          </div>
          <button className="add-clip-btn" onClick={handleAddClip}>
            + Add Clip
          </button>
        </div>
      )}
    </div>
  );
};

// Track List Component
const TrackList: React.FC = () => {
  const { tracks, addTrack } = useWorkstation();
  
  return (
    <div className="track-list">
      <div className="track-list-header">
        <button 
          className="add-track-btn"
          onClick={() => addTrack(TrackType.Audio)}
        >
          + Audio Track
        </button>
        <button 
          className="add-track-btn"
          onClick={() => addTrack(TrackType.MIDI)}
        >
          + MIDI Track
        </button>
      </div>
      
      <div className="tracks">
        {tracks.map((track, index) => (
          <TrackComponent key={track.id} track={track} index={index} />
        ))}
      </div>
    </div>
  );
};

// Mixer Component
const Mixer: React.FC = () => {
  const { tracks, showMixer, mixerHeight } = useWorkstation();
  
  if (!showMixer) return null;
  
  return (
    <div className="mixer" style={{ height: mixerHeight }}>
      <div className="mixer-header">
        <h3>Mixer</h3>
      </div>
      <div className="mixer-channels">
        {tracks.map(track => (
          <div key={track.id} className="mixer-channel">
            <div className="channel-label">{track.name}</div>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.01"
              value={track.volume}
              onChange={() => {}}
              className="volume-fader"
              style={{ 
                WebkitAppearance: 'slider-vertical',
                writingMode: 'vertical-lr',
                width: '20px',
                height: '100px'
              }}
            />
            <div className="channel-meter">
              <div className="meter-bar"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Main Workstation Component
const Workstation: React.FC<WorkstationProps> = ({ 
  isDesktopMode = false, 
  className = '', 
  style = {} 
}) => {
  const { 
    tracks, 
    isPlaying, 
    showMixer,
    mixerHeight,
    setMixerHeight 
  } = useWorkstation();

  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  const [sidebarWidth, setSidebarWidth] = useState(300);

  useEffect(() => {
    // Initialize workstation based on mode
    if (isDesktopMode) {
      document.body.classList.add('desktop-mode');
    }
    
    return () => {
      document.body.classList.remove('desktop-mode');
    };
  }, [isDesktopMode]);

  const workstationStyle = useMemo(() => ({
    height: '100vh',
    width: '100vw',
    display: 'flex',
    flexDirection: 'column' as const,
    backgroundColor: '#1a1a1a',
    color: '#ffffff',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    ...style
  }), [style]);

  return (
    <div 
      className={`workstation ${isDesktopMode ? 'desktop' : 'web'} ${className}`}
      style={workstationStyle}
    >
      <WorkstationHeader />
      
      <div className="workstation-main" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Timeline />
        
        <div className="workstation-content" style={{ flex: 1, display: 'flex' }}>
          <TrackList />
        </div>
        
        <Mixer />
      </div>
      
      <div className="workstation-footer">
        <div className="status-bar">
          <span>Tracks: {tracks.length}</span>
          <span>Status: {isPlaying ? 'Playing' : 'Stopped'}</span>
          <span>Position: {/* playhead position */}</span>
        </div>
      </div>
    </div>
  );
};

export default Workstation;
