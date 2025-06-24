import React, { useState, useCallback, useRef } from 'react';
import { useMixer } from '@orpheus/contexts/MixerContext';
import { TrackType } from '@orpheus/types/core';
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemButton,
  Button,
  TextField,
  InputAdornment,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Divider,
} from '@mui/material';
import {
  AudioFile as AudioIcon,
  MusicNote as MidiIcon,
  Search as SearchIcon,
  Upload as UploadIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  AddCircle as AddToTrackIcon,
  GraphicEq as WaveformIcon,
} from '@mui/icons-material';

interface AudioFile {
  id: string;
  name: string;
  type: 'audio' | 'midi';
  duration: number;
  size: number;
  format: string;
  tags: string[];
  preview?: string;
  waveform?: number[];
}

interface AudioLibraryProps {
  onAddToTrack?: (file: AudioFile, trackId: string) => void;
}

// Mock audio library data
const mockAudioFiles: AudioFile[] = [
  {
    id: '1',
    name: 'Kick Drum.wav',
    type: 'audio',
    duration: 1.2,
    size: 2048000,
    format: 'WAV',
    tags: ['drums', 'kick', 'percussion'],
    waveform: Array.from({ length: 100 }, (_, i) => Math.sin(i * 0.1) * Math.random()),
  },
  {
    id: '2',
    name: 'Snare Hit.wav',
    type: 'audio',
    duration: 0.8,
    size: 1536000,
    format: 'WAV',
    tags: ['drums', 'snare', 'percussion'],
    waveform: Array.from({ length: 100 }, (_, i) => Math.cos(i * 0.15) * Math.random()),
  },
  {
    id: '3',
    name: 'Bass Line.mid',
    type: 'midi',
    duration: 32.0,
    size: 8192,
    format: 'MIDI',
    tags: ['bass', 'melody', 'loop'],
  },
  {
    id: '4',
    name: 'Piano Chord.wav',
    type: 'audio',
    duration: 4.5,
    size: 4096000,
    format: 'WAV',
    tags: ['piano', 'chord', 'harmony'],
    waveform: Array.from({ length: 100 }, (_, i) => Math.sin(i * 0.05) * Math.random() * 0.7),
  },
  {
    id: '5',
    name: 'Vocal Sample.wav',
    type: 'audio',
    duration: 8.2,
    size: 8192000,
    format: 'WAV',
    tags: ['vocal', 'voice', 'lead'],
    waveform: Array.from({ length: 100 }, (_, i) => Math.sin(i * 0.08) * Math.random() * 0.9),
  },
];

const AudioLibrary: React.FC<AudioLibraryProps> = ({ onAddToTrack }) => {
  const { tracks, addTrack } = useMixer();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedFile, setSelectedFile] = useState<AudioFile | null>(null);
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const [trackSelectionDialog, setTrackSelectionDialog] = useState<AudioFile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredFiles = mockAudioFiles.filter((file) => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (selectedTab === 0) return matchesSearch; // All
    if (selectedTab === 1) return matchesSearch && file.type === 'audio'; // Audio
    if (selectedTab === 2) return matchesSearch && file.type === 'midi'; // MIDI
    
    return matchesSearch;
  });

  const handleFileUpload = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      // In a real app, you would process the uploaded files here
      // For now, we'll just reset the input
      event.target.value = '';
    }
  }, []);

  const handlePlayPreview = useCallback((fileId: string) => {
    if (isPlaying === fileId) {
      setIsPlaying(null);
      // Stop audio playback
    } else {
      setIsPlaying(fileId);
      // Start audio playback
      // In a real app, you would use Web Audio API or HTML5 audio
    }
  }, [isPlaying]);

  const handleAddToTrack = useCallback((file: AudioFile, trackId: string) => {
    if (onAddToTrack) {
      onAddToTrack(file, trackId);
    }
    setTrackSelectionDialog(null);
  }, [onAddToTrack]);

  const handleCreateNewTrack = useCallback((file: AudioFile) => {
    const trackType = file.type === 'audio' ? TrackType.Audio : TrackType.Midi;
    const trackId = addTrack(trackType, `${file.type.toUpperCase()} - ${file.name}`);
    if (onAddToTrack) {
      onAddToTrack(file, trackId);
    }
    setTrackSelectionDialog(null);
  }, [addTrack, onAddToTrack]);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = (seconds % 60).toFixed(1);
    return `${mins}:${secs.padStart(4, '0')}`;
  };

  const formatFileSize = (bytes: number): string => {
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(1)} MB`;
  };

  const renderWaveform = (waveform?: number[]) => {
    if (!waveform) return null;
    
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', height: 20, gap: 0.5 }}>
        {waveform.slice(0, 50).map((value, index) => (
          <Box
            key={index}
            sx={{
              width: 2,
              height: Math.abs(value) * 15 + 2,
              backgroundColor: 'primary.main',
              opacity: 0.7,
            }}
          />
        ))}
      </Box>
    );
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" component="h2">
            Audio Library
          </Typography>
          <Button
            variant="contained"
            startIcon={<UploadIcon />}
            onClick={handleFileUpload}
            size="small"
          >
            Upload
          </Button>
        </Box>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="audio/*,.mid,.midi"
          style={{ display: 'none' }}
          onChange={handleFileSelect}
        />

        {/* Search */}
        <TextField
          fullWidth
          size="small"
          placeholder="Search audio files..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />

        {/* Filter Tabs */}
        <Tabs value={selectedTab} onChange={(_, newValue) => setSelectedTab(newValue)} sx={{ mb: 2 }}>
          <Tab label={`All (${mockAudioFiles.length})`} />
          <Tab label={`Audio (${mockAudioFiles.filter(f => f.type === 'audio').length})`} />
          <Tab label={`MIDI (${mockAudioFiles.filter(f => f.type === 'midi').length})`} />
        </Tabs>

        {/* File List */}
        <List sx={{ maxHeight: 400, overflow: 'auto' }}>
          {filteredFiles.map((file) => (
            <React.Fragment key={file.id}>
              <ListItem
                sx={{
                  backgroundColor: selectedFile?.id === file.id ? 'action.selected' : 'transparent',
                  borderRadius: 1,
                  mb: 0.5,
                }}
              >
                <ListItemButton
                  onClick={() => setSelectedFile(selectedFile?.id === file.id ? null : file)}
                  sx={{ borderRadius: 1 }}
                >
                  <ListItemIcon>
                    {file.type === 'audio' ? <AudioIcon /> : <MidiIcon />}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle2">{file.name}</Typography>
                        <Chip
                          size="small"
                          label={file.format}
                          color={file.type === 'audio' ? 'primary' : 'secondary'}
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="caption" display="block">
                          {formatDuration(file.duration)} • {formatFileSize(file.size)}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, flexWrap: 'wrap' }}>
                          {file.tags.map((tag) => (
                            <Chip key={tag} size="small" label={tag} variant="outlined" />
                          ))}
                        </Box>
                      </Box>
                    }
                  />
                </ListItemButton>
                
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <Tooltip title={isPlaying === file.id ? 'Stop Preview' : 'Play Preview'}>
                    <IconButton
                      size="small"
                      onClick={() => handlePlayPreview(file.id)}
                      color={isPlaying === file.id ? 'secondary' : 'default'}
                    >
                      {isPlaying === file.id ? <StopIcon /> : <PlayIcon />}
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title="Add to Track">
                    <IconButton
                      size="small"
                      onClick={() => setTrackSelectionDialog(file)}
                    >
                      <AddToTrackIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </ListItem>

              {/* Expanded Details */}
              {selectedFile?.id === file.id && (
                <Box sx={{ px: 2, pb: 2 }}>
                  <Divider sx={{ mb: 1 }} />
                  <Typography variant="caption" display="block" sx={{ mb: 1 }}>
                    Waveform Preview:
                  </Typography>
                  {file.waveform ? (
                    renderWaveform(file.waveform)
                  ) : (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                      <WaveformIcon fontSize="small" />
                      <Typography variant="caption">MIDI file - no waveform</Typography>
                    </Box>
                  )}
                </Box>
              )}
            </React.Fragment>
          ))}

          {filteredFiles.length === 0 && (
            <ListItem>
              <ListItemText
                primary="No files found"
                secondary="Try adjusting your search or upload some audio files"
              />
            </ListItem>
          )}
        </List>

        {/* Track Selection Dialog */}
        <Dialog
          open={trackSelectionDialog !== null}
          onClose={() => setTrackSelectionDialog(null)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Add to Track</DialogTitle>
          <DialogContent>
            {trackSelectionDialog && (
              <Box>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Add &quot;{trackSelectionDialog.name}&quot; to a track:
                </Typography>
                
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<AddToTrackIcon />}
                  onClick={() => handleCreateNewTrack(trackSelectionDialog)}
                  sx={{ mb: 2 }}
                >
                  Create New Track
                </Button>

                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Existing Tracks:
                </Typography>
                
                <List>
                  {tracks.map((track) => (
                    <ListItem key={track.id} disablePadding>
                      <ListItemButton
                        onClick={() => handleAddToTrack(trackSelectionDialog, track.id)}
                      >
                        <ListItemIcon>
                          {track.type === TrackType.Audio ? <AudioIcon /> : <MidiIcon />}
                        </ListItemIcon>
                        <ListItemText
                          primary={track.name}
                          secondary={`${track.type} • ${track.clips?.length || 0} clips`}
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                  {tracks.length === 0 && (
                    <ListItem>
                      <ListItemText primary="No existing tracks" />
                    </ListItem>
                  )}
                </List>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setTrackSelectionDialog(null)}>Cancel</Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default AudioLibrary;
