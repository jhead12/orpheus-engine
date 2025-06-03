import React from 'react';
import { useAudioLibrary } from '../../hooks/useAudioLibrary';
import { Box, Typography, List, ListItem, ListItemText, ListItemIcon, CircularProgress } from '@mui/material';
import { AudioFile as AudioFileIcon } from '@mui/icons-material';
import '../../styles/AudioLibrary.css';

// Define interfaces for the audio file and library data
interface AudioFile {
  id: string;
  filename: string;
  type: string;
  description?: string;
  usage?: string;
  path: string;
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
  const { loading, error, library, files } = useAudioLibrary();

  if (loading) return <Box display="flex" justifyContent="center"><CircularProgress /></Box>;
  if (error) return <Box p={2}><Typography color="error">Error loading audio library: {error.message}</Typography></Box>;
  if (!library) return <Box p={2}><Typography>No audio library found</Typography></Box>;

  return (
    <Box p={2}>
      <Typography variant="h5" gutterBottom>Audio Library</Typography>
      <Typography variant="subtitle1">{library.description}</Typography>
      
      <Box mt={2}>
        <Typography variant="h6">Audio Files</Typography>
        {files.length === 0 ? (
          <Typography variant="body2">No audio files available</Typography>
        ) : (
          <List>
            {files.map((file: AudioFile, index: number) => (
              <ListItem key={file.id || index.toString()} divider>
                <ListItemIcon>
                  <AudioFileIcon />
                </ListItemIcon>
                <ListItemText 
                  primary={file.filename} 
                  secondary={
                    <>
                      <Typography component="span" variant="body2" color="textPrimary">
                        {file.type.toUpperCase()}
                      </Typography>
                      {' — '}{file.description || 'No description'}
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
