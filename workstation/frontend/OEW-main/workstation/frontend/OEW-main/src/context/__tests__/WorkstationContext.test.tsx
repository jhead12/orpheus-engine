import React from "react";
import { render, renderHook } from "@testing-library/react";
import { Mock, describe, expect, it, vi } from "vitest";
import WorkstationContext, { useWorkstation } from "../WorkstationContext";
import { TimelinePosition, Track } from "../../types/core";

describe("WorkstationContext", () => {
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
  const mockContextValue = {
    addTrack: mockAddTrack,
    adjustNumMeasures: mockAdjustNumMeasures,
    createAudioClip: mockCreateAudioClip,
    insertClips: mockInsertClips,
    masterTrack: {} as Track,
    maxPos: new TimelinePosition(),
    numMeasures: 4,
    playheadPos: new TimelinePosition(),
    scrollToItem: null,
    setAllowMenuAndShortcuts: mockSetAllowMenuAndShortcuts,
    setPlayheadPos: mockSetPlayheadPos,
    setScrollToItem: mockSetScrollToItem,
    setSongRegion: mockSetSongRegion,
    setTracks: mockSetTracks,
    setVerticalScale: mockSetVerticalScale,
    snapGridSize: 0,
    songRegion: null,
    timelineSettings: {
      horizontalScale: 1,
      timeSignature: { beats: 4, noteValue: 4 },
      tempo: 120,
    },
    tracks: [],
    updateTimelineSettings: mockUpdateTimelineSettings,
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
    setMixerHeight: mockSetMixerHeight,
    showMixer: true,
    setShowMixer: mockSetShowMixer,
    storageConnectors: {},
    currentWorkstation: null,
    saveWorkstation: mockSaveWorkstation,
    loadWorkstation: mockLoadWorkstation,
    listWorkstations: mockListWorkstations,
    createNewWorkstation: vi.fn(),
    allowMenuAndShortcuts: true,
    deleteTrack: vi.fn(),
    duplicateTrack: vi.fn(),
    getTrackCurrentValue: vi.fn(),
    selectedTrackId: null,
    setSelectedTrackId: vi.fn(),
    setTrack: vi.fn(),
    showMaster: true,
    metronome: false,
    setMetronome: vi.fn(),
    showTimeRuler: true,
    snapGridSizeOption: "quarter",
    autoGridSize: 16,
  };

  // Test that the context hook throws an error when used outside of a context provider
  it("should throw an error when useWorkstation is used outside of a provider", () => {
    expect(() => {
      renderHook(() => useWorkstation());
    }).toThrow("useWorkstation must be used within a WorkstationProvider");
  });

  // Test that the context values are accessible when used with a provider
  it("should provide context values when used with provider", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <WorkstationContext.Provider value={mockContextValue}>
        {children}
      </WorkstationContext.Provider>
    );

    const { result } = renderHook(() => useWorkstation(), { wrapper });
    expect(result.current).toBeDefined();
    expect(result.current.addTrack).toBe(mockAddTrack);
    expect(result.current.insertClips).toBe(mockInsertClips);
  });

  // Test specific functionality
  it("should call addTrack when triggered", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <WorkstationContext.Provider value={mockContextValue}>
        {children}
      </WorkstationContext.Provider>
    );

    const { result } = renderHook(() => useWorkstation(), { wrapper });
    result.current.addTrack("audio");
    expect(mockAddTrack).toHaveBeenCalledWith("audio");
  });
});
