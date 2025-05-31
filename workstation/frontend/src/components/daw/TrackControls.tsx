import React from 'react';
import { useMixer } from '../../contexts/MixerContext';
import { Box, Slider, IconButton, Typography } from '@mui/material';
import { VolumeUp, VolumeOff, RadioButtonChecked } from '@mui/icons-material';

interface TrackControlsProps {
  trackId: string;
  name: string;
  volume: number;
  pan: number;
}

const TrackControls: React.FC<TrackControlsProps> = ({
  trackId,
  name,
  volume,
  pan
}) => {
  const { 
    updateTrackVolume, 
    updateTrackPan, 
    muteTrack, 
    soloTrack, 
    isMuted, 
    isSolo 
  } = useMixer();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: 1,
        gap: 1,
        minWidth: 120,
        backgroundColor: '#2d2d2d',
        borderRadius: 1
      }}
    >
      <Typography variant="subtitle2" noWrap>
        {name}
      </Typography>

      {/* Volume slider */}
      <Slider
        orientation="vertical"
        value={volume}
        min={0}
        max={1}
        step={0.01}
        onChange={(_, value) => updateTrackVolume(trackId, value as number)}
        sx={{ height: 100 }}
      />

      {/* Pan slider */}
      <Slider
        value={pan}
        min={-1}
        max={1}
        step={0.01}
        onChange={(_, value) => updateTrackPan(trackId, value as number)}
        sx={{ width: '80%' }}
      />

      {/* Mute/Solo buttons */}
      <Box sx={{ display: 'flex', gap: 1 }}>
        <IconButton
          size="small"
          onClick={() => muteTrack(trackId)}
          color={isMuted(trackId) ? 'error' : 'default'}
        >
          <VolumeOff />
        </IconButton>
        <IconButton
          size="small"
          onClick={() => soloTrack(trackId)}
          color={isSolo(trackId) ? 'primary' : 'default'}
        >
          <RadioButtonChecked />
        </IconButton>
      </Box>
    </Box>
  );
};

export default TrackControls;
