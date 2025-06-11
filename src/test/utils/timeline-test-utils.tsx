import { vi } from 'vitest';
import type { Track } from '../../types/core';

/**
 * Timeline-specific test utilities
 * Provides mocks and utilities for testing timeline and sequencing functionality
 */

// Timeline position and time utilities
export const createMockTimelinePosition = (beats = 0, bars = 0, ticks = 0) => ({
  beats,
  bars,
  ticks,
  samples: Math.floor((bars * 4 + beats) * 44100 * 60 / 120), // Assuming 120 BPM
  milliseconds: (bars * 4 + beats) * 500, // 500ms per beat at 120 BPM
});

export const createMockTimeSignature = (beats = 4, noteValue = 4) => ({
  beats,
  noteValue,
});

export const createMockTempoMap = () => ([
  { position: createMockTimelinePosition(0), tempo: 120 },
  { position: createMockTimelinePosition(16), tempo: 140 },
  { position: createMockTimelinePosition(32), tempo: 120 },
]);

// Clip and region mocks
export const createMockClip = (overrides = {}) => ({
  id: 'clip-1',
  name: 'Test Clip',
  type: 'audio' as const,
  start: createMockTimelinePosition(0),
  end: createMockTimelinePosition(4),
  loopStart: createMockTimelinePosition(0),
  loopEnd: createMockTimelinePosition(4),
  muted: false,
  color: '#4ecdc4',
  audio: {
    audioBuffer: null,
    buffer: null,
    waveform: new Array(100).fill(0).map(() => Math.random() * 0.8),
    start: createMockTimelinePosition(0),
    end: createMockTimelinePosition(4),
  },
  ...overrides,
});

export const createMockRegion = (startBeats = 0, endBeats = 8) => ({
  start: createMockTimelinePosition(startBeats),
  end: createMockTimelinePosition(endBeats),
  id: 'region-1',
  name: 'Test Region',
});

// Timeline settings mock
export const createMockTimelineSettings = (overrides = {}) => ({
  tempo: 120,
  timeSignature: createMockTimeSignature(4, 4),
  snap: true,
  snapUnit: 'beat' as const,
  horizontalScale: 1.0,
  beatWidth: 50,
  showGrid: true,
  showMarkers: true,
  loopEnabled: false,
  loopStart: createMockTimelinePosition(0),
  loopEnd: createMockTimelinePosition(16),
  ...overrides,
});

// Transport state mock
export const createMockTransportState = (overrides = {}) => ({
  isPlaying: false,
  isRecording: false,
  position: createMockTimelinePosition(0),
  tempo: 120,
  timeSignature: createMockTimeSignature(4, 4),
  loopEnabled: false,
  loopStart: createMockTimelinePosition(0),
  loopEnd: createMockTimelinePosition(16),
  metronomeEnabled: false,
  preCountEnabled: false,
  ...overrides,
});

// Timeline context mock
export const createMockTimelineContext = (overrides = {}) => {
  const defaultTracks: Track[] = [
    {
      id: 'track-1',
      name: 'Audio Track',
      type: 'Audio' as any,
      color: '#ff6b6b',
      clips: [createMockClip({ id: 'clip-1', trackId: 'track-1' })],
      mute: false,
      solo: false,
      armed: false,
      volume: { value: 0.8, isAutomated: false } as any,
      pan: { value: 0, isAutomated: false } as any,
      effects: [],
      automationLanes: [],
      automationMode: 'Read' as any,
    },
  ];

  return {
    tracks: defaultTracks,
    selectedClips: [],
    selectedRegion: null,
    timelineSettings: createMockTimelineSettings(),
    transportState: createMockTransportState(),
    zoom: 1.0,
    scrollPosition: 0,
    playhead: createMockTimelinePosition(0),
    
    // Actions
    setTracks: vi.fn(),
    addTrack: vi.fn(),
    removeTrack: vi.fn(),
    updateTrack: vi.fn(),
    addClip: vi.fn(),
    removeClip: vi.fn(),
    updateClip: vi.fn(),
    setSelectedClips: vi.fn(),
    setSelectedRegion: vi.fn(),
    setTimelineSettings: vi.fn(),
    setTransportState: vi.fn(),
    setZoom: vi.fn(),
    setScrollPosition: vi.fn(),
    setPlayhead: vi.fn(),
    
    // Transport controls
    play: vi.fn(),
    pause: vi.fn(),
    stop: vi.fn(),
    record: vi.fn(),
    seek: vi.fn(),
    
    ...overrides,
  };
};

// Timeline UI component mocks
export const createMockTimelineComponents = () => ({
  TimelineRuler: ({ zoom, scrollPosition }: any) => 
    <div data-testid="timeline-ruler" data-zoom={zoom} data-scroll={scrollPosition}>
      Ruler
    </div>,
  
  PlayheadIndicator: ({ position }: any) => 
    <div data-testid="playhead" data-position={position.beats}>
      Playhead
    </div>,
  
  ClipComponent: ({ clip, onSelect }: any) => 
    <div 
      data-testid={`clip-${clip.id}`} 
      onClick={() => onSelect?.(clip)}
      style={{ backgroundColor: clip.color }}
    >
      {clip.name}
    </div>,
  
  TrackHeader: ({ track, onMute, onSolo, onArm }: any) => 
    <div data-testid={`track-header-${track.id}`}>
      <span>{track.name}</span>
      <button data-testid={`mute-${track.id}`} onClick={() => onMute?.(track.id)}>
        M
      </button>
      <button data-testid={`solo-${track.id}`} onClick={() => onSolo?.(track.id)}>
        S
      </button>
      <button data-testid={`arm-${track.id}`} onClick={() => onArm?.(track.id)}>
        R
      </button>
    </div>,
  
  WaveformDisplay: ({ waveform, color }: any) => 
    <div data-testid="waveform" style={{ backgroundColor: color }}>
      Waveform ({waveform?.length || 0} points)
    </div>,
});

// Timeline interaction utilities
export const simulateTimelineClick = (element: HTMLElement, position: { x: number; y: number }) => {
  const event = new MouseEvent('click', {
    clientX: position.x,
    clientY: position.y,
    bubbles: true,
  });
  element.dispatchEvent(event);
};

export const simulateTimelineDrag = async (
  element: HTMLElement, 
  start: { x: number; y: number }, 
  end: { x: number; y: number }
) => {
  const mouseDown = new MouseEvent('mousedown', {
    clientX: start.x,
    clientY: start.y,
    bubbles: true,
  });
  element.dispatchEvent(mouseDown);
  
  // Simulate movement
  const mouseMove = new MouseEvent('mousemove', {
    clientX: end.x,
    clientY: end.y,
    bubbles: true,
  });
  document.dispatchEvent(mouseMove);
  
  const mouseUp = new MouseEvent('mouseup', {
    clientX: end.x,
    clientY: end.y,
    bubbles: true,
  });
  document.dispatchEvent(mouseUp);
  
  // Wait for any async operations
  await new Promise(resolve => setTimeout(resolve, 50));
};

export const simulateZoom = (element: HTMLElement, delta: number, center?: { x: number; y: number }) => {
  const event = new WheelEvent('wheel', {
    deltaY: delta,
    clientX: center?.x || 100,
    clientY: center?.y || 100,
    bubbles: true,
  });
  element.dispatchEvent(event);
};

// Timeline assertion helpers
export const assertClipExists = (clipId: string) => {
  const { screen } = require('@testing-library/react');
  expect(screen.getByTestId(`clip-${clipId}`)).toBeInTheDocument();
};

export const assertTrackExists = (trackId: string) => {
  const { screen } = require('@testing-library/react');
  expect(screen.getByTestId(`track-header-${trackId}`)).toBeInTheDocument();
};

export const assertPlayheadPosition = (expectedBeats: number) => {
  const { screen } = require('@testing-library/react');
  const playhead = screen.getByTestId('playhead');
  expect(playhead).toHaveAttribute('data-position', expectedBeats.toString());
};

export const assertTimelineZoom = (expectedZoom: number) => {
  const { screen } = require('@testing-library/react');
  const ruler = screen.getByTestId('timeline-ruler');
  expect(ruler).toHaveAttribute('data-zoom', expectedZoom.toString());
};

// Time conversion utilities for tests
export const beatsToPixels = (beats: number, beatWidth = 50) => beats * beatWidth;
export const pixelsToBeats = (pixels: number, beatWidth = 50) => pixels / beatWidth;
export const beatsToSeconds = (beats: number, tempo = 120) => (beats * 60) / tempo;
export const secondsToBeats = (seconds: number, tempo = 120) => (seconds * tempo) / 60;
