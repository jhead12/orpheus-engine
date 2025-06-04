import React, { useState } from 'react';
import { IconButton, Select, MenuItem, TextField } from '@mui/material';
import { 
  PlayArrow, 
  Pause, 
  Stop, 
  FiberManualRecord,
  Repeat,
  SkipPrevious,
  Save,
  Undo,
  Redo,
  Add
} from '@mui/icons-material';

interface TransportControlsProps {
  className?: string;
  isPlaying?: boolean;
  onTogglePlayback?: () => void;
  currentPosition?: { bar: number; beat: number; fraction: number };
  onSetPosition?: (position: { bar: number; beat: number; fraction: number }) => void;
  tempo?: number;
  onTempoChange?: (tempo: number) => void;
  timeSignature?: { beats: number; noteValue: number };
  onTimeSignatureChange?: (timeSignature: { beats: number; noteValue: number }) => void;
  onAddTrack?: () => void;
}

const TransportControls: React.FC<TransportControlsProps> = ({ 
  className,
  isPlaying = false,
  onTogglePlayback,
  currentPosition = { bar: 0, beat: 0, fraction: 0 },
  onSetPosition,
  tempo = 120,
  onTempoChange,
  timeSignature = { beats: 4, noteValue: 4 },
  onTimeSignatureChange,
  onAddTrack
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isLooping, setIsLooping] = useState(false);

  const handleStop = () => {
    if (isPlaying) {
      onTogglePlayback?.();
    }
    onSetPosition?.({ bar: 0, beat: 0, fraction: 0 });
  };

  const handleRecord = () => {
    setIsRecording(!isRecording);
  };

  const handleLoop = () => {
    setIsLooping(!isLooping);
  };

  const formatPosition = (pos: { bar: number; beat: number; fraction: number }) => {
    return `${pos.bar + 1}.${pos.beat + 1}.${Math.floor(pos.fraction * 1000).toString().padStart(3, '0')}`;
  };

  const handleTempoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTempo = parseInt(e.target.value);
    if (!isNaN(newTempo) && newTempo >= 40 && newTempo <= 240) {
      onTempoChange?.(newTempo);
    }
  };

  const handleTimeSignatureChange = (value: string) => {
    const [beats, noteValue] = value.split('/').map(Number);
    onTimeSignatureChange?.({ beats, noteValue });
  };

  const controlButtonStyle = {
    width: 32,
    height: 32,
    margin: '0 2px',
    border: '1px solid var(--border1)',
    borderRadius: 4,
    backgroundColor: 'var(--bg2)',
    color: 'var(--border6)',
    '&:hover': {
      backgroundColor: 'var(--bg3)',
    }
  };

  const activeButtonStyle = {
    ...controlButtonStyle,
    backgroundColor: 'var(--color1)',
    color: 'white',
    '&:hover': {
      backgroundColor: 'var(--color1)',
    }
  };

  return (
    <div 
      className={`d-flex align-items-center justify-content-between p-2 ${className || ''}`}
      style={{ 
        backgroundColor: 'var(--bg2)', 
        borderBottom: '1px solid var(--border1)',
        height: 50
      }}
    >
      {/* Left section - Main transport controls */}
      <div className="d-flex align-items-center">
        <IconButton sx={controlButtonStyle} title="Undo">
          <Undo fontSize="small" />
        </IconButton>
        <IconButton sx={controlButtonStyle} title="Redo">
          <Redo fontSize="small" />
        </IconButton>
        <IconButton sx={controlButtonStyle} title="Save">
          <Save fontSize="small" />
        </IconButton>
        
        <div style={{ width: 1, height: 24, backgroundColor: 'var(--border1)', margin: '0 8px' }} />
        
        <IconButton 
          sx={controlButtonStyle}
          onClick={() => onSetPosition?.({ bar: 0, beat: 0, fraction: 0 })}
          title="To Start"
        >
          <SkipPrevious fontSize="small" />
        </IconButton>
        
        <IconButton 
          sx={isPlaying ? activeButtonStyle : controlButtonStyle}
          onClick={onTogglePlayback}
          title={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? <Pause fontSize="small" /> : <PlayArrow fontSize="small" />}
        </IconButton>
        
        <IconButton 
          sx={controlButtonStyle}
          onClick={handleStop}
          title="Stop"
        >
          <Stop fontSize="small" />
        </IconButton>
        
        <IconButton 
          sx={isRecording ? { ...activeButtonStyle, backgroundColor: '#f44336' } : controlButtonStyle}
          onClick={handleRecord}
          title={isRecording ? "Stop Recording" : "Record"}
        >
          <FiberManualRecord fontSize="small" />
        </IconButton>
        
        <div style={{ width: 1, height: 24, backgroundColor: 'var(--border1)', margin: '0 8px' }} />
        
        <IconButton 
          sx={isLooping ? activeButtonStyle : controlButtonStyle}
          onClick={handleLoop}
          title={isLooping ? "Disable Loop" : "Enable Loop"}
        >
          <Repeat fontSize="small" />
        </IconButton>
      </div>

      {/* Center section - Time signature and tempo */}
      <div className="d-flex align-items-center gap-3">
        <div className="d-flex align-items-center">
          <span style={{ fontSize: 12, color: 'var(--border6)', marginRight: 4 }}>Time</span>
          <Select
            value={`${timeSignature.beats}/${timeSignature.noteValue}`}
            onChange={(e) => handleTimeSignatureChange(e.target.value)}
            size="small"
            sx={{
              minWidth: 60,
              height: 28,
              '& .MuiOutlinedInput-notchedOutline': {
                border: '1px solid var(--border1)',
              },
              '& .MuiSelect-select': {
                padding: '4px 8px',
                fontSize: 12,
                color: 'var(--border6)',
                backgroundColor: 'var(--bg3)',
              }
            }}
          >
            <MenuItem value="4/4">4/4</MenuItem>
            <MenuItem value="3/4">3/4</MenuItem>
            <MenuItem value="2/4">2/4</MenuItem>
            <MenuItem value="6/8">6/8</MenuItem>
          </Select>
        </div>
        
        <div className="d-flex align-items-center">
          <span style={{ fontSize: 12, color: 'var(--border6)', marginRight: 4 }}>BPM</span>
          <TextField
            type="number"
            value={tempo}
            onChange={handleTempoChange}
            inputProps={{ min: 40, max: 240 }}
            size="small"
            sx={{
              width: 70,
              '& .MuiOutlinedInput-root': {
                height: 28,
                '& fieldset': {
                  border: '1px solid var(--border1)',
                },
                '& input': {
                  padding: '4px 8px',
                  fontSize: 12,
                  color: 'var(--border6)',
                  backgroundColor: 'var(--bg3)',
                  textAlign: 'center',
                }
              }
            }}
          />
        </div>
      </div>

      {/* Right section - Position display and controls */}
      <div className="d-flex align-items-center">
        <div 
          style={{ 
            padding: '4px 12px',
            backgroundColor: 'var(--bg1)',
            border: '1px solid var(--border1)',
            borderRadius: 4,
            fontSize: 14,
            fontFamily: 'monospace',
            color: 'var(--border7)',
            marginRight: 12
          }}
        >
          {formatPosition(currentPosition)}
        </div>
        
        <IconButton 
          sx={controlButtonStyle}
          onClick={onAddTrack}
          title="Add Track"
        >
          <Add fontSize="small" />
        </IconButton>
      </div>
    </div>
  );
};

export default TransportControls;
