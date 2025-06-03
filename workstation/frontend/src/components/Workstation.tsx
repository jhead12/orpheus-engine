import React, { useState, useEffect } from 'react';
import { useDAW } from '../contexts/DAWContext';
import AudioClipEditor from './editor/AudioClipEditor';
import { Track, TimelinePosition, Clip } from '../services/types/types';
import { audioService } from '../services/audio/audioService';

interface WorkstationProps {
  isDesktopMode?: boolean;
}

const Workstation: React.FC<WorkstationProps> = ({ isDesktopMode = false }) => {
  const { clipService, aiManager, audioExporter } = useDAW();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedClip, setSelectedClip] = useState<Clip | null>(null);

  const handleExportClick = async () => {
    const clip = clipService.getCurrentClip();
    if (clip) {
      await audioExporter.exportClip(clip);
    }
  };

  const handlePlay = () => {
    setIsPlaying(true);
    audioService.play(clipService.getCurrentClip()?.data.buffer);
  };

  const handleStop = () => {
    setIsPlaying(false);
    audioService.stop();
  };

  const handleRecord = () => {
    setIsRecording(!isRecording);
    // Toggle recording state
  };

  useEffect(() => {
    // Initialize workstation based on mode
    if (isDesktopMode) {
      // Set desktop-specific configurations
      document.body.classList.add('desktop-mode');
    }
    
    return () => {
      document.body.classList.remove('desktop-mode');
    };
  }, [isDesktopMode]);

  return (
    <div className={`workstation ${isDesktopMode ? 'desktop' : ''}`}>
      <div className="workstation-header">
        <h1>Workstation</h1>
      </div>
      
      <div className="workstation-main">
        <div className="tracks-container">
          <div className="track-list">
            {tracks.map(track => (
              <div key={track.id} className="track">
                <div className="track-header">
                  <span>{track.name}</span>
                </div>
                <div className="track-content">
                  {track.clips.map(clip => (
                    <AudioClipEditor
                      key={clip.id}
                      clip={clip}
                      onSave={(updatedClip) => {
                        const updatedTracks = tracks.map(t => ({
                          ...t,
                          clips: t.clips.map(c => c.id === updatedClip.id ? updatedClip : c)
                        }));
                        setTracks(updatedTracks);
                      }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="workstation-footer">
        <div className="transport-controls">
          <button onClick={handlePlay}>Play</button>
          <button onClick={handleStop}>Stop</button>
          <button onClick={handleRecord}>Record</button>
        </div>
        <div className="controls">
          <button onClick={handleExportClick}>Export</button>
        </div>
      </div>
    </div>
  );
};

export default Workstation;
