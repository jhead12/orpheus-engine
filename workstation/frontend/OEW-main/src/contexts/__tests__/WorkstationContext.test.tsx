import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { WorkstationProvider, useWorkstation } from '../WorkstationContext';
import { TimelinePosition, Track, TrackType, Clip } from '../../types/core';
import { PlatformService } from '../../services/PlatformService';
import { AudioService } from '../../services/audio/AudioService';

// Mock services
vi.mock('../../services/PlatformService');
vi.mock('../../services/AudioService');

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

// Mock audio APIs
global.AudioContext = vi.fn().mockImplementation(() => ({
  createGain: vi.fn(() => ({ gain: { value: 1 }, connect: vi.fn(), disconnect: vi.fn() })),
  createAnalyser: vi.fn(() => ({ connect: vi.fn(), disconnect: vi.fn() })),
  destination: {},
  state: 'running',
}));

const wrapper = ({ children }: { children: ReactNode }) => (
  <WorkstationProvider>{children}</WorkstationProvider>
);

describe('WorkstationContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
    (PlatformService.isElectron as any).mockReturnValue(false);
    (PlatformService.isBrowser as any).mockReturnValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initial State', () => {
    it('should provide default state', () => {
      const { result } = renderHook(() => useWorkstation(), { wrapper });
      
      expect(result.current.tracks).toEqual([]);
      expect(result.current.playheadPos).toEqual(new TimelinePosition(0, 0, 0));
      expect(result.current.maxPos).toEqual(new TimelinePosition(32, 0, 0));
      expect(result.current.isPlaying).toBe(false);
      expect(result.current.settings.tempo).toBe(120);
      expect(result.current.settings.timeSignature).toEqual({ beats: 4, noteValue: 4 });
    });

    it('should load state from localStorage', () => {
      const savedState = {
        tracks: [
          {
            id: 'track-1',
            name: 'Saved Track',
            type: 'audio',
            color: '#ff6b6b',
            volume: 0.8,
            pan: 0,
            mute: false,
            solo: false,
            armed: false,
          },
        ],
        settings: {
          tempo: 140,
          timeSignature: { beats: 3, noteValue: 4 },
          snap: true,
          snapUnit: 'bar',
          horizontalScale: 1.5,
        },
      };
      
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(savedState));
      
      const { result } = renderHook(() => useWorkstation(), { wrapper });
      
      expect(result.current.tracks).toHaveLength(1);
      expect(result.current.tracks[0].name).toBe('Saved Track');
      expect(result.current.settings.tempo).toBe(140);
      expect(result.current.settings.timeSignature.beats).toBe(3);
    });

    it('should handle corrupted localStorage gracefully', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid json');
      
      expect(() => {
        renderHook(() => useWorkstation(), { wrapper });
      }).not.toThrow();
    });
  });

  describe('Track Management', () => {
    it('should add new audio track', () => {
      const { result } = renderHook(() => useWorkstation(), { wrapper });
      
      act(() => {
        result.current.addTrack('audio');
      });
      
      expect(result.current.tracks).toHaveLength(1);
      expect(result.current.tracks[0].type).toBe(TrackType.Audio);
      expect(result.current.tracks[0].name).toBe('Audio Track 1');
    });

    it('should add new MIDI track', () => {
      const { result } = renderHook(() => useWorkstation(), { wrapper });
      
      act(() => {
        result.current.addTrack('midi');
      });
      
      expect(result.current.tracks).toHaveLength(1);
      expect(result.current.tracks[0].type).toBe(TrackType.Midi);
      expect(result.current.tracks[0].name).toBe('MIDI Track 1');
    });

    it('should generate unique track IDs', () => {
      const { result } = renderHook(() => useWorkstation(), { wrapper });
      
      act(() => {
        result.current.addTrack('audio');
        result.current.addTrack('audio');
        result.current.addTrack('midi');
      });
      
      const trackIds = result.current.tracks.map(t => t.id);
      const uniqueIds = [...new Set(trackIds)];
      
      expect(uniqueIds).toHaveLength(3);
    });

    it('should increment track names properly', () => {
      const { result } = renderHook(() => useWorkstation(), { wrapper });
      
      act(() => {
        result.current.addTrack('audio');
        result.current.addTrack('audio');
        result.current.addTrack('midi');
        result.current.addTrack('midi');
      });
      
      expect(result.current.tracks[0].name).toBe('Audio Track 1');
      expect(result.current.tracks[1].name).toBe('Audio Track 2');
      expect(result.current.tracks[2].name).toBe('MIDI Track 1');
      expect(result.current.tracks[3].name).toBe('MIDI Track 2');
    });

    it('should remove track by ID', () => {
      const { result } = renderHook(() => useWorkstation(), { wrapper });
      
      act(() => {
        result.current.addTrack('audio');
        result.current.addTrack('midi');
      });
      
      const trackIdToRemove = result.current.tracks[0].id;
      
      act(() => {
        result.current.removeTrack(trackIdToRemove);
      });
      
      expect(result.current.tracks).toHaveLength(1);
      expect(result.current.tracks[0].type).toBe(TrackType.Midi);
    });

    it('should update track properties', () => {
      const { result } = renderHook(() => useWorkstation(), { wrapper });
      
      act(() => {
        result.current.addTrack('audio');
      });
      
      const trackId = result.current.tracks[0].id;
      
      act(() => {
        result.current.updateTrack(trackId, {
          name: 'Updated Track',
          volume: 0.5,
          mute: true,
        });
      });
      
      const updatedTrack = result.current.tracks[0];
      expect(updatedTrack.name).toBe('Updated Track');
      expect(updatedTrack.volume).toBe(0.5);
      expect(updatedTrack.mute).toBe(true);
    });

    it('should duplicate track', () => {
      const { result } = renderHook(() => useWorkstation(), { wrapper });
      
      act(() => {
        result.current.addTrack('audio');
      });
      
      const originalTrack = result.current.tracks[0];
      
      act(() => {
        result.current.duplicateTrack(originalTrack.id);
      });
      
      expect(result.current.tracks).toHaveLength(2);
      expect(result.current.tracks[1].name).toBe(`${originalTrack.name} Copy`);
      expect(result.current.tracks[1].id).not.toBe(originalTrack.id);
    });
  });

  describe('Playback Control', () => {
    it('should start playback', () => {
      const { result } = renderHook(() => useWorkstation(), { wrapper });
      
      act(() => {
        result.current.play();
      });
      
      expect(result.current.isPlaying).toBe(true);
    });

    it('should pause playback', () => {
      const { result } = renderHook(() => useWorkstation(), { wrapper });
      
      act(() => {
        result.current.play();
        result.current.pause();
      });
      
      expect(result.current.isPlaying).toBe(false);
    });

    it('should stop playback and reset position', () => {
      const { result } = renderHook(() => useWorkstation(), { wrapper });
      
      act(() => {
        result.current.setPlayheadPos(new TimelinePosition(4, 2, 240));
        result.current.play();
        result.current.stop();
      });
      
      expect(result.current.isPlaying).toBe(false);
      expect(result.current.playheadPos).toEqual(new TimelinePosition(0, 0, 0));
    });

    it('should update playhead position', () => {
      const { result } = renderHook(() => useWorkstation(), { wrapper });
      
      const newPosition = new TimelinePosition(2, 1, 120);
      
      act(() => {
        result.current.setPlayheadPos(newPosition);
      });
      
      expect(result.current.playheadPos).toEqual(newPosition);
    });

    it('should clamp playhead position to valid range', () => {
      const { result } = renderHook(() => useWorkstation(), { wrapper });
      
      // Try to set position beyond max
      const beyondMaxPosition = new TimelinePosition(50, 0, 0);
      
      act(() => {
        result.current.setPlayheadPos(beyondMaxPosition);
      });
      
      expect(result.current.playheadPos.bar).toBeLessThanOrEqual(result.current.maxPos.bar);
    });
  });

  describe('Settings Management', () => {
    it('should update tempo', () => {
      const { result } = renderHook(() => useWorkstation(), { wrapper });
      
      act(() => {
        result.current.setSettings({ tempo: 140 });
      });
      
      expect(result.current.settings.tempo).toBe(140);
    });

    it('should update time signature', () => {
      const { result } = renderHook(() => useWorkstation(), { wrapper });
      
      act(() => {
        result.current.setSettings({
          timeSignature: { beats: 3, noteValue: 8 },
        });
      });
      
      expect(result.current.settings.timeSignature).toEqual({ beats: 3, noteValue: 8 });
    });

    it('should update snap settings', () => {
      const { result } = renderHook(() => useWorkstation(), { wrapper });
      
      act(() => {
        result.current.setSettings({
          snap: false,
          snapUnit: 'bar',
        });
      });
      
      expect(result.current.settings.snap).toBe(false);
      expect(result.current.settings.snapUnit).toBe('bar');
    });

    it('should update horizontal scale', () => {
      const { result } = renderHook(() => useWorkstation(), { wrapper });
      
      act(() => {
        result.current.setSettings({ horizontalScale: 2.0 });
      });
      
      expect(result.current.settings.horizontalScale).toBe(2.0);
    });
  });

  describe('Zoom Controls', () => {
    it('should zoom in', () => {
      const { result } = renderHook(() => useWorkstation(), { wrapper });
      
      const initialScale = result.current.settings.horizontalScale;
      
      act(() => {
        result.current.zoomIn();
      });
      
      expect(result.current.settings.horizontalScale).toBeGreaterThan(initialScale);
    });

    it('should zoom out', () => {
      const { result } = renderHook(() => useWorkstation(), { wrapper });
      
      // First zoom in to have room to zoom out
      act(() => {
        result.current.zoomIn();
      });
      
      const scaledUp = result.current.settings.horizontalScale;
      
      act(() => {
        result.current.zoomOut();
      });
      
      expect(result.current.settings.horizontalScale).toBeLessThan(scaledUp);
    });

    it('should clamp zoom to reasonable limits', () => {
      const { result } = renderHook(() => useWorkstation(), { wrapper });
      
      // Zoom out many times
      act(() => {
        for (let i = 0; i < 20; i++) {
          result.current.zoomOut();
        }
      });
      
      expect(result.current.settings.horizontalScale).toBeGreaterThan(0.1);
      
      // Zoom in many times
      act(() => {
        for (let i = 0; i < 20; i++) {
          result.current.zoomIn();
        }
      });
      
      expect(result.current.settings.horizontalScale).toBeLessThan(10);
    });

    it('should zoom to fit all content', () => {
      const { result } = renderHook(() => useWorkstation(), { wrapper });
      
      // Add some tracks with clips to have content
      act(() => {
        result.current.addTrack('audio');
        result.current.updateTrack(result.current.tracks[0].id, {
          clips: [
            {
              id: 'clip-1',
              name: 'Test Clip',
              type: TrackType.Audio,
              start: new TimelinePosition(0, 0, 0),
              end: new TimelinePosition(8, 0, 0),
              loopEnd: new TimelinePosition(8, 0, 0),
              muted: false,
            } as Clip,
          ],
        });
      });
      
      act(() => {
        result.current.zoomToFit();
      });
      
      // Should adjust scale to fit content
      expect(result.current.settings.horizontalScale).toBeDefined();
    });
  });

  describe('Selection Management', () => {
    it('should set track selection', () => {
      const { result } = renderHook(() => useWorkstation(), { wrapper });
      
      act(() => {
        result.current.addTrack('audio');
        result.current.addTrack('midi');
      });
      
      const trackIds = result.current.tracks.map(t => t.id);
      
      act(() => {
        result.current.setSelection({
          tracks: [trackIds[0]],
          clips: [],
          region: null,
        });
      });
      
      expect(result.current.selection.tracks).toEqual([trackIds[0]]);
    });

    it('should set region selection', () => {
      const { result } = renderHook(() => useWorkstation(), { wrapper });
      
      const region = {
        start: new TimelinePosition(1, 0, 0),
        end: new TimelinePosition(4, 0, 0),
      };
      
      act(() => {
        result.current.setSelection({
          tracks: [],
          clips: [],
          region,
        });
      });
      
      expect(result.current.selection.region).toEqual(region);
    });

    it('should clear selection', () => {
      const { result } = renderHook(() => useWorkstation(), { wrapper });
      
      // First set some selection
      act(() => {
        result.current.addTrack('audio');
        result.current.setSelection({
          tracks: [result.current.tracks[0].id],
          clips: [],
          region: null,
        });
      });
      
      // Then clear it
      act(() => {
        result.current.setSelection({
          tracks: [],
          clips: [],
          region: null,
        });
      });
      
      expect(result.current.selection.tracks).toEqual([]);
      expect(result.current.selection.clips).toEqual([]);
      expect(result.current.selection.region).toBeNull();
    });
  });

  describe('Clipboard Operations', () => {
    it('should copy selected tracks', () => {
      const { result } = renderHook(() => useWorkstation(), { wrapper });
      
      act(() => {
        result.current.addTrack('audio');
        result.current.setSelection({
          tracks: [result.current.tracks[0].id],
          clips: [],
          region: null,
        });
        result.current.copy();
      });
      
      expect(result.current.clipboard.tracks).toHaveLength(1);
      expect(result.current.clipboard.tracks[0].name).toBe('Audio Track 1');
    });

    it('should paste tracks from clipboard', () => {
      const { result } = renderHook(() => useWorkstation(), { wrapper });
      
      act(() => {
        result.current.addTrack('audio');
        result.current.setSelection({
          tracks: [result.current.tracks[0].id],
          clips: [],
          region: null,
        });
        result.current.copy();
        result.current.paste();
      });
      
      expect(result.current.tracks).toHaveLength(2);
      expect(result.current.tracks[1].name).toBe('Audio Track 1 Copy');
    });

    it('should cut selected tracks', () => {
      const { result } = renderHook(() => useWorkstation(), { wrapper });
      
      act(() => {
        result.current.addTrack('audio');
        result.current.setSelection({
          tracks: [result.current.tracks[0].id],
          clips: [],
          region: null,
        });
        result.current.cut();
      });
      
      expect(result.current.tracks).toHaveLength(0);
      expect(result.current.clipboard.tracks).toHaveLength(1);
    });

    it('should delete selected tracks', () => {
      const { result } = renderHook(() => useWorkstation(), { wrapper });
      
      act(() => {
        result.current.addTrack('audio');
        result.current.addTrack('midi');
        result.current.setSelection({
          tracks: [result.current.tracks[0].id],
          clips: [],
          region: null,
        });
        result.current.deleteSelection();
      });
      
      expect(result.current.tracks).toHaveLength(1);
      expect(result.current.tracks[0].type).toBe(TrackType.Midi);
    });
  });

  describe('Undo/Redo', () => {
    it('should track undo/redo state', () => {
      const { result } = renderHook(() => useWorkstation(), { wrapper });
      
      expect(result.current.canUndo).toBe(false);
      expect(result.current.canRedo).toBe(false);
      
      act(() => {
        result.current.addTrack('audio');
      });
      
      expect(result.current.canUndo).toBe(true);
      expect(result.current.canRedo).toBe(false);
    });

    it('should undo last action', () => {
      const { result } = renderHook(() => useWorkstation(), { wrapper });
      
      act(() => {
        result.current.addTrack('audio');
      });
      
      expect(result.current.tracks).toHaveLength(1);
      
      act(() => {
        result.current.undo();
      });
      
      expect(result.current.tracks).toHaveLength(0);
      expect(result.current.canRedo).toBe(true);
    });

    it('should redo undone action', () => {
      const { result } = renderHook(() => useWorkstation(), { wrapper });
      
      act(() => {
        result.current.addTrack('audio');
        result.current.undo();
        result.current.redo();
      });
      
      expect(result.current.tracks).toHaveLength(1);
      expect(result.current.canRedo).toBe(false);
    });

    it('should limit undo history', () => {
      const { result } = renderHook(() => useWorkstation(), { wrapper });
      
      // Perform many actions
      act(() => {
        for (let i = 0; i < 100; i++) {
          result.current.addTrack('audio');
        }
      });
      
      // Should still be able to undo, but not indefinitely
      let undoCount = 0;
      act(() => {
        while (result.current.canUndo && undoCount < 60) {
          result.current.undo();
          undoCount++;
        }
      });
      
      expect(undoCount).toBeLessThan(60); // Should hit limit before 60
    });
  });

  describe('Audio File Handling', () => {
    it('should create audio clip from file', async () => {
      const { result } = renderHook(() => useWorkstation(), { wrapper });
      
      const mockFile = new File(['audio data'], 'test.wav', { type: 'audio/wav' });
      const mockAudioService = AudioService.prototype;
      mockAudioService.loadAudioFile = vi.fn().mockResolvedValue({
        buffer: new ArrayBuffer(1024),
        name: 'test.wav',
        type: 'audio/wav',
      });
      mockAudioService.analyzeAudio = vi.fn().mockResolvedValue({
        duration: 5.0,
        waveform: [0.1, 0.2, 0.3],
        peaks: [0.5, 0.8],
      });
      
      act(() => {
        result.current.addTrack('audio');
      });
      
      await act(async () => {
        await result.current.createAudioClip(mockFile);
      });
      
      expect(result.current.tracks[0].clips).toHaveLength(1);
      expect(result.current.tracks[0].clips[0].name).toBe('test.wav');
    });

    it('should handle audio file loading errors', async () => {
      const { result } = renderHook(() => useWorkstation(), { wrapper });
      
      const mockFile = new File(['bad data'], 'bad.wav', { type: 'audio/wav' });
      const mockAudioService = AudioService.prototype;
      mockAudioService.loadAudioFile = vi.fn().mockRejectedValue(new Error('Load failed'));
      
      act(() => {
        result.current.addTrack('audio');
      });
      
      await act(async () => {
        try {
          await result.current.createAudioClip(mockFile);
        } catch (error) {
          expect(error.message).toBe('Load failed');
        }
      });
      
      expect(result.current.tracks[0].clips).toHaveLength(0);
    });
  });

  describe('Persistence', () => {
    it('should save state to localStorage on changes', async () => {
      const { result } = renderHook(() => useWorkstation(), { wrapper });
      
      act(() => {
        result.current.addTrack('audio');
        result.current.setSettings({ tempo: 140 });
      });
      
      // Wait for debounced save
      await waitFor(() => {
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
          'workstation-state',
          expect.stringContaining('"tempo":140')
        );
      });
    });

    it('should debounce saves to avoid excessive localStorage writes', async () => {
      const { result } = renderHook(() => useWorkstation(), { wrapper });
      
      act(() => {
        // Make multiple rapid changes
        result.current.setSettings({ tempo: 130 });
        result.current.setSettings({ tempo: 135 });
        result.current.setSettings({ tempo: 140 });
      });
      
      // Should only save once after debounce
      await waitFor(() => {
        expect(mockLocalStorage.setItem).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid track updates gracefully', () => {
      const { result } = renderHook(() => useWorkstation(), { wrapper });
      
      expect(() => {
        act(() => {
          result.current.updateTrack('non-existent-id', { name: 'Test' });
        });
      }).not.toThrow();
      
      expect(result.current.tracks).toHaveLength(0);
    });

    it('should handle invalid playhead positions', () => {
      const { result } = renderHook(() => useWorkstation(), { wrapper });
      
      expect(() => {
        act(() => {
          result.current.setPlayheadPos(null as any);
        });
      }).not.toThrow();
    });

    it('should handle corrupted undo history', () => {
      const { result } = renderHook(() => useWorkstation(), { wrapper });
      
      // Simulate corrupted undo state
      act(() => {
        result.current.addTrack('audio');
        // Force corrupt the internal undo stack
        (result.current as any).__corrupt_undo_stack = true;
      });
      
      expect(() => {
        act(() => {
          result.current.undo();
        });
      }).not.toThrow();
    });
  });
});
