import React, { useState } from 'react';
import { MixerProvider, useMixer } from '@orpheus/contexts/MixerContext';
import ChannelManager from '@orpheus/components/mixer/ChannelManager';
import EnhancedTrackControls from '@orpheus/components/mixer/EnhancedTrackControls';
import AudioLibrary from '@orpheus/components/mixer/AudioLibrary';
import { Track } from '@orpheus/types/core';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  Divider,
  Alert,
  AlertTitle,
} from '@mui/material';

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

const ChannelDemoPage: React.FC = () => {
  const [expandedTracks, setExpandedTracks] = useState<Set<string>>(new Set());

  const handleTrackExpandChange = (trackId: string, expanded: boolean) => {
    setExpandedTracks(prev => {
      const newSet = new Set(prev);
      if (expanded) {
        newSet.add(trackId);
      } else {
        newSet.delete(trackId);
      }
      return newSet;
    });
  };

  const handleAddToTrack = (_file: AudioFile, _trackId: string) => {
    // In a real implementation, this would add the audio file as a clip to the track
    // For demo purposes, we'll acknowledge the action silently
  };

  return (
    <MixerProvider>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Orpheus Engine - Channel System Demo
        </Typography>
        
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
          Complete channel management with mixer lanes, recording, solo/mute controls, 
          plugin capabilities, and audio library integration.
        </Typography>

        <Alert severity="info" sx={{ mb: 4 }}>
          <AlertTitle>Channel Features Demonstrated</AlertTitle>
          This demo showcases the complete channel system including:
          mixer lanes, recording controls, solo/mute buttons, plugin effects chain,
          audio routing, and audio library integration.
        </Alert>

        <Grid container spacing={3}>
          {/* Channel Manager */}
          <Grid item xs={12} lg={6}>
            <ChannelManager />
          </Grid>

          {/* Audio Library */}
          <Grid item xs={12} lg={6}>
            <AudioLibrary onAddToTrack={handleAddToTrack} />
          </Grid>

          {/* Mixer Tracks Display */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
                  Mixer - Channel Controls
                </Typography>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Each channel includes full mixer functionality with volume, pan, 
                  mute, solo, record arm, and effects controls.
                </Typography>

                <MixerTracksDisplay 
                  expandedTracks={expandedTracks}
                  onTrackExpandChange={handleTrackExpandChange}
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Feature Overview */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Channel System Features
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    🎛️ Mixer Lane Features:
                  </Typography>
                  <ul>
                    <li>Volume control with automation support</li>
                    <li>Pan control with left/right/center positioning</li>
                    <li>VU meters for level monitoring</li>
                    <li>Color-coded track identification</li>
                  </ul>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    🎵 Recording & Playback:
                  </Typography>
                  <ul>
                    <li>Record arm button for enabling recording</li>
                    <li>Input routing configuration</li>
                    <li>Audio and MIDI track support</li>
                    <li>Real-time monitoring capabilities</li>
                  </ul>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    🔇 Solo/Mute System:
                  </Typography>
                  <ul>
                    <li>Individual track mute controls</li>
                    <li>Solo isolation for focused listening</li>
                    <li>Global mute/unmute all tracks</li>
                    <li>Solo-in-place functionality</li>
                  </ul>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    ⚡ Plugin Capabilities:
                  </Typography>
                  <ul>
                    <li>Insert effects chain per track</li>
                    <li>Drag & drop effect reordering</li>
                    <li>Real-time parameter automation</li>
                    <li>Preset management system</li>
                  </ul>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    📚 Audio Library Integration:
                  </Typography>
                  <ul>
                    <li>Searchable audio file library</li>
                    <li>Drag & drop to tracks</li>
                    <li>Preview playback functionality</li>
                    <li>File format support (WAV, MP3, MIDI)</li>
                    <li>Waveform visualization</li>
                    <li>Tag-based organization</li>
                  </ul>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </MixerProvider>
  );
};

// Helper component to display tracks from the mixer context
const MixerTracksDisplay: React.FC<{
  expandedTracks: Set<string>;
  onTrackExpandChange: (trackId: string, expanded: boolean) => void;
}> = ({ expandedTracks, onTrackExpandChange }) => {
  const { tracks } = useMixer();
  
  if (tracks.length === 0) {
    return (
      <Box>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
          Tracks will appear here when you add them using the Channel Manager above.
          Each track will show its full mixer controls, effects chain, and routing options.
        </Typography>
        
        <Divider sx={{ my: 2 }} />
        
        <Typography variant="caption" display="block" sx={{ textAlign: 'center' }}>
          💡 Tip: Add a channel using the &quot;Add Channel&quot; button in the Channel Manager
          to see the complete mixer interface in action.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {tracks.map((track: Track) => (
        <EnhancedTrackControls
          key={track.id}
          track={track}
          expanded={expandedTracks.has(track.id)}
          onExpandChange={(expanded: boolean) => onTrackExpandChange(track.id, expanded)}
        />
      ))}
    </Box>
  );
};

export default ChannelDemoPage;
