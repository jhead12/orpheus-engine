import React from 'react';
import styled from 'styled-components';
import { AudioAnalysisResults } from '../../types/audio';

// Track interfaces
export interface AudioTrack {
  id: string;
  name: string;
  color?: string;
  muted?: boolean;
  soloed?: boolean;
  volume?: number;
  pan?: number;
  clips: TrackClip[];
  height?: number;
}

export interface TrackClip {
  id: string;
  audioId: string;
  startTime: number; // Start time in seconds or beats
  endTime: number; // End time in seconds or beats
  offset: number; // Offset from original audio in seconds
  duration: number;
  waveformData?: number[] | AudioAnalysisResults['waveform'];
}

interface TrackProps {
  track: AudioTrack;
  isSelected?: boolean;
  timelineScale: number; // Pixels per second/beat
  onSelectTrack?: (trackId: string) => void;
  onMuteTrack?: (trackId: string, muted: boolean) => void;
  onSoloTrack?: (trackId: string, soloed: boolean) => void;
  onVolumeChange?: (trackId: string, volume: number) => void;
  onPanChange?: (trackId: string, pan: number) => void;
  onClipClick?: (trackId: string, clipId: string) => void;
  headerWidth?: number;
}

// Styled components
const TrackContainer = styled.div<{ isSelected?: boolean; height?: number }>`
  display: flex;
  width: 100%;
  height: ${(props) => props.height || 100}px;
  background-color: ${(props) => (props.isSelected ? '#334a5f' : '#1f2a33')};
  border-bottom: 1px solid #192430;
  position: relative;
  color: #fff;
  box-sizing: border-box;
`;

const TrackHeader = styled.div<{ width?: number }>`
  display: flex;
  flex-direction: column;
  width: ${(props) => props.width || 200}px;
  background-color: #1a2430;
  border-right: 1px solid #192430;
  padding: 8px;
  box-sizing: border-box;
  position: sticky;
  left: 0;
  z-index: 2;
`;

const TrackContent = styled.div`
  flex: 1;
  position: relative;
  overflow: hidden;
  background-color: #1f2a33;
  background-image:
    linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
    linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px);
  background-size: 60px 60px; /* Grid size - adjust based on timelineScale */
`;

const TrackName = styled.div`
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 8px;
`;

const TrackControls = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
`;

const Button = styled.button<{ active?: boolean }>`
  padding: 4px 8px;
  background-color: ${(props) => (props.active ? '#3080c0' : '#273748')};
  border: none;
  border-radius: 3px;
  color: white;
  font-size: 12px;
  cursor: pointer;

  &:hover {
    background-color: ${(props) => (props.active ? '#3c90d5' : '#334a5f')};
  }
`;

const TrackClipElement = styled.div<{
  left: number;
  width: number;
  color?: string;
}>`
  position: absolute;
  height: 80%;
  top: 10%;
  left: ${(props) => props.left}px;
  width: ${(props) => props.width}px;
  background-color: ${(props) => props.color || '#3080c0'};
  border-radius: 3px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  overflow: hidden;

  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
  }
`;

const ClipWaveform = styled.div`
  height: 100%;
  width: 100%;
  position: relative;
  opacity: 0.7;

  /* Placeholder for waveform visualization */
  background-image: linear-gradient(
    transparent 50%,
    rgba(255, 255, 255, 0.2) 50%,
    rgba(255, 255, 255, 0.2) 51%,
    transparent 51%
  );
  background-size: 100% 4px;
`;

const ClipTitle = styled.div`
  position: absolute;
  top: 4px;
  left: 4px;
  font-size: 10px;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
`;

const Track: React.FC<TrackProps> = ({
  track,
  isSelected = false,
  timelineScale,
  onSelectTrack,
  onMuteTrack,
  onSoloTrack,
  onClipClick,
  headerWidth = 200,
}) => {
  const handleTrackClick = () => {
    if (onSelectTrack) {
      onSelectTrack(track.id);
    }
  };

  const handleMuteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onMuteTrack) {
      onMuteTrack(track.id, !track.muted);
    }
  };

  const handleSoloClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSoloTrack) {
      onSoloTrack(track.id, !track.soloed);
    }
  };

  const handleClipClick = (clipId: string) => (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClipClick) {
      onClipClick(track.id, clipId);
    }
  };

  return (
    <TrackContainer
      isSelected={isSelected}
      height={track.height}
      onClick={handleTrackClick}
    >
      <TrackHeader width={headerWidth}>
        <TrackName title={track.name}>{track.name}</TrackName>
        <TrackControls>
          <Button active={track.muted} onClick={handleMuteClick}>
            M
          </Button>
          <Button active={track.soloed} onClick={handleSoloClick}>
            S
          </Button>
        </TrackControls>
        {/* Volume slider could go here */}
      </TrackHeader>

      <TrackContent>
        {track.clips.map((clip) => (
          <TrackClipElement
            key={clip.id}
            left={clip.startTime * timelineScale}
            width={clip.duration * timelineScale}
            color={track.color}
            onClick={handleClipClick(clip.id)}
          >
            <ClipTitle>{clip.id}</ClipTitle>
            <ClipWaveform />
          </TrackClipElement>
        ))}
      </TrackContent>
    </TrackContainer>
  );
};

export default Track;
