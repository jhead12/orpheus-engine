import React from 'react';
import { useWorkstation } from '../contexts';

export const SidePanel: React.FC = () => {
  const { tracks } = useWorkstation();

  return (
    <div className="side-panel" style={{ width: '250px', borderRight: '1px solid #ccc' }}>
      <h3>Library</h3>
      <div>
        <h4>Tracks ({tracks.length})</h4>
        {tracks.map(track => (
          <div key={track.id} style={{ padding: '4px 8px' }}>
            {track.name}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SidePanel;
