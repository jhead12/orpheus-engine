import React, { useState, useCallback } from 'react';
import { useMixer } from '@orpheus/contexts/MixerContext';
import { Track, Effect } from '@orpheus/types/core';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Slider,
  IconButton,
  Button,
  Chip,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  VolumeUp as VolumeIcon,
  VolumeOff as MuteIcon,
  HeadsetMic as SoloIcon,
  RecordVoiceOver as RecordIcon,
  Settings as SettingsIcon,
  AudioFile as AudioIcon,
  MusicNote as MidiIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandIcon,
  ExpandLess as CollapseIcon,
} from '@mui/icons-material';

interface EnhancedTrackControlsProps {
  track: Track;
  expanded?: boolean;
  onExpandChange?: (expanded: boolean) => void;
}

interface EffectDialogProps {
  open: boolean;
  onClose: () => void;
  onAddEffect: (effectType: string) => void;
  effects: Effect[];
  onRemoveEffect: (effectId: string) => void;
}

const EffectDialog: React.FC<EffectDialogProps> = ({
  open,
  onClose,
  onAddEffect,
  effects,
  onRemoveEffect,
}) => {
  const [selectedEffect, setSelectedEffect] = useState('');

  const availableEffects = [
    'Reverb',
    'Delay',
    'Chorus',
    'Distortion',
    'Compressor',
    'EQ',
    'Filter',
    'Phaser',
    'Flanger',
    'Limiter',
  ];

  const handleAddEffect = () => {
    if (selectedEffect) {
      onAddEffect(selectedEffect);
      setSelectedEffect('');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Manage Effects</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <FormControl fullWidth>
            <InputLabel>Add Effect</InputLabel>
            <Select
              value={selectedEffect}
              onChange={(e) => setSelectedEffect(e.target.value)}
              label="Add Effect"
            >
              {availableEffects.map((effect) => (
                <MenuItem key={effect} value={effect}>
                  {effect}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            variant="contained"
            onClick={handleAddEffect}
            disabled={!selectedEffect}
            startIcon={<AddIcon />}
          >
            Add Effect
          </Button>

          <Typography variant="h6">Current Effects</Typography>
          <List>
            {effects.map((effect) => (
              <ListItem key={effect.id}>
                <ListItemText
                  primary={effect.name}
                  secondary={`Type: ${effect.type} | Enabled: ${effect.enabled ? 'Yes' : 'No'}`}
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    color="error"
                    onClick={() => onRemoveEffect(effect.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
            {effects.length === 0 && (
              <ListItem>
                <ListItemText primary="No effects added" />
              </ListItem>
            )}
          </List>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

const EnhancedTrackControls: React.FC<EnhancedTrackControlsProps> = ({
  track,
  expanded = false,
  onExpandChange,
}) => {
  const {
    setTrackVolume,
    setTrackPan,
    setTrackMute,
    setTrackSolo,
    setTrackArmed,
    addEffect,
    removeEffect,
  } = useMixer();

  const [effectDialogOpen, setEffectDialogOpen] = useState(false);

  const handleVolumeChange = useCallback(
    (_: Event, value: number | number[]) => {
      setTrackVolume(track.id, Array.isArray(value) ? value[0] : value);
    },
    [track.id, setTrackVolume]
  );

  const handlePanChange = useCallback(
    (_: Event, value: number | number[]) => {
      setTrackPan(track.id, Array.isArray(value) ? value[0] : value);
    },
    [track.id, setTrackPan]
  );

  const handleMuteToggle = useCallback(() => {
    setTrackMute(track.id, !track.mute);
  }, [track.id, track.mute, setTrackMute]);

  const handleSoloToggle = useCallback(() => {
    setTrackSolo(track.id, !track.solo);
  }, [track.id, track.solo, setTrackSolo]);

  const handleArmToggle = useCallback(() => {
    setTrackArmed(track.id, !track.armed);
  }, [track.id, track.armed, setTrackArmed]);

  const handleAddEffect = useCallback(
    (effectType: string) => {
      addEffect(track.id, effectType);
    },
    [track.id, addEffect]
  );

  const handleRemoveEffect = useCallback(
    (effectId: string) => {
      removeEffect(track.id, effectId);
    },
    [track.id, removeEffect]
  );

  const formatPan = (value: number): string => {
    if (value === 0) return 'C';
    const side = value > 0 ? 'R' : 'L';
    const amount = Math.abs(value * 100).toFixed(0);
    return `${side}${amount}`;
  };

  return (
    <Card sx={{ mb: 1 }}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        {/* Header Row */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 1,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {track.type === 'audio' ? <AudioIcon /> : <MidiIcon />}
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
              {track.name}
            </Typography>
          </Box>

          <IconButton size="small" onClick={() => onExpandChange?.(!expanded)}>
            {expanded ? <CollapseIcon /> : <ExpandIcon />}
          </IconButton>
        </Box>

        {/* Status Chips */}
        <Box sx={{ display: 'flex', gap: 0.5, mb: 2, flexWrap: 'wrap' }}>
          <Chip
            size="small"
            label={track.type === 'audio' ? 'Audio' : 'MIDI'}
            color={track.type === 'audio' ? 'primary' : 'secondary'}
          />
          {track.armed && (
            <Chip
              size="small"
              icon={<RecordIcon />}
              label="REC"
              color="error"
            />
          )}
          {track.mute && <Chip size="small" icon={<MuteIcon />} label="MUTE" />}
          {track.solo && (
            <Chip
              size="small"
              icon={<SoloIcon />}
              label="SOLO"
              color="warning"
            />
          )}
          {track.effects && track.effects.length > 0 && (
            <Chip size="small" label={`${track.effects.length} FX`} />
          )}
        </Box>

        {/* Main Controls */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Transport Controls */}
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Tooltip title={track.mute ? 'Unmute' : 'Mute'}>
              <IconButton
                size="small"
                color={track.mute ? 'error' : 'default'}
                onClick={handleMuteToggle}
              >
                <MuteIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title={track.solo ? 'Unsolo' : 'Solo'}>
              <IconButton
                size="small"
                color={track.solo ? 'warning' : 'default'}
                onClick={handleSoloToggle}
              >
                <SoloIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title={track.armed ? 'Disarm' : 'Arm for Recording'}>
              <IconButton
                size="small"
                color={track.armed ? 'error' : 'default'}
                onClick={handleArmToggle}
              >
                <RecordIcon />
              </IconButton>
            </Tooltip>
          </Box>

          {/* Volume Control */}
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
            <VolumeIcon fontSize="small" />
            <Slider
              size="small"
              value={track.volume.value}
              min={0}
              max={2}
              step={0.01}
              onChange={handleVolumeChange}
              sx={{ flex: 1 }}
            />
            <Typography
              variant="caption"
              sx={{ minWidth: '40px', textAlign: 'right' }}
            >
              {(track.volume.value * 100).toFixed(0)}%
            </Typography>
          </Box>

          {/* Pan Control */}
          <Box
            sx={{ width: 80, display: 'flex', alignItems: 'center', gap: 1 }}
          >
            <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
              Pan
            </Typography>
            <Slider
              size="small"
              value={track.pan.value}
              min={-1}
              max={1}
              step={0.01}
              onChange={handlePanChange}
            />
            <Typography
              variant="caption"
              sx={{ minWidth: '25px', textAlign: 'right', fontSize: '0.7rem' }}
            >
              {formatPan(track.pan.value)}
            </Typography>
          </Box>

          {/* Effects Button */}
          <Tooltip title="Manage Effects">
            <IconButton size="small" onClick={() => setEffectDialogOpen(true)}>
              <SettingsIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Expanded Details */}
        {expanded && (
          <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Channel Details
            </Typography>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 2,
                fontSize: '0.875rem',
              }}
            >
              <Box>
                <Typography variant="caption" display="block">
                  <strong>Audio Routing:</strong>
                </Typography>
                <Typography variant="caption" display="block">
                  Inputs: {track.inputs?.filter((i) => i.active).length || 0}{' '}
                  active
                </Typography>
                <Typography variant="caption" display="block">
                  Outputs: {track.outputs?.filter((o) => o.active).length || 0}{' '}
                  active
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" display="block">
                  <strong>Content:</strong>
                </Typography>
                <Typography variant="caption" display="block">
                  Clips: {track.clips?.length || 0}
                </Typography>
                <Typography variant="caption" display="block">
                  Effects: {track.effects?.length || 0}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ mt: 1 }}>
              <Typography variant="caption" display="block">
                <strong>Automation:</strong>{' '}
                {track.automation ? 'Enabled' : 'Disabled'}
                {track.automation && ` (Mode: ${track.automationMode})`}
              </Typography>
            </Box>
          </Box>
        )}

        <EffectDialog
          open={effectDialogOpen}
          onClose={() => setEffectDialogOpen(false)}
          onAddEffect={handleAddEffect}
          effects={track.effects || []}
          onRemoveEffect={handleRemoveEffect}
        />
      </CardContent>
    </Card>
  );
};

export default EnhancedTrackControls;
