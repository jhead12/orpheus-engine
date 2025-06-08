import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Timeline } from '../Timeline';
import { WorkstationContext } from '../../../../contexts/WorkstationContext';
import { TimelinePosition, Track, TrackType } from '../../../../types/core';

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver  
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
  root: null,
  rootMargin: '',
  thresholds: [],
}));

// Mock requestAnimationFrame
global.requestAnimationFrame = vi.fn().mockImplementation((cb) => setTimeout(cb, 16));
global.cancelAnimationFrame = vi.fn().mockImplementation(clearTimeout);

// Mock WorkstationContext
const mockWorkstationContext = {
  tracks: [
    {
      id: 'track-1',
      name: 'Audio Track 1',
      type: TrackType.Audio,
      color: '#ff6b6b',
      mute: false,
      solo: false,
      armed: false,
      volume: 0.8,
      pan: 0,
      automation: false,
      clips: [],
      effects: [],
      automationLanes: [],
    } as Track,
    {
      id: 'track-2', 
      name: 'MIDI Track 1',
      type: TrackType.Midi,
      color: '#4ecdc4',
      mute: false,
      solo: false,
      armed: true,
      volume: 0.7,
      pan: -0.2,
      automation: true,
      clips: [],
      effects: [],
      automationLanes: [],
    } as Track,
  ],
  playheadPos: new TimelinePosition(1, 2, 240),
  maxPos: new TimelinePosition(32, 0, 0),
  isPlaying: false,
  settings: {
    tempo: 120,
    timeSignature: { beats: 4, noteValue: 4 },
    snap: true,
    snapUnit: 'beat' as const,
    horizontalScale: 1.0,
    beatWidth: 64,
  },
  setPlayheadPos: vi.fn(),
  addTrack: vi.fn(),
  removeTrack: vi.fn(),
  updateTrack: vi.fn(),
  duplicateTrack: vi.fn(),
  play: vi.fn(),
  pause: vi.fn(),
  stop: vi.fn(),
  record: vi.fn(),
  setSettings: vi.fn(),
  undo: vi.fn(),
  redo: vi.fn(),
  canUndo: false,
  canRedo: false,
  zoomIn: vi.fn(),
  zoomOut: vi.fn(),
  zoomToFit: vi.fn(),
  selection: {
    tracks: [],
    clips: [],
    region: null,
  },
  setSelection: vi.fn(),
  clipboard: {
    tracks: [],
    clips: [],
  },
  copy: vi.fn(),
  paste: vi.fn(),
  cut: vi.fn(),
  deleteSelection: vi.fn(),
};

const renderTimeline = (props = {}) => {
  return render(
    <WorkstationContext.Provider value={mockWorkstationContext}>
      <Timeline {...props} />
    </WorkstationContext.Provider>
  );
};

describe('Timeline Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('should render timeline with tracks', () => {
      renderTimeline();
      
      expect(screen.getByText('Audio Track 1')).toBeInTheDocument();
      expect(screen.getByText('MIDI Track 1')).toBeInTheDocument();
    });

    it('should render playhead at correct position', () => {
      renderTimeline();
      
      const playhead = screen.getByTestId('timeline-playhead');
      expect(playhead).toBeInTheDocument();
      
      // Playhead should be positioned based on current position
      const expectedLeft = (1 * 4 + 2) * 64 + (240 / 480) * 64; // bar * beats + beat * beatWidth + tick position
      expect(playhead).toHaveStyle(`left: ${expectedLeft}px`);
    });

    it('should render time ruler with measure markers', () => {
      renderTimeline();
      
      const ruler = screen.getByTestId('time-ruler');
      expect(ruler).toBeInTheDocument();
      
      // Should show measure numbers
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('should render snap grid when snap is enabled', () => {
      renderTimeline();
      
      const snapGrid = screen.getByTestId('snap-grid');
      expect(snapGrid).toBeInTheDocument();
    });

    it('should not render snap grid when snap is disabled', () => {
      const contextWithSnapDisabled = {
        ...mockWorkstationContext,
        settings: {
          ...mockWorkstationContext.settings,
          snap: false,
        },
      };

      render(
        <WorkstationContext.Provider value={contextWithSnapDisabled}>
          <Timeline />
        </WorkstationContext.Provider>
      );
      
      expect(screen.queryByTestId('snap-grid')).not.toBeInTheDocument();
    });
  });

  describe('Playhead Interaction', () => {
    it('should move playhead on timeline click', async () => {
      const user = userEvent.setup();
      renderTimeline();
      
      const timeline = screen.getByTestId('timeline-content');
      
      // Click at position that should correspond to measure 2, beat 1
      await user.click(timeline, { clientX: 320 }); // 5 beats * 64px per beat
      
      expect(mockWorkstationContext.setPlayheadPos).toHaveBeenCalledWith(
        expect.objectContaining({
          bar: expect.any(Number),
          beat: expect.any(Number),
          tick: expect.any(Number),
        })
      );
    });

    it('should snap playhead to grid when snap is enabled', async () => {
      const user = userEvent.setup();
      renderTimeline();
      
      const timeline = screen.getByTestId('timeline-content');
      
      // Click at a position between beats
      await user.click(timeline, { clientX: 96 }); // 1.5 beats * 64px
      
      // Should snap to nearest beat (either beat 1 or beat 2)
      expect(mockWorkstationContext.setPlayheadPos).toHaveBeenCalledWith(
        expect.objectContaining({
          tick: 0, // Should snap to beat boundary
        })
      );
    });

    it('should drag playhead to new position', async () => {
      const user = userEvent.setup();
      renderTimeline();
      
      const playhead = screen.getByTestId('timeline-playhead');
      
      await user.pointer([
        { keys: '[MouseLeft>]', target: playhead },
        { coords: { clientX: 200 } },
        { keys: '[/MouseLeft]' },
      ]);
      
      expect(mockWorkstationContext.setPlayheadPos).toHaveBeenCalled();
    });
  });

  describe('Zoom and Scroll', () => {
    it('should zoom in on scroll with Ctrl key', async () => {
      const user = userEvent.setup();
      renderTimeline();
      
      const timeline = screen.getByTestId('timeline-content');
      
      await user.keyboard('{Control>}');
      fireEvent.wheel(timeline, { deltaY: -100, ctrlKey: true });
      await user.keyboard('{/Control}');
      
      expect(mockWorkstationContext.zoomIn).toHaveBeenCalled();
    });

    it('should zoom out on scroll with Ctrl key', async () => {
      const user = userEvent.setup();
      renderTimeline();
      
      const timeline = screen.getByTestId('timeline-content');
      
      await user.keyboard('{Control>}');
      fireEvent.wheel(timeline, { deltaY: 100, ctrlKey: true });
      await user.keyboard('{/Control}');
      
      expect(mockWorkstationContext.zoomOut).toHaveBeenCalled();
    });

    it('should scroll horizontally on wheel without Ctrl', () => {
      renderTimeline();
      
      const timeline = screen.getByTestId('timeline-content');
      const scrollContainer = timeline.closest('.timeline-scroll-container');
      
      fireEvent.wheel(timeline, { deltaY: 100 });
      
      // Should scroll the container horizontally
      expect(scrollContainer?.scrollLeft).toBeGreaterThan(0);
    });
  });

  describe('Track Management', () => {
    it('should add new track when clicking add track button', async () => {
      const user = userEvent.setup();
      renderTimeline();
      
      const addTrackButton = screen.getByTestId('add-track-button');
      await user.click(addTrackButton);
      
      expect(mockWorkstationContext.addTrack).toHaveBeenCalledWith('audio');
    });

    it('should show track context menu on right click', async () => {
      const user = userEvent.setup();
      renderTimeline();
      
      const track = screen.getByTestId('track-track-1');
      await user.pointer({ keys: '[MouseRight]', target: track });
      
      await waitFor(() => {
        expect(screen.getByTestId('track-context-menu')).toBeInTheDocument();
      });
    });

    it('should toggle track mute on mute button click', async () => {
      const user = userEvent.setup();
      renderTimeline();
      
      const muteButton = screen.getByTestId('track-track-1-mute');
      await user.click(muteButton);
      
      expect(mockWorkstationContext.updateTrack).toHaveBeenCalledWith('track-1', {
        mute: true,
      });
    });

    it('should toggle track solo on solo button click', async () => {
      const user = userEvent.setup();
      renderTimeline();
      
      const soloButton = screen.getByTestId('track-track-1-solo');
      await user.click(soloButton);
      
      expect(mockWorkstationContext.updateTrack).toHaveBeenCalledWith('track-1', {
        solo: true,
      });
    });
  });

  describe('Selection', () => {
    it('should select track on click', async () => {
      const user = userEvent.setup();
      renderTimeline();
      
      const track = screen.getByTestId('track-track-1');
      await user.click(track);
      
      expect(mockWorkstationContext.setSelection).toHaveBeenCalledWith({
        tracks: ['track-1'],
        clips: [],
        region: null,
      });
    });

    it('should extend selection with Ctrl+click', async () => {
      const user = userEvent.setup();
      renderTimeline();
      
      const track1 = screen.getByTestId('track-track-1');
      const track2 = screen.getByTestId('track-track-2');
      
      // Select first track
      await user.click(track1);
      
      // Ctrl+click second track to extend selection
      await user.keyboard('{Control>}');
      await user.click(track2);
      await user.keyboard('{/Control}');
      
      expect(mockWorkstationContext.setSelection).toHaveBeenLastCalledWith({
        tracks: ['track-1', 'track-2'],
        clips: [],
        region: null,
      });
    });

    it('should create region selection with drag', async () => {
      const user = userEvent.setup();
      renderTimeline();
      
      const timeline = screen.getByTestId('timeline-content');
      
      await user.pointer([
        { keys: '[MouseLeft>]', target: timeline, coords: { clientX: 100 } },
        { coords: { clientX: 300 } },
        { keys: '[/MouseLeft]' },
      ]);
      
      expect(mockWorkstationContext.setSelection).toHaveBeenCalledWith(
        expect.objectContaining({
          region: expect.objectContaining({
            start: expect.any(Object),
            end: expect.any(Object),
          }),
        })
      );
    });
  });

  describe('Keyboard Shortcuts', () => {
    it('should play/pause on spacebar', async () => {
      const user = userEvent.setup();
      renderTimeline();
      
      await user.keyboard(' ');
      
      expect(mockWorkstationContext.play).toHaveBeenCalled();
    });

    it('should stop on Enter', async () => {
      const user = userEvent.setup();
      renderTimeline();
      
      await user.keyboard('{Enter}');
      
      expect(mockWorkstationContext.stop).toHaveBeenCalled();
    });

    it('should undo on Ctrl+Z', async () => {
      const user = userEvent.setup();
      renderTimeline();
      
      await user.keyboard('{Control>}z{/Control}');
      
      expect(mockWorkstationContext.undo).toHaveBeenCalled();
    });

    it('should redo on Ctrl+Y', async () => {
      const user = userEvent.setup();
      renderTimeline();
      
      await user.keyboard('{Control>}y{/Control}');
      
      expect(mockWorkstationContext.redo).toHaveBeenCalled();
    });

    it('should zoom to fit on Ctrl+0', async () => {
      const user = userEvent.setup();
      renderTimeline();
      
      await user.keyboard('{Control>}0{/Control}');
      
      expect(mockWorkstationContext.zoomToFit).toHaveBeenCalled();
    });
  });

  describe('Performance', () => {
    it('should handle large number of tracks efficiently', () => {
      const manyTracks = Array.from({ length: 100 }, (_, i) => ({
        id: `track-${i}`,
        name: `Track ${i}`,
        type: TrackType.Audio,
        color: '#ff6b6b',
        mute: false,
        solo: false,
        armed: false,
        volume: 0.8,
        pan: 0,
        automation: false,
        clips: [],
        effects: [],
        automationLanes: [],
      }));

      const contextWithManyTracks = {
        ...mockWorkstationContext,
        tracks: manyTracks,
      };

      const startTime = performance.now();
      
      render(
        <WorkstationContext.Provider value={contextWithManyTracks}>
          <Timeline />
        </WorkstationContext.Provider>
      );
      
      const endTime = performance.now();
      
      // Rendering should complete in reasonable time
      expect(endTime - startTime).toBeLessThan(1000);
    });

    it('should virtualize track rendering for performance', () => {
      const manyTracks = Array.from({ length: 1000 }, (_, i) => ({
        id: `track-${i}`,
        name: `Track ${i}`,
        type: TrackType.Audio,
        color: '#ff6b6b',
        mute: false,
        solo: false,
        armed: false,
        volume: 0.8,
        pan: 0,
        automation: false,
        clips: [],
        effects: [],
        automationLanes: [],
      }));

      const contextWithManyTracks = {
        ...mockWorkstationContext,
        tracks: manyTracks,
      };

      render(
        <WorkstationContext.Provider value={contextWithManyTracks}>
          <Timeline />
        </WorkstationContext.Provider>
      );
      
      // Should only render visible tracks, not all 1000
      const trackElements = screen.getAllByTestId(/^track-track-/);
      expect(trackElements.length).toBeLessThan(50); // Only visible tracks
    });
  });

  describe('Accessibility', () => {
    it('should be keyboard navigable', async () => {
      const user = userEvent.setup();
      renderTimeline();
      
      const firstTrack = screen.getByTestId('track-track-1');
      firstTrack.focus();
      
      // Navigate with arrow keys
      await user.keyboard('{ArrowDown}');
      expect(screen.getByTestId('track-track-2')).toHaveFocus();
      
      await user.keyboard('{ArrowUp}');
      expect(screen.getByTestId('track-track-1')).toHaveFocus();
    });

    it('should have proper ARIA labels', () => {
      renderTimeline();
      
      const timeline = screen.getByTestId('timeline-content');
      expect(timeline).toHaveAttribute('role', 'application');
      expect(timeline).toHaveAttribute('aria-label', 'Timeline');
      
      const playhead = screen.getByTestId('timeline-playhead');
      expect(playhead).toHaveAttribute('aria-label', 'Playhead position');
    });

    it('should announce playhead position changes', async () => {
      const user = userEvent.setup();
      renderTimeline();
      
      const timeline = screen.getByTestId('timeline-content');
      await user.click(timeline, { clientX: 128 });
      
      const announcement = screen.getByTestId('playhead-announcement');
      expect(announcement).toHaveTextContent(/Playhead moved to/);
    });
  });

  describe('Error Handling', () => {
    it('should handle missing context gracefully', () => {
      expect(() => {
        render(<Timeline />);
      }).not.toThrow();
    });

    it('should handle invalid playhead position', () => {
      const contextWithInvalidPlayhead = {
        ...mockWorkstationContext,
        playheadPos: null as any,
      };

      expect(() => {
        render(
          <WorkstationContext.Provider value={contextWithInvalidPlayhead}>
            <Timeline />
          </WorkstationContext.Provider>
        );
      }).not.toThrow();
    });

    it('should handle empty tracks array', () => {
      const contextWithNoTracks = {
        ...mockWorkstationContext,
        tracks: [],
      };

      render(
        <WorkstationContext.Provider value={contextWithNoTracks}>
          <Timeline />
        </WorkstationContext.Provider>
      );
      
      expect(screen.getByText('No tracks')).toBeInTheDocument();
    });
  });
});
