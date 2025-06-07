import { vi } from "vitest";

// Mock core types including TimelinePosition
vi.mock("@orpheus/types/core", () => {
  const mockTimeline = {
    ticks: 0,
    bar: 0,
    beat: 0,
    tick: 0,
    compareTo: vi.fn().mockReturnValue(0),
    toMargin: vi.fn().mockReturnValue(0),
    toTicks: vi.fn().mockReturnValue(0),
    toSeconds: vi.fn().mockReturnValue(0),
    copy: vi.fn().mockReturnThis(),
    equals: vi.fn().mockReturnValue(true),
    diff: vi.fn().mockReturnThis(),
    add: vi.fn().mockReturnThis(),
    snap: vi.fn().mockReturnThis(),
    translate: vi.fn().mockReturnThis(),
    diffInMargin: vi.fn().mockReturnValue(0),
  };

  const MockTimelinePosition = vi.fn().mockImplementation(() => mockTimeline);
  
  // Add static methods to the mock constructor
  Object.assign(MockTimelinePosition, {
    parseFromString: vi.fn().mockImplementation((str) => {
      if (!str) return null;
      return mockTimeline;
    }),
    fromSpan: vi.fn().mockReturnValue(mockTimeline),
    fromTicks: vi.fn().mockReturnValue(mockTimeline),
    fromSixteenths: vi.fn().mockReturnValue(mockTimeline),
    fromSeconds: vi.fn().mockReturnValue(mockTimeline),
    fromMargin: vi.fn().mockReturnValue(mockTimeline),
    add: vi.fn().mockReturnValue(mockTimeline),
    subtract: vi.fn().mockReturnValue(mockTimeline),
    compare: vi.fn().mockReturnValue(0),
    max: vi.fn().mockReturnValue(mockTimeline),
    min: vi.fn().mockReturnValue(mockTimeline),
    start: mockTimeline,
  });

  return {
    TrackType: { Audio: "audio" },
    AutomationMode: { Off: "off", Read: "read" },
    AutomationLaneEnvelope: { Volume: "volume" },
    TimelinePosition: MockTimelinePosition,
  };
});
