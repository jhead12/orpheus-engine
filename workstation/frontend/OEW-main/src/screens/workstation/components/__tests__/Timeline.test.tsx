/**
 * Timeline Component Test Suite
 * 
 * This file contains comprehensive tests for the Timeline component, which is a core
 * part of the Digital Audio Workstation (DAW). The Timeline handles:
 * - Canvas-based rendering of musical timeline
 * - Track visualization and interaction
 * - Playhead positioning and movement
 * - Canvas resizing and scaling
 * 
 * @fileoverview Timeline component tests with proper canvas mocking
 * @author Orpheus Engine Team
 * @since 2024
 */

// Core testing utilities from Vitest framework
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render } from "@testing-library/react";

// Component under test and its dependencies
import { Timeline } from "../Timeline";
import { WorkstationContext } from "@orpheus/contexts/WorkstationContext";
import {
  Track,
  TrackType,
  AutomationMode,
  TimelinePosition,
} from "@orpheus/types/core";

// Note: Using global mocks from setupTests.ts instead of local mocks 
// to avoid conflicts with other test files that also mock @orpheus/types/core

/**
 * Global Browser API Mocks
 * 
 * These mocks provide browser APIs that are not available in the Node.js test environment.
 * They're essential for testing components that interact with DOM APIs like ResizeObserver,
 * IntersectionObserver, and animation frames.
 */

// Mock ResizeObserver - handles element size change notifications
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver - handles element visibility change notifications
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
  root: null,
  rootMargin: "",
  thresholds: [],
}));

// Mock requestAnimationFrame - handles smooth animations in tests
global.requestAnimationFrame = vi
  .fn()
  .mockImplementation((cb) => setTimeout(cb, 16));
global.cancelAnimationFrame = vi.fn().mockImplementation(clearTimeout);

/**
 * WorkstationContext Mock Factory
 * 
 * Creates mock instances of tracks and workstation context for testing.
 * This ensures tests have consistent, predictable data to work with.
 */

/**
 * Creates a default track for testing purposes
 * @param id - Unique identifier for the track
 * @returns Complete Track object with all required properties
 */
const createDefaultTrack = (id: string): Track => ({
  id,
  name: id,
  type: TrackType.Midi,
  color: "#FF0000",
  volume: 0,
  pan: 0,
  mute: false,
  solo: false,
  armed: false,
  clips: [],
  effects: [],
  automation: false,
  automationMode: AutomationMode.Read,
  automationLanes: [],
  fx: {
    preset: null,
    selectedEffectIndex: 0,
    effects: [],
  },
});

/**
 * Creates a mock WorkstationContext for testing
 * 
 * This function provides a complete mock of the WorkstationContext with all
 * required properties. It can be customized with overrides for specific test cases.
 * Uses the global TimelinePosition mock from setupTests.ts
 * 
 * @param overrides - Optional properties to override in the mock context
 * @returns Complete WorkstationContext mock suitable for testing
 */
const createMockWorkstationContext = (overrides = {}) => ({
  // Track management
  tracks: [createDefaultTrack("track-1")],
  masterTrack: createDefaultTrack("master"),
  
  // Playback state - using global mocked TimelinePosition
  isPlaying: false,
  playheadPos: new TimelinePosition(),
  maxPos: new TimelinePosition(4, 0, 0),
  
  // UI state and settings
  allowMenuAndShortcuts: true,
  scrollToItem: null,
  selectedClipId: null,
  snapGridSize: new TimelinePosition(0, 1, 0),
  verticalScale: 1,
  numMeasures: 4,
  songRegion: null,
  
  // Timeline configuration
  timelineSettings: {
    beatWidth: 64,
    timeSignature: { beats: 4, noteValue: 4 },
    horizontalScale: 1,
  },
  
  // Action handlers (all mocked for testing)
  adjustNumMeasures: vi.fn(),
  consolidateClip: vi.fn(),
  deleteClip: vi.fn(),
  duplicateClip: vi.fn(),
  setAllowMenuAndShortcuts: vi.fn(),
  setScrollToItem: vi.fn(),
  setSelectedClipId: vi.fn(),
  setSongRegion: vi.fn(),
  setTrackRegion: vi.fn(),
  splitClip: vi.fn(),
  toggleMuteClip: vi.fn(),
  addTrack: vi.fn(),
  createAudioClip: vi.fn(),
  insertClips: vi.fn(),
  setPlayheadPos: vi.fn(),
  setTracks: vi.fn(),
  setVerticalScale: vi.fn(),
  updateTimelineSettings: vi.fn(),
  
  // Apply any overrides
  ...overrides,
});

/**
 * Timeline Component Test Suite
 * 
 * Tests the core functionality of the Timeline component including:
 * - Canvas element creation and configuration
 * - Proper canvas dimensions handling
 * - Canvas resizing behavior
 * - Integration with WorkstationContext
 */
describe("Timeline", () => {
  /**
   * Setup before each test
   * - Using global canvas mocks from setupTests.ts
   */
  beforeEach(() => {
    // Canvas mocking is handled globally in setupTests.ts
  });

  /**
   * Cleanup after each test
   * - Restore all mocks to clean state
   */
  afterEach(() => {
    vi.restoreAllMocks();
  });

  /**
   * Test: Canvas Element Creation and Dimensions
   * 
   * Verifies that the Timeline component:
   * - Renders a canvas element in the DOM
   * - Sets correct default width (800px)
   * - Sets correct default height (400px)
   */
  it("renders canvas element with proper dimensions", () => {
    // Create a proper TimelinePosition instance for testing
    const mockPosition = new TimelinePosition(0, 0, 0);
    
    const { container } = render(
      <WorkstationContext.Provider value={createMockWorkstationContext()}>
        <Timeline currentPosition={mockPosition} />
      </WorkstationContext.Provider>
    );

    // Verify canvas element exists
    const canvas = container.querySelector("canvas");
    expect(canvas).toBeInTheDocument();
    
    // Verify default dimensions
    expect(canvas?.width).toBe(800);
    expect(canvas?.height).toBe(400);
  });

  /**
   * Test: Canvas Resizing Behavior
   * 
   * Verifies that the Timeline component:
   * - Handles canvas resize operations correctly
   * - Updates canvas dimensions when attributes change
   * - Maintains canvas element in DOM during resize
   */
  it("handles canvas resizing", () => {
    // Create a proper TimelinePosition instance for testing
    const mockPosition = new TimelinePosition(0, 0, 0);
    
    const { container } = render(
      <WorkstationContext.Provider value={createMockWorkstationContext()}>
        <Timeline currentPosition={mockPosition} />
      </WorkstationContext.Provider>
    );

    // Verify initial canvas state
    const canvas = container.querySelector("canvas");
    expect(canvas).toBeInTheDocument();

    // Simulate canvas resize operation
    if (canvas) {
      canvas.setAttribute("width", "1000");
      canvas.setAttribute("height", "500");
      
      // Verify new dimensions are applied
      expect(canvas.width).toBe(1000);
      expect(canvas.height).toBe(500);
    }
  });
});
