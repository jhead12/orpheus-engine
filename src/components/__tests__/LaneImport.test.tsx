import { describe, it, expect, vi } from "vitest";
import React from "react";
import type { Clip } from "../../types/core";

// Mock the required contexts
vi.mock("../../contexts/WorkstationContext", () => ({
  WorkstationContext: {
    Provider: ({ children }: { children: React.ReactNode }) => children,
  },
}));

vi.mock("../../contexts/ClipboardContext", () => ({
  ClipboardContext: {
    Provider: ({ children }: { children: React.ReactNode }) => children,
  },
}));

// Mock TimelinePosition
vi.mock("../../services/types/timeline", () => ({
  TimelinePosition: vi.fn().mockImplementation(() => ({
    ticks: 0,
    toMargin: () => 0,
    fromMargin: () => ({ ticks: 0 }),
    snap: () => ({ ticks: 0 }),
  })),
}));

// Mock electron utils
vi.mock("../../../services/electron/utils", () => ({
  electronAPI: {
    ipcRenderer: {
      invoke: vi.fn(),
    },
  },
  openContextMenu: vi.fn(),
}));

// Mock utility functions
vi.mock("../../../services/utils/utils", () => ({
  BASE_HEIGHT: 100,
  getLaneColor: () => "#000000",
  removeAllClipOverlap: (clips: Clip[]) => clips,
  timelineEditorWindowScrollThresholds: [100, 100],
}));

// Mock CSS variable utils
vi.mock("../../../services/utils/general", () => ({
  getCSSVarValue: () => "#000000",
  normalizeHex: (hex: string) => hex,
}));

// Mock ResizeObserver
window.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Just test if we can import the component
describe("Lane Component Import Test", () => {
  it("should be able to import Lane component", async () => {
    try {
      const Lane = await import("../../screens/workstation/components/Lane");
      expect(Lane.default).toBeDefined();
      // Also verify it's a React component
      expect(typeof Lane.default).toBe("function");
    } catch (error) {
      console.error("Import failed:", error);
      throw error;
    }
  }, 30000); // Increase timeout to 30 seconds for this test
});
