import React, { useState, useCallback } from 'react';
import { useMixer } from '@orpheus/contexts/MixerContext';
import { TrackType } from '@orpheus/types/core';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Card,
  CardContent,
  Box,
  IconButton,
  Tooltip,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ContentCopy as DuplicateIcon,
  MusicNote as MidiIcon,
  AudioFile as AudioIcon,
  VolumeUp as VolumeIcon,
  RecordVoiceOver as RecordIcon,
  VolumeOff as MuteIcon,
  HeadsetMic as SoloIcon,
} from '@mui/icons-material';

interface ChannelManagerProps {
  className?: string;
}

interface AddChannelDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (type: TrackType, name: string) => void;
}

const AddChannelDialog: React.FC<AddChannelDialogProps> = ({
  open,
  onClose,
  onAdd,
}) => {
  const [channelName, setChannelName] = useState('');
  const [channelType, setChannelType] = useState<TrackType>(TrackType.Audio);

  const handleAdd = () => {
    if (channelName.trim()) {
      onAdd(channelType, channelName.trim());
      setChannelName('');
      onClose();
    }
  };

  const handleClose = () => {
    setChannelName('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add New Channel</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField
            label="Channel Name"
            value={channelName}
            onChange={(e) => setChannelName(e.target.value)}
            fullWidth
            placeholder="Enter channel name..."
            autoFocus
          />

          <FormControl fullWidth>
            <InputLabel>Channel Type</InputLabel>
            <Select
              value={channelType}
              onChange={(e) => setChannelType(e.target.value as TrackType)}
              label="Channel Type"
            >
              <MenuItem value={TrackType.Audio}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AudioIcon />
                  Audio Track
                </Box>
              </MenuItem>
              <MenuItem value={TrackType.Midi}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <MidiIcon />
                  MIDI Track
                </Box>
              </MenuItem>
            </Select>
          </FormControl>

          <Typography variant="body2" color="text.secondary">
            Channel features included:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            <Chip size="small" icon={<VolumeIcon />} label="Volume Control" />
            <Chip size="small" icon={<RecordIcon />} label="Recording" />
            <Chip size="small" icon={<MuteIcon />} label="Mute/Solo" />
            <Chip size="small" label="Plugin Chain" />
            <Chip size="small" label="Mixer Lane" />
            <Chip size="small" label="Audio Routing" />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleAdd}
          variant="contained"
          disabled={!channelName.trim()}
        >
          Add Channel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const ChannelManager: React.FC<ChannelManagerProps> = ({ className }) => {
  const { tracks, addTrack, removeTrack, duplicateTrack } = useMixer();

  const [dialogOpen, setDialogOpen] = useState(false);

  const handleAddChannel = useCallback(
    (type: TrackType, name: string) => {
      addTrack(type, name);
    },
    [addTrack],
  );

  const handleRemoveChannel = useCallback(
    (trackId: string) => {
      // In a real app, you might want to use a proper dialog component
      removeTrack(trackId);
    },
    [removeTrack],
  );

  const handleDuplicateChannel = useCallback(
    (trackId: string) => {
      duplicateTrack(trackId);
    },
    [duplicateTrack],
  );

  return (
    <Card className={className}>
      <CardContent>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <Typography variant="h6" component="h2">
            Channel Manager
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setDialogOpen(true)}
          >
            Add Channel
          </Button>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Total Channels: {tracks.length}
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {tracks.map((track) => (
            <Card key={track.id} variant="outlined">
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      flex: 1,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {track.type === TrackType.Audio ? (
                        <AudioIcon />
                      ) : (
                        <MidiIcon />
                      )}
                      <Typography variant="subtitle2">{track.name}</Typography>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Chip
                        size="small"
                        label={
                          track.type === TrackType.Audio ? 'Audio' : 'MIDI'
                        }
                        color={
                          track.type === TrackType.Audio
                            ? 'primary'
                            : 'secondary'
                        }
                      />
                      {track.armed && (
                        <Chip
                          size="small"
                          icon={<RecordIcon />}
                          label="REC"
                          color="error"
                        />
                      )}
                      {track.mute && (
                        <Chip size="small" icon={<MuteIcon />} label="MUTE" />
                      )}
                      {track.solo && (
                        <Chip
                          size="small"
                          icon={<SoloIcon />}
                          label="SOLO"
                          color="warning"
                        />
                      )}
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Duplicate Channel">
                      <IconButton
                        size="small"
                        onClick={() => handleDuplicateChannel(track.id)}
                      >
                        <DuplicateIcon />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Remove Channel">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleRemoveChannel(track.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>

                {/* Channel Details */}
                <Box
                  sx={{ mt: 1, display: 'flex', gap: 2, fontSize: '0.875rem' }}
                >
                  <Typography variant="caption">
                    Vol: {(track.volume.value * 100).toFixed(0)}%
                  </Typography>
                  <Typography variant="caption">
                    Pan:{' '}
                    {track.pan.value > 0
                      ? 'R'
                      : track.pan.value < 0
                        ? 'L'
                        : 'C'}
                    {Math.abs(track.pan.value * 100).toFixed(0)}
                  </Typography>
                  <Typography variant="caption">
                    FX: {track.effects?.length || 0}
                  </Typography>
                  <Typography variant="caption">
                    Clips: {track.clips?.length || 0}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          ))}

          {tracks.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body2" color="text.secondary">
                No channels yet. Click &quot;Add Channel&quot; to create your
                first channel.
              </Typography>
            </Box>
          )}
        </Box>

        <AddChannelDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          onAdd={handleAddChannel}
        />
      </CardContent>
    </Card>
  );
};

export default ChannelManager;
