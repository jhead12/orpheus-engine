import { vi } from "vitest";

// Mock core types including TimelinePosition
vi.mock("@orpheus/types/core", () => {
  const mockTimeline = {
    ticks: 0,
    compareTo: vi.fn().mockReturnValue(0),
    toMargin: vi.fn().mockReturnValue(0),
    copy: vi.fn().mockReturnThis(),
    equals: vi.fn().mockReturnValue(true),
    diff: vi.fn().mockReturnThis(),
  };

  const MockTimelinePosition = vi.fn().mockImplementation(() => mockTimeline);
  MockTimelinePosition.parseFromString = vi.fn().mockImplementation((str) => {
    if (!str) return null;
    return mockTimeline;
  });
  MockTimelinePosition.start = mockTimeline;

  return {
    TrackType: { Audio: "audio" },
    AutomationMode: { Off: "off", Read: "read" },
    AutomationLaneEnvelope: { Volume: "volume" },
    TimelinePosition: MockTimelinePosition,
  };
});
