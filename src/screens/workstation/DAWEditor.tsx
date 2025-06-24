import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import Track, { AudioTrack } from '../../components/daw/Track';
import { TimelineSettings } from '../../types/timeline';

// DAW Editor interfaces
interface DAWEditorProps {
  tracks?: AudioTrack[];
  onAddTrack?: () => void;
  onImportAudio?: () => void;
}

// Styled components
const DAWContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background-color: #121920;
  color: #fff;
  overflow: hidden;
  position: relative;
`;

const TransportControls = styled.div`
  display: flex;
  align-items: center;
  padding: 10px;
  background-color: #1a2430;
  border-bottom: 1px solid #192430;
  gap: 10px;
  height: 50px;
  flex-shrink: 0;
`;

const TransportButton = styled.button`
  padding: 5px 12px;
  background-color: #273748;
  border: none;
  border-radius: 3px;
  color: white;
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 32px;

  &:hover {
    background-color: #334a5f;
  }

  &.active {
    background-color: #3080c0;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const TrackListContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  overflow-x: auto;
  position: relative;
`;

const TimelineHeader = styled.div`
  height: 30px;
  background-color: #1a2430;
  border-bottom: 1px solid #192430;
  position: sticky;
  top: 0;
  left: 0;
  width: 100%;
  display: flex;
  align-items: center;
  padding-left: 200px; /* Align with track headers */
  z-index: 2;
`;

const TimelineTick = styled.div<{ left: number }>`
  position: absolute;
  left: ${(props) => props.left}px;
  height: 10px;
  border-left: 1px solid #334a5f;
  top: 10px;
`;

const TimelineLabel = styled.div<{ left: number }>`
  position: absolute;
  left: ${(props) => props.left}px;
  font-size: 10px;
  top: 22px;
  transform: translateX(-50%);
  color: #aab5c0;
`;

const ActionBar = styled.div`
  display: flex;
  padding: 10px;
  gap: 10px;
  background-color: #1a2430;
  border-bottom: 1px solid #192430;
`;

const Playhead = styled.div<{ left: number }>`
  position: absolute;
  left: ${(props) => props.left}px;
  top: 0;
  bottom: 0;
  width: 1px;
  background-color: #e74c3c;
  z-index: 2;
  pointer-events: none;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: -5px;
    width: 0;
    height: 0;
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-top: 7px solid #e74c3c;
  }
`;

const AnalysisPanel = styled.div`
  height: 150px;
  background-color: #1a2430;
  border-top: 1px solid #192430;
  padding: 10px;
  display: flex;
  flex-direction: column;
`;

const AnalysisHeader = styled.div`
  font-size: 12px;
  font-weight: 500;
  margin-bottom: 10px;
`;

const AnalysisContent = styled.div`
  flex: 1;
  background-color: #0e151d;
  border-radius: 3px;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #aab5c0;
  font-size: 12px;
`;

// Sample data for demonstration
const createMockTracks = (): AudioTrack[] => [
  {
    id: 'track-1',
    name: 'Vocal Track',
    color: '#3080c0',
    muted: false,
    soloed: false,
    volume: 0.8,
    height: 100,
    clips: [
      {
        id: 'clip-1',
        audioId: 'audio-1',
        startTime: 1,
        endTime: 6,
        offset: 0,
        duration: 5,
      },
      {
        id: 'clip-2',
        audioId: 'audio-2',
        startTime: 8,
        endTime: 12,
        offset: 0,
        duration: 4,
      },
    ],
  },
  {
    id: 'track-2',
    name: 'Guitar Track',
    color: '#30c080',
    muted: true,
    soloed: false,
    volume: 0.7,
    height: 100,
    clips: [
      {
        id: 'clip-3',
        audioId: 'audio-3',
        startTime: 0.5,
        endTime: 7.5,
        offset: 0,
        duration: 7,
      },
    ],
  },
  {
    id: 'track-3',
    name: 'Drums',
    color: '#c03080',
    muted: false,
    soloed: true,
    volume: 0.75,
    height: 100,
    clips: [
      {
        id: 'clip-4',
        audioId: 'audio-4',
        startTime: 0,
        endTime: 16,
        offset: 0,
        duration: 16,
      },
    ],
  },
];

const DAWEditor: React.FC<DAWEditorProps> = ({
  tracks: propTracks,
  onAddTrack,
  onImportAudio,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  const [tracks, setTracks] = useState<AudioTrack[]>(
    propTracks || createMockTracks()
  );
  const [timelineSettings] = useState<TimelineSettings>({
    beatWidth: 60,
    timeSignature: { beats: 4, noteValue: 4 },
    horizontalScale: 100,
  });

  // Animation frame reference for playback
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const playheadTimeRef = useRef<number>(currentTime);

  const handlePlayPause = () => {
    setIsPlaying((prev) => !prev);
  };

  const handleStop = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleAddTrack = () => {
    if (onAddTrack) {
      onAddTrack();
    } else {
      // Default implementation for demo
      const newTrack: AudioTrack = {
        id: `track-${tracks.length + 1}-${Date.now()}`,
        name: `Track ${tracks.length + 1}`,
        color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
        muted: false,
        soloed: false,
        volume: 0.8,
        clips: [],
        height: 100,
      };

      setTracks([...tracks, newTrack]);
    }
  };

  const handleImportAudio = () => {
    if (onImportAudio) {
      onImportAudio();
    } else {
      // Default implementation would open a file picker
      console.log('Import audio clicked');
    }
  };

  const handleSelectTrack = (trackId: string) => {
    setSelectedTrackId(trackId);
  };

  const handleMuteTrack = (trackId: string, muted: boolean) => {
    setTracks(
      tracks.map((track) =>
        track.id === trackId ? { ...track, muted } : track
      )
    );
  };

  const handleSoloTrack = (trackId: string, soloed: boolean) => {
    setTracks(
      tracks.map((track) =>
        track.id === trackId ? { ...track, soloed } : track
      )
    );
  };

  const handleClipClick = (trackId: string, clipId: string) => {
    console.log(`Clicked clip ${clipId} on track ${trackId}`);
    // Implement clip selection logic here
  };

  // Animation loop for playhead movement
  useEffect(() => {
    if (isPlaying) {
      startTimeRef.current = performance.now() - playheadTimeRef.current * 1000;

      const animate = (time: number) => {
        const elapsed = time - startTimeRef.current;
        playheadTimeRef.current = elapsed / 1000;
        setCurrentTime(playheadTimeRef.current);
        animationRef.current = requestAnimationFrame(animate);
      };

      animationRef.current = requestAnimationFrame(animate);
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying]);

  // Calculate timeline ticks and labels
  const renderTimelineTicks = () => {
    const ticks = [];
    const maxTime = 60; // Show 60 seconds
    const interval = 1; // 1 second intervals

    for (let i = 0; i <= maxTime; i += interval) {
      const position = i * timelineSettings.horizontalScale;

      ticks.push(
        <React.Fragment key={`tick-${i}`}>
          <TimelineTick left={position + 200} />{' '}
          {/* Offset by track header width */}
          {i % 5 === 0 && ( // Show labels every 5 seconds
            <TimelineLabel left={position + 200}>{i}s</TimelineLabel>
          )}
        </React.Fragment>
      );
    }

    return ticks;
  };

  return (
    <DAWContainer>
      <TransportControls>
        <TransportButton
          onClick={handlePlayPause}
          className={isPlaying ? 'active' : ''}
        >
          {isPlaying ? '⏸' : '▶️'}
        </TransportButton>
        <TransportButton onClick={handleStop}>⏹</TransportButton>
        <span style={{ marginLeft: 10 }}>{currentTime.toFixed(1)}s</span>
      </TransportControls>

      <ActionBar>
        <TransportButton onClick={handleAddTrack}>Add Track</TransportButton>
        <TransportButton onClick={handleImportAudio}>
          Import Audio
        </TransportButton>
      </ActionBar>

      <TrackListContainer>
        <TimelineHeader>{renderTimelineTicks()}</TimelineHeader>

        {tracks.map((track) => (
          <Track
            key={track.id}
            track={track}
            isSelected={track.id === selectedTrackId}
            timelineScale={timelineSettings.horizontalScale}
            onSelectTrack={handleSelectTrack}
            onMuteTrack={handleMuteTrack}
            onSoloTrack={handleSoloTrack}
            onClipClick={handleClipClick}
          />
        ))}

        <Playhead left={currentTime * timelineSettings.horizontalScale + 200} />
      </TrackListContainer>

      <AnalysisPanel>
        <AnalysisHeader>Audio Analysis</AnalysisHeader>
        <AnalysisContent>
          Select an audio clip to view waveform and analysis data
        </AnalysisContent>
      </AnalysisPanel>
    </DAWContainer>
  );
};

export default DAWEditor;
