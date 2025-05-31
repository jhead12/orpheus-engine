import React from 'react';
import { useWorkstation } from '../contexts/WorkstationProvider';

const Workstation: React.FC = () => {
  const workstation = useWorkstation();

  return (
    <div className="workstation">
      <div className="workstation-header">
        <h1>Workstation</h1>
      </div>
      
      <div className="workstation-main">
        <div className="track-list">
          {workstation.tracks.map(track => (
            <div key={track.id} className="track">
              <div className="track-header">
                <span>{track.name}</span>
              </div>
              <div className="track-content">
                {/* Track content will be rendered here */}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="workstation-footer">
        {/* Transport controls */}
        <div className="transport-controls">
          <button onClick={workstation.play}>Play</button>
          <button onClick={workstation.stop}>Stop</button>
          <button onClick={workstation.record}>Record</button>
        </div>
      </div>
    </div>
  );
};

export default Workstation;
