import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { debounce, clamp, isMacOS, openContextMenu } from "../editor-utils";

// Mock electron
const mockIpcRenderer = {
  send: vi.fn(),
};

vi.stubGlobal("electron", {
  ipcRenderer: mockIpcRenderer,
});

describe("Editor Utilities", () => {
  describe("debounce", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("delays execution of function", () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn();
      expect(mockFn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(50);
      expect(mockFn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(50);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it("cancels previous execution when called multiple times", () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn();
      debouncedFn();
      debouncedFn();

      vi.advanceTimersByTime(99);
      expect(mockFn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(1);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });
  });

  describe("clamp", () => {
    it("clamps values within range", () => {
      expect(clamp(5, 0, 10)).toBe(5);
      expect(clamp(-5, 0, 10)).toBe(0);
      expect(clamp(15, 0, 10)).toBe(10);
    });
  });

  describe("isMacOS", () => {
    const originalPlatform = navigator.platform;

    afterEach(() => {
      Object.defineProperty(navigator, "platform", {
        value: originalPlatform,
        configurable: true,
      });
    });

    it("detects macOS platforms", () => {
      Object.defineProperty(navigator, "platform", {
        value: "MacIntel",
        configurable: true,
      });
      expect(isMacOS()).toBe(true);
    });

    it("detects non-macOS platforms", () => {
      Object.defineProperty(navigator, "platform", {
        value: "Win32",
        configurable: true,
      });
      expect(isMacOS()).toBe(false);
    });
  });

  describe("openContextMenu", () => {
    it("sends correct IPC message to show context menu", () => {
      const callback = vi.fn();
      const type = "test-menu";
      const params = { action: "test" };

      openContextMenu(type, params, callback);

      expect(mockIpcRenderer.send).toHaveBeenCalledWith("show-context-menu", {
        type,
        ...params,
        callback: expect.any(Function),
      });
    });
  });
});
