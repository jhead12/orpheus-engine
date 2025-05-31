import React from 'react';
import { Track } from '../../types/types';
import { Box, Slider, IconButton, Typography } from '@mui/material';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import { formatVolume, formatPanning } from '../../services/utils/utils';

interface MixerProps {
  tracks: Track[];
  onVolumeChange: (trackId: string, value: number) => void;
  onPanChange: (trackId: string, value: number) => void;
  onMute: (trackId: string) => void;
  onSolo: (trackId: string) => void;
}

const Mixer: React.FC<MixerProps> = ({ tracks, onVolumeChange, onPanChange, onMute, onSolo }) => {
  return (
    <Box className="mixer-panel">
      <Typography variant="h6">Mixer</Typography>
      <Box className="mixer-channels">
        {tracks.map(track => (
          <Box key={track.id} className="mixer-channel">
            <Typography>{track.name}</Typography>
            
            <Slider
              orientation="vertical"
              min={-70}
              max={6}
              value={track.volume}
              onChange={(_, value) => onVolumeChange(track.id, value as number)}
              valueLabelDisplay="auto"
              valueLabelFormat={value => formatVolume(value)}
              className="volume-slider"
            />
            
            <Slider
              min={-100}
              max={100}
              value={track.pan}
              onChange={(_, value) => onPanChange(track.id, value as number)}
              valueLabelDisplay="auto"
              valueLabelFormat={value => formatPanning(value)}
              className="pan-slider"
            />
            
            <Box className="channel-controls">
              <IconButton 
                onClick={() => onMute(track.id)}
                color={track.mute ? "error" : "default"}
              >
                {track.mute ? <VolumeOffIcon /> : <VolumeUpIcon />}
              </IconButton>
              
              <IconButton
                onClick={() => onSolo(track.id)}
                color={track.solo ? "primary" : "default"}
              >
                S
              </IconButton>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default Mixer;
