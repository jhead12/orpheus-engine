import React from 'react';
import { render, renderHook } from '@testing-library/react';
import { Mock, describe, expect, it, vi } from 'vitest';
import WorkstationContext, { 
  WorkstationContextType, 
  useWorkstation 
} from '../../contexts/WorkstationContext';
import { TimelinePosition, Track } from '../../services/types/types';

describe('WorkstationContext', () => {
  // Create mock values for WorkstationContext
  const mockAddTrack = vi.fn();
  const mockAdjustNumMeasures = vi.fn();
  const mockCreateAudioClip = vi.fn();
  const mockInsertClips = vi.fn();
  const mockSetPlayheadPos = vi.fn();
  const mockSetScrollToItem = vi.fn();
  const mockSetSongRegion = vi.fn();
  const mockSetTracks = vi.fn();
  const mockSetVerticalScale = vi.fn();
  const mockUpdateTimelineSettings = vi.fn();
  const mockSetAllowMenuAndShortcuts = vi.fn();
  const mockSetMixerHeight = vi.fn();
  const mockSetShowMixer = vi.fn();
  const mockSaveWorkstation = vi.fn();
  const mockLoadWorkstation = vi.fn();
  const mockListWorkstations = vi.fn();

  // Create mock context value with all required properties
  const mockContextValue: WorkstationContextType = {
    addTrack: mockAddTrack as Mock,
    adjustNumMeasures: mockAdjustNumMeasures as Mock,
    createAudioClip: mockCreateAudioClip as Mock,
    insertClips: mockInsertClips as Mock,
    masterTrack: {} as Track,
    maxPos: new TimelinePosition(),
    numMeasures: 4,
    playheadPos: new TimelinePosition(),
    scrollToItem: null,
    setAllowMenuAndShortcuts: mockSetAllowMenuAndShortcuts as Mock,
    setPlayheadPos: mockSetPlayheadPos as Mock,
    setScrollToItem: mockSetScrollToItem as Mock,
    setSongRegion: mockSetSongRegion as Mock,
    setTracks: mockSetTracks as Mock,
    setVerticalScale: mockSetVerticalScale as Mock,
    snapGridSize: 0,
    songRegion: null,
    timelineSettings: {
      horizontalScale: 1,
      timeSignature: { beats: 4, noteValue: 4 },
      tempo: 120
    },
    tracks: [],
    updateTimelineSettings: mockUpdateTimelineSettings as Mock,
    verticalScale: 1,
    activeTrack: null,
    isPlaying: false,
    setActiveTrack: vi.fn(),
    setIsPlaying: vi.fn(),
    plugins: [],
    registerPlugin: vi.fn(),
    unregisterPlugin: vi.fn(),
    getPlugin: vi.fn(),
    hasPlugin: vi.fn(),
    getPlugins: vi.fn(),
    clearPlugins: vi.fn(),
    mixerHeight: 300,
    setMixerHeight: mockSetMixerHeight as Mock,
    showMixer: true,
    setShowMixer: mockSetShowMixer as Mock,
    storageConnectors: {},
    currentWorkstation: null,
    saveWorkstation: mockSaveWorkstation as Mock,
    loadWorkstation: mockLoadWorkstation as Mock,
    listWorkstations: mockListWorkstations as Mock,
    createNewWorkstation: vi.fn(),
    allowMenuAndShortcuts: true,
    
    // Adding the missing properties
    deleteTrack: vi.fn(),
    duplicateTrack: vi.fn(),
    getTrackCurrentValue: vi.fn(),
    selectedTrackId: null,
    setSelectedTrackId: vi.fn(),
    setTrack: vi.fn(),
    showMaster: true,
    
    // Metronome properties
    metronome: false,
    setMetronome: vi.fn(),
    
    // Timeline properties
    autoGridSize: 16,
    showTimeRuler: true,
    snapGridSizeOption: 'quarter',
  };

  // Test that the context hook throws an error when used outside of a context provider
  it('should throw an error when useWorkstation is used outside of a provider', () => {
    // We're using renderHook to test our hook
    // We expect it to throw an error since there's no provider
    expect(() => renderHook(() => useWorkstation())).toThrow('useWorkstation must be used within a WorkstationProvider');
  });

  // Test that the context hook returns the context value when used inside a context provider
  it('should return the context value when useWorkstation is used inside a provider', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <WorkstationContext.Provider value={mockContextValue}>
        {children}
      </WorkstationContext.Provider>
    );

    // Using renderHook with a wrapper that includes our provider
    const { result } = renderHook(() => useWorkstation(), { wrapper });

    // Now we can check that our hook returns the mock context value
    expect(result.current).toBe(mockContextValue);
  });

  // Test a component that consumes the context
  it('should render a component consuming WorkstationContext', () => {
    // Create a test component that uses the context
    const TestComponent = () => {
      const { isPlaying } = useWorkstation();
      return <div>{isPlaying ? 'Playing' : 'Not Playing'}</div>;
    };

    // Render the test component with the provider
    const { getByText } = render(
      <WorkstationContext.Provider value={mockContextValue}>
        <TestComponent />
      </WorkstationContext.Provider>
    );

    // Assert that text from our component is in the document
    expect(getByText('Not Playing')).toBeInTheDocument();
  });
});
