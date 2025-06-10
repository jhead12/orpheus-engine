import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { ReactNode } from 'react';
import { WorkstationProvider, useWorkstation } from '../WorkstationContext';
import { Track, TrackType, AutomationMode } from '../../types/core';

// Mock services
vi.mock('../../services/PlatformService', () => ({
  PlatformService: {
    isElectron: vi.fn(() => false),
    isBrowser: vi.fn(() => true),
  },
}));

vi.mock('../../services/audio/AudioService', () => ({
  AudioService: vi.fn().mockImplementation(() => ({
    loadAudioFile: vi.fn(),
    analyzeAudio: vi.fn(),
    createGain: vi.fn(),
    createAnalyser: vi.fn(),
  })),
}));

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
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initial State', () => {
    it('should provide default state', () => {
      const { result } = renderHook(() => useWorkstation(), { wrapper });
      
      expect(result.current.tracks).toEqual([]);
      expect(result.current.masterTrack).toBeDefined();
      expect(result.current.masterTrack?.name).toBe('Master');
      expect(result.current.selectedTrackId).toBeNull();
      expect(result.current.playheadPos).toBeDefined();
      expect(result.current.isPlaying).toBe(false);
    });

    it('should handle missing localStorage gracefully', () => {
      expect(() => {
        renderHook(() => useWorkstation(), { wrapper });
      }).not.toThrow();
    });

    it('should handle corrupted localStorage gracefully', () => {
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
      expect(result.current.tracks[0].name).toContain('Track');
    });

    it('should add new MIDI track', () => {
      const { result } = renderHook(() => useWorkstation(), { wrapper });
      
      act(() => {
        result.current.addTrack('midi');
      });
      
      expect(result.current.tracks).toHaveLength(1);
      expect(result.current.tracks[0].type).toBe(TrackType.Midi);
      expect(result.current.tracks[0].name).toContain('Track');
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

    it('should update track properties', () => {
      const { result } = renderHook(() => useWorkstation(), { wrapper });
      
      act(() => {
        result.current.addTrack('audio');
      });
      
      const track = result.current.tracks[0];
      const updatedTrack = {
        ...track,
        name: 'Updated Track',
        mute: true,
      };
      
      act(() => {
        result.current.setTrack(updatedTrack);
      });
      
      const finalTrack = result.current.tracks.find(t => t.id === track.id);
      expect(finalTrack?.name).toBe('Updated Track');
      expect(finalTrack?.mute).toBe(true);
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
      expect(result.current.tracks[1].name).toContain(originalTrack.name);
      expect(result.current.tracks[1].id).not.toBe(originalTrack.id);
    });

    it('should remove track by ID', () => {
      const { result } = renderHook(() => useWorkstation(), { wrapper });
      
      act(() => {
        result.current.addTrack('audio');
        result.current.addTrack('midi');
      });
      
      const trackIdToRemove = result.current.tracks[0].id;
      
      act(() => {
        result.current.deleteTrack(result.current.tracks[0]);
      });
      
      expect(result.current.tracks).toHaveLength(1);
      expect(result.current.tracks[0].type).toBe(TrackType.Midi);
    });
  });

  describe('Playback Control', () => {
    it('should have playback state', () => {
      const { result } = renderHook(() => useWorkstation(), { wrapper });
      
      expect(result.current.isPlaying).toBe(false);
      expect(result.current.playheadPos).toBeDefined();
    });

    it('should update playhead position', () => {
      const { result } = renderHook(() => useWorkstation(), { wrapper });
      
      const newPosition = { bar: 2, beat: 1, tick: 120 };
      
      act(() => {
        result.current.setPlayheadPos(newPosition);
      });
      
      expect(result.current.playheadPos.bar).toBe(2);
      expect(result.current.playheadPos.beat).toBe(1);
      expect(result.current.playheadPos.tick).toBe(120);
    });
  });

  describe('UI State Management', () => {
    it('should manage menu and shortcuts state', () => {
      const { result } = renderHook(() => useWorkstation(), { wrapper });
      
      expect(() => {
        act(() => {
          result.current.setAllowMenuAndShortcuts(false);
          result.current.setAllowMenuAndShortcuts(true);
        });
      }).not.toThrow();
    });

    it('should manage track selection', () => {
      const { result } = renderHook(() => useWorkstation(), { wrapper });
      
      act(() => {
        result.current.addTrack('audio');
      });
      
      const trackId = result.current.tracks[0].id;
      
      act(() => {
        result.current.setSelectedTrackId(trackId);
      });
      
      expect(result.current.selectedTrackId).toBe(trackId);
    });
  });

  describe('Automation System', () => {
    it('should get track current values', () => {
      const { result } = renderHook(() => useWorkstation(), { wrapper });
      
      act(() => {
        result.current.addTrack('audio');
      });
      
      const track = result.current.tracks[0];
      const currentValue = result.current.getTrackCurrentValue(track);
      
      expect(currentValue).toBeDefined();
      expect(typeof currentValue.value).toBe('number');
      expect(typeof currentValue.isAutomated).toBe('boolean');
    });
  });

  describe('Master Track', () => {
    it('should have a master track', () => {
      const { result } = renderHook(() => useWorkstation(), { wrapper });
      
      expect(result.current.masterTrack).toBeDefined();
      expect(result.current.masterTrack?.name).toBe('Master');
      expect(result.current.masterTrack?.type).toBe(TrackType.Audio);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid track operations gracefully', () => {
      const { result } = renderHook(() => useWorkstation(), { wrapper });
      
      expect(() => {
        act(() => {
          const invalidTrack = { id: 'non-existent', name: 'Test' } as Track;
          result.current.setTrack(invalidTrack);
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
  });
});
