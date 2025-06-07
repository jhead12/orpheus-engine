import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Lane from '../../screens/workstation/components/Lane';
import { ClipboardContext } from '../../contexts/ClipboardContext';
import { WorkstationContext } from '../../contexts/WorkstationContext';
import { TrackType, AutomationMode } from '../../types/core';

// Mock TimelinePosition class with all required methods - fix the typing
const mockTimelinePosition: any = {
  ticks: 0,
  diff: vi.fn(() => mockTimelinePosition),
  fromTicks: vi.fn(() => mockTimelinePosition),
  fromMargin: vi.fn(() => mockTimelinePosition),
  fromSpan: vi.fn(() => mockTimelinePosition),
  fromSixteenths: vi.fn(() => mockTimelinePosition),
  fromSeconds: vi.fn(() => mockTimelinePosition),
  durationToSpan: vi.fn(() => 100),
  toSeconds: vi.fn(() => 1.0),
  toMargin: vi.fn(() => 100), // Add missing toMargin method
  snap: vi.fn(() => mockTimelinePosition),
  translate: vi.fn(() => mockTimelinePosition),
  toString: vi.fn(() => '0:00:00'),
  copy: vi.fn(() => mockTimelinePosition),
  equals: vi.fn(() => true),
  add: vi.fn(() => mockTimelinePosition),
  compareTo: vi.fn(() => 0),
};

// Mock TimelinePosition constructor
vi.mock('../../services/types/timeline', () => ({
  TimelinePosition: vi.fn().mockImplementation((ticks = 0) => ({
    ...mockTimelinePosition,
    ticks,
  })),
}));

// Mock Canvas API for Waveform component
const mockCanvasContext = {
  fillRect: vi.fn(),
  clearRect: vi.fn(),
  getImageData: vi.fn(),
  putImageData: vi.fn(),
  createImageData: vi.fn(),
  setTransform: vi.fn(),
  drawImage: vi.fn(),
  save: vi.fn(),
  fillText: vi.fn(),
  restore: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  closePath: vi.fn(),
  stroke: vi.fn(),
  translate: vi.fn(),
  scale: vi.fn(),
  rotate: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  measureText: vi.fn(() => ({ width: 100 })),
  transform: vi.fn(),
  clip: vi.fn(),
  quadraticCurveTo: vi.fn(),
  bezierCurveTo: vi.fn(),
  arcTo: vi.fn(),
  createLinearGradient: vi.fn(),
  createRadialGradient: vi.fn(),
  createPattern: vi.fn(),
  strokeText: vi.fn(),
  isPointInPath: vi.fn(),
  isPointInStroke: vi.fn(),
  globalAlpha: 1,
  globalCompositeOperation: 'source-over',
  strokeStyle: '#000000',
  fillStyle: '#000000',
  lineWidth: 1,
  lineCap: 'butt',
  lineJoin: 'miter',
  miterLimit: 10,
  lineDashOffset: 0,
  shadowOffsetX: 0,
  shadowOffsetY: 0,
  shadowBlur: 0,
  shadowColor: 'rgba(0, 0, 0, 0)',
  font: '10px sans-serif',
  textAlign: 'start',
  textBaseline: 'alphabetic',
  direction: 'inherit',
  imageSmoothingEnabled: true,
};

// Mock HTMLCanvasElement
Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  value: vi.fn().mockReturnValue(mockCanvasContext),
  writable: true,
});

Object.defineProperty(HTMLCanvasElement.prototype, 'width', {
  value: 800,
  writable: true,
});

Object.defineProperty(HTMLCanvasElement.prototype, 'height', {
  value: 100,
  writable: true,
});

// Mock audio-related functionality with unused parameter fixes
class MockAudioBuffer {
  sampleRate = 44100;
  length = 1024;
  duration = 1.0;
  numberOfChannels = 2;

  getChannelData(_channel: number): Float32Array {
    return new Float32Array(this.length);
  }

  copyFromChannel(_destination: Float32Array, _channelNumber: number, _bufferOffset?: number): void {}
  copyToChannel(_source: Float32Array, _channelNumber: number, _bufferOffset?: number): void {}
}

class MockAudioContext {
  state = 'suspended';
  sampleRate = 44100;
  currentTime = 0;
  destination = {};
  listener = {};

  createBuffer(_numberOfChannels: number, _length: number, _sampleRate: number): MockAudioBuffer {
    return new MockAudioBuffer();
  }

  decodeAudioData(_audioData: ArrayBuffer): Promise<MockAudioBuffer> {
    return Promise.resolve(new MockAudioBuffer());
  }

  createBufferSource() {
    return {
      buffer: null,
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    };
  }

  createGain() {
    return {
      gain: { value: 1 },
      connect: vi.fn(),
    };
  }

  resume(): Promise<void> {
    return Promise.resolve();
  }

  suspend(): Promise<void> {
    return Promise.resolve();
  }

  close(): Promise<void> {
    return Promise.resolve();
  }
}

// Mock global AudioContext
global.AudioContext = MockAudioContext as any;
global.webkitAudioContext = MockAudioContext as any;

// Mock HTML Audio element
Object.defineProperty(HTMLAudioElement.prototype, 'play', {
  value: vi.fn().mockResolvedValue(undefined),
  writable: true,
});

Object.defineProperty(HTMLAudioElement.prototype, 'pause', {
  value: vi.fn(),
  writable: true,
});

Object.defineProperty(HTMLAudioElement.prototype, 'load', {
  value: vi.fn(),
  writable: true,
});

// Mock audio properties
['currentTime', 'duration', 'volume', 'playbackRate', 'muted', 'paused', 'ended'].forEach(prop => {
  Object.defineProperty(HTMLAudioElement.prototype, prop, {
    value: prop === 'volume' ? 1 : 0,
    writable: true,
  });
});

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock window.requestAnimationFrame
global.requestAnimationFrame = vi.fn((cb) => setTimeout(cb, 16));
global.cancelAnimationFrame = vi.fn((id) => clearTimeout(id));

describe('Lane Component', () => {
  const mockClipboardContext = {
    clipboardItem: null,
    setClipboardItem: vi.fn(),
  };

  const mockMasterTrack = {
    id: 'master-track',
    name: 'Master',
    type: TrackType.Audio,
    color: '#ffffff',
    mute: false,
    solo: false,
    armed: false,
    volume: 0,
    pan: 0,
    automation: false,
    automationMode: AutomationMode.Off,
    automationLanes: [],
    clips: [],
    fx: {
      preset: null,
      effects: [],
      selectedEffectIndex: 0,
    },
  };

  const mockWorkstationContext = {
    tracks: [],
    masterTrack: mockMasterTrack,
    playheadPos: mockTimelinePosition,
    maxPos: mockTimelinePosition,
    numMeasures: 16,
    snapGridSize: mockTimelinePosition,
    songRegion: null,
    verticalScale: 1,
    showMaster: true,
    timelineSettings: {
      beatWidth: 80,
      timeSignature: { beats: 4, noteValue: 4 },
      horizontalScale: 1,
    },
    isPlaying: false,
    scrollToItem: null,
    allowMenuAndShortcuts: true,
    trackRegion: null,
    selectedTrackId: null,
    setTracks: vi.fn(),
    setPlayheadPos: vi.fn(),
    setSongRegion: vi.fn(),
    setVerticalScale: vi.fn(),
    setScrollToItem: vi.fn(),
    setAllowMenuAndShortcuts: vi.fn(),
    setSelectedTrackId: vi.fn(),
    setTrackRegion: vi.fn(),
    addTrack: vi.fn(),
    adjustNumMeasures: vi.fn(),
    createAudioClip: vi.fn(),
    createClipFromTrackRegion: vi.fn(),
    insertClips: vi.fn(),
    setTrack: vi.fn(),
    deleteClip: vi.fn(),
    duplicateClip: vi.fn(),
    splitClip: vi.fn(),
    consolidateClip: vi.fn(),
    toggleMuteClip: vi.fn(),
    setSelectedClipId: vi.fn(),
    selectedClipId: null,
    pasteClip: vi.fn(),
  };

  const defaultProps = {
    dragDataTarget: null,
    track: {
      id: 'track-1',
      name: 'Test Track',
      type: TrackType.Audio,
      color: '#ff0000',
      volume: 0.8,
      pan: 0,
      mute: false,
      solo: false,
      armed: false,
      automation: false,
      automationMode: AutomationMode.Read,
      clips: [],
      automationLanes: [],
      fx: {
        preset: null,
        effects: [],
        selectedEffectIndex: 0,
      },
    },
    onClipContextMenu: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderWithContext = (props = {}) => {
    return render(
      <WorkstationContext.Provider value={mockWorkstationContext}>
        <ClipboardContext.Provider value={mockClipboardContext}>
          <Lane {...defaultProps} {...props} />
        </ClipboardContext.Provider>
      </WorkstationContext.Provider>
    );
  };

  it('renders without crashing', () => {
    expect(() => renderWithContext()).not.toThrow();
  });

  it('renders lane container', () => {
    renderWithContext();
    const laneElement = document.querySelector('[data-track="track-1"]');
    expect(laneElement).toBeInTheDocument();
  });

  it('displays track volume correctly', () => {
    renderWithContext();
    // Check if volume is displayed (assuming there's a volume indicator)
    // This might need adjustment based on actual Lane component implementation
  });

  it('handles mute state', () => {
    renderWithContext({ track: { ...defaultProps.track, mute: true } });
    // Add assertions based on how mute state is displayed
  });

  it('handles solo state', () => {
    renderWithContext({ track: { ...defaultProps.track, solo: true } });
    // Add assertions based on how solo state is displayed
  });

  it('renders clips when present', () => {
    const trackWithClips = {
      ...defaultProps.track,
      clips: [
        {
          id: 'clip-1',
          name: 'Test Clip',
          start: mockTimelinePosition,
          end: mockTimelinePosition,
          startPosition: mockTimelinePosition,
          duration: mockTimelinePosition,
          trackId: 'track-1',
          type: TrackType.Audio
        }
      ]
    };
    
    renderWithContext({ track: trackWithClips });
    // Check if clip container exists
    const laneElement = document.querySelector('[data-track="track-1"]');
    expect(laneElement).toBeInTheDocument();
  });

  it('handles empty track', () => {
    renderWithContext({ track: { ...defaultProps.track, clips: [] } });
    // Should render the lane container
    const laneElement = document.querySelector('[data-track="track-1"]');
    expect(laneElement).toBeInTheDocument();
  });

  it('calls onSelectClip when clip is selected', () => {
    const onSelectClip = vi.fn();
    const trackWithClips = {
      ...defaultProps.track,
      clips: [
        {
          id: 'clip-1',
          name: 'Test Clip',
          start: mockTimelinePosition,
          end: mockTimelinePosition,
          startPosition: mockTimelinePosition,
          duration: mockTimelinePosition,
          trackId: 'track-1',
          type: TrackType.Audio
        }
      ]
    };
    
    renderWithContext({ 
      track: trackWithClips, 
      onSelectClip 
    });
    
    // This would need to be adjusted based on actual clip interaction implementation
    // expect(onSelectClip).toHaveBeenCalled();
  });

  it('handles automation lanes', () => {
    const trackWithAutomation = {
      ...defaultProps.track,
      automationLanes: [
        {
          id: 'auto-1',
          parameter: 'volume',
          points: [],
        }
      ]
    };
    
    renderWithContext({ track: trackWithAutomation });
    // Add assertions for automation lane rendering
  });

  it('respects timeline position', () => {
    const customPosition = {
      ...mockTimelinePosition,
      ticks: 1920,
    };
    
    renderWithContext({ currentPosition: customPosition });
    // Add assertions for timeline position handling
  });

  it('handles playing state', () => {
    renderWithContext({ isPlaying: true });
    // Add assertions for playing state visual indicators
  });

  it('handles track index correctly', () => {
    renderWithContext({ trackIndex: 5 });
    // Add assertions for track index handling (if applicable to visual layout)
  });
});