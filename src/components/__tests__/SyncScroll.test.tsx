import React from "react";
import { render, fireEvent, screen } from "@testing-library/react";
import { vi } from "vitest";
import { SyncScroll } from "../SyncScroll";

describe("SyncScroll", () => {
  let originalResizeObserver: typeof ResizeObserver;

  beforeAll(() => {
    originalResizeObserver = window.ResizeObserver;
  });

  afterAll(() => {
    window.ResizeObserver = originalResizeObserver;
  });

  const TestPanes = () => (
    <SyncScroll>
      <div style={{ display: "flex", height: "200px" }}>
        <div id="pane1" style={{ width: "200px", overflow: "auto" }}>
          <div style={{ height: "400px", width: "400px" }}>
            Scrollable Content 1
          </div>
        </div>
        <div id="pane2" style={{ width: "200px", overflow: "auto" }}>
          <div style={{ height: "400px", width: "400px" }}>
            Scrollable Content 2
          </div>
        </div>
      </div>
    </SyncScroll>
  );

  it("renders panes without crashing", () => {
    render(<TestPanes />);
    expect(screen.getByText("Scrollable Content 1")).toBeInTheDocument();
    expect(screen.getByText("Scrollable Content 2")).toBeInTheDocument();
  });

  it("synchronizes scroll between panes", async () => {
    const { container } = render(<TestPanes />);
    const pane1 = container.querySelector("#pane1");
    const pane2 = container.querySelector("#pane2");

    expect(pane1).toBeTruthy();
    expect(pane2).toBeTruthy();

    if (pane1) {
      // Set scroll position
      pane1.scrollTop = 100;
      pane1.scrollLeft = 50;

      // Trigger scroll event
      fireEvent.scroll(pane1);

      // Wait for next frame to allow scroll sync
      await new Promise((resolve) => requestAnimationFrame(resolve));

      expect(pane2?.scrollTop).toBe(100);
      expect(pane2?.scrollLeft).toBe(50);
    }
  });

  it("handles scroll synchronization on content resize", async () => {
    const { container } = render(<TestPanes />);
    const pane1 = container.querySelector("#pane1");
    const pane2 = container.querySelector("#pane2");

    if (pane1 && pane2) {
      // Set initial scroll position
      pane1.scrollTop = 50;
      fireEvent.scroll(pane1);

      // Wait for next frame
      await new Promise((resolve) => requestAnimationFrame(resolve));

      expect(pane2.scrollTop).toBe(50);

      // Simulate content resize by changing content height
      const content = pane1.firstElementChild as HTMLElement;
      if (content) {
        content.style.height = "600px";

        // Trigger a ResizeObserver callback
        const resizeObserver = new ResizeObserver(() => {});
        resizeObserver.observe(content);

        // Wait for next frame
        await new Promise((resolve) => requestAnimationFrame(resolve));

        // Verify scroll position is maintained
        expect(pane2.scrollTop).toBe(50);
      }
    }
  });

  it("cleans up scroll listeners on unmount", () => {
    // Create a mock ResizeObserver with all required methods
    const mockDisconnect = vi.fn();
    const mockObserve = vi.fn();
    const mockUnobserve = vi.fn();

    class MockResizeObserver {
      constructor(_callback: ResizeObserverCallback) {
        // Constructor intentionally empty
      }
      observe = mockObserve;
      unobserve = mockUnobserve;
      disconnect = mockDisconnect;
    }

    // @ts-ignore - Stub the global ResizeObserver
    window.ResizeObserver = MockResizeObserver;

    const { unmount, container } = render(<TestPanes />);
    const pane1 = container.querySelector("#pane1") as HTMLElement;

    // Verify that observers are set up
    expect(mockObserve).toHaveBeenCalled();

    // Store original event listeners
    const addedScrollListeners = new Set<EventListener>();
    const originalAddEventListener = pane1.addEventListener;
    const originalRemoveEventListener = pane1.removeEventListener;

    // Mock addEventListener to track scroll listeners
    pane1.addEventListener = vi.fn((type: string, listener: EventListener) => {
      if (type === "scroll") {
        addedScrollListeners.add(listener);
      }
      originalAddEventListener.call(pane1, type, listener);
    });

    // Mock removeEventListener to track removal
    pane1.removeEventListener = vi.fn(
      (type: string, listener: EventListener) => {
        if (type === "scroll") {
          addedScrollListeners.delete(listener);
        }
        originalRemoveEventListener.call(pane1, type, listener);
      }
    );

    // Verify initial scroll listeners were added
    expect(addedScrollListeners.size).toBeGreaterThan(0);

    // Unmount the component
    unmount();

    // After unmount:
    // 1. All scroll listeners should be removed
    expect(addedScrollListeners.size).toBe(0);

    // 2. ResizeObserver should be cleaned up
    expect(mockDisconnect).toHaveBeenCalled();
    expect(mockUnobserve).toHaveBeenCalled();

    // Restore original event listener methods
    pane1.addEventListener = originalAddEventListener;
    pane1.removeEventListener = originalRemoveEventListener;
  });
});
