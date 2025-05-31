import React from 'react';
import { Box } from '@mui/material';
import TrackControls from './TrackControls';
import { useWorkstation } from '../../contexts/WorkstationContext';

const MixerControls: React.FC = () => {
  const { tracks } = useWorkstation();

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 2,
        padding: 2,
        overflowX: 'auto',
        backgroundColor: '#1e1e1e',
        borderTop: '1px solid #333'
      }}
    >
      {tracks.map(track => (
        <TrackControls
          key={track.id}
          trackId={track.id}
          name={track.name}
          volume={track.volume}
          pan={track.pan}
        />
      ))}
    </Box>
  );
};

export default MixerControls;
