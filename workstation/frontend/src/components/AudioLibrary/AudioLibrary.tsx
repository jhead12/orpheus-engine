import React from 'react';
import { useAudioLibrary } from '../../hooks/useAudioLibrary';
import { Box, Typography, List, ListItem, ListItemText, ListItemIcon, CircularProgress } from '@mui/material';
import { AudioFile as AudioFileIcon } from '@mui/icons-material';
import '../../styles/AudioLibrary.css';

// Import the AudioFile type from the hook to ensure consistency
interface AudioFile {
  id: string;
  filename: string;
  path: string;
  metadata?: any;
  aiAnalysis?: {
    genre: string;
    mood: string;
    key: string;
    bpm: number;
    tags: string[];
  };
}

interface AudioLibraryData {
  description: string;
  files: AudioFile[];
  location: string;
  supported_formats: string[];
  logs_directory: string;
  updated: string;
}

export function AudioLibrary() {
  const { loading, error, audioFiles } = useAudioLibrary();

  if (loading) return <Box display="flex" justifyContent="center"><CircularProgress /></Box>;
  if (error) return <Box p={2}><Typography color="error">Error loading audio library: {error}</Typography></Box>;

  return (
    <Box p={2}>
      <Typography variant="h5" gutterBottom>Audio Library</Typography>
      <Typography variant="subtitle1">Your audio collection</Typography>
      
      <Box mt={2}>
        <Typography variant="h6">Audio Files</Typography>
        {audioFiles.length === 0 ? (
          <Typography variant="body2">No audio files available</Typography>
        ) : (
          <List>
            {audioFiles.map((file: AudioFile, index: number) => (
              <ListItem key={file.id || index.toString()} divider>
                <ListItemIcon>
                  <AudioFileIcon />
                </ListItemIcon>
                <ListItemText 
                  primary={file.filename} 
                  secondary={
                    <>
                      <Typography component="span" variant="body2" color="textPrimary">
                        {file.aiAnalysis?.genre?.toUpperCase() || 'AUDIO'}
                      </Typography>
                      {' — '}{file.aiAnalysis?.mood || 'No analysis available'}
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </Box>
    </Box>
  );
}
