import React, { useState } from 'react';
import { Box, IconButton, Typography, Tooltip } from '@mui/material';
import { 
  PlayArrow, Pause, Stop, SkipNext, SkipPrevious, 
  FastForward, FastRewind, FiberManualRecord, Loop,
  Undo, Redo, Save, Add
} from '@mui/icons-material';
import { useDAW } from '../../contexts/DAWContext';

interface TransportControlsProps {
  bpm?: number;
  onBpmChange?: (bpm: number) => void;
}

const TransportControls: React.FC<TransportControlsProps> = ({ 
  bpm = 120, 
  onBpmChange 
}) => {
  const { isPlaying, togglePlayback, currentPosition, setPosition } = useDAW();
  const [timeSignature, setTimeSignature] = useState('4/4');
  const [isRecording, setIsRecording] = useState(false);
  const [isLooping, setIsLooping] = useState(false);

  const formattedPosition = () => {
    const bar = Math.floor(currentPosition / 4) + 1;
    const beat = (currentPosition % 4) + 1;
    return `${bar}.${beat}.00`;
  };

  const handleRecord = () => {
    setIsRecording(!isRecording);
  };

  const handleLoop = () => {
    setIsLooping(!isLooping);
  };

  const handleBpmChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newBpm = parseInt(event.target.value);
    if (onBpmChange && !isNaN(newBpm) && newBpm > 0 && newBpm <= 999) {
      onBpmChange(newBpm);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#222',
        padding: '8px 16px',
        borderBottom: '1px solid #333',
        height: '60px'
      }}
    >
      {/* Left section - Undo/Redo/Save */}
      <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
        <Tooltip title="Undo">
          <IconButton size="small" sx={{ color: '#aaa' }}>
            <Undo />
          </IconButton>
        </Tooltip>
        <Tooltip title="Redo">
          <IconButton size="small" sx={{ color: '#aaa' }}>
            <Redo />
          </IconButton>
        </Tooltip>
        <Tooltip title="Save Project">
          <IconButton size="small" sx={{ color: '#aaa' }}>
            <Save />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Center section - Transport controls */}
      <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, justifyContent: 'center' }}>
        <Tooltip title="To Start">
          <IconButton sx={{ color: 'white' }}>
            <SkipPrevious />
          </IconButton>
        </Tooltip>
        <Tooltip title="Rewind">
          <IconButton sx={{ color: 'white' }}>
            <FastRewind />
          </IconButton>
        </Tooltip>
        <Tooltip title={isPlaying ? "Pause" : "Play"}>
          <IconButton 
            onClick={togglePlayback} 
            sx={{
              color: isPlaying ? '#1ed760' : 'white',
              bgcolor: isPlaying ? 'rgba(30, 215, 96, 0.1)' : 'transparent',
              '&:hover': {
                bgcolor: isPlaying ? 'rgba(30, 215, 96, 0.2)' : 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            {isPlaying ? <Pause /> : <PlayArrow />}
          </IconButton>
        </Tooltip>
        <Tooltip title="Stop">
          <IconButton sx={{ color: 'white' }}>
            <Stop />
          </IconButton>
        </Tooltip>
        <Tooltip title="Fast Forward">
          <IconButton sx={{ color: 'white' }}>
            <FastForward />
          </IconButton>
        </Tooltip>
        <Tooltip title="To End">
          <IconButton sx={{ color: 'white' }}>
            <SkipNext />
          </IconButton>
        </Tooltip>
        <Tooltip title={isRecording ? "Stop Recording" : "Record"}>
          <IconButton 
            onClick={handleRecord}
            sx={{
              color: isRecording ? '#f50057' : 'white',
              bgcolor: isRecording ? 'rgba(245, 0, 87, 0.1)' : 'transparent',
              '&:hover': {
                bgcolor: isRecording ? 'rgba(245, 0, 87, 0.2)' : 'rgba(255, 255, 255, 0.1)'
              },
              ml: 2
            }}
          >
            <FiberManualRecord />
          </IconButton>
        </Tooltip>
        <Tooltip title={isLooping ? "Disable Loop" : "Enable Loop"}>
          <IconButton 
            onClick={handleLoop}
            sx={{
              color: isLooping ? '#FFD700' : 'white',
              bgcolor: isLooping ? 'rgba(255, 215, 0, 0.1)' : 'transparent',
              '&:hover': {
                bgcolor: isLooping ? 'rgba(255, 215, 0, 0.2)' : 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            <Loop />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Right section - Time signature, BPM, Position */}
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mx: 2 }}>
          <Typography variant="caption" sx={{ color: '#aaa' }}>Signature</Typography>
          <Typography variant="body2" sx={{ color: 'white' }}>{timeSignature}</Typography>
        </Box>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mx: 2 }}>
          <Typography variant="caption" sx={{ color: '#aaa' }}>BPM</Typography>
          <input 
            type="number" 
            value={bpm}
            onChange={handleBpmChange}
            min="20"
            max="999"
            style={{
              width: '40px',
              backgroundColor: '#333',
              color: '#FF69B4',
              border: 'none',
              textAlign: 'center',
              fontSize: '14px'
            }}
          />
        </Box>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', ml: 2 }}>
          <Typography variant="caption" sx={{ color: '#aaa' }}>Position</Typography>
          <Typography variant="body2" sx={{ color: 'white', fontFamily: 'monospace' }}>
            {formattedPosition()}
          </Typography>
        </Box>
        
        <Tooltip title="Add Track">
          <IconButton 
            sx={{ 
              bgcolor: '#444',
              color: 'white',
              ml: 2,
              '&:hover': {
                bgcolor: '#555'
              }
            }}
          >
            <Add />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};

export default TransportControls;
