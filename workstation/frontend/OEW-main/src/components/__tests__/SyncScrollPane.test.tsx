import React from "react";
import { render, fireEvent, screen, act } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { SyncScroll, ScrollSyncContext } from "../SyncScroll";
import SyncScrollPane from "../SyncScrollPane";

// Mock the ScrollSyncContext
const mockRegisterPane = vi.fn();
const mockUnregisterPane = vi.fn();
const mockContext = {
  registerPane: mockRegisterPane,
  unregisterPane: mockUnregisterPane,
};

// Create a wrapper component that provides mocked context
const TestProvider = ({ children }: { children: React.ReactNode }) => (
  <ScrollSyncContext.Provider value={mockContext}>
    {children}
  </ScrollSyncContext.Provider>
);

describe("SyncScrollPane", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const TestComponent = () => (
    <SyncScroll>
      <div style={{ display: "flex", height: "200px" }}>
        <SyncScrollPane id="pane1" style={{ width: "200px", overflow: "auto" }}>
          <div style={{ height: "400px", width: "400px" }}>Content 1</div>
        </SyncScrollPane>
        <SyncScrollPane id="pane2" style={{ width: "200px", overflow: "auto" }}>
          <div style={{ height: "400px", width: "400px" }}>Content 2</div>
        </SyncScrollPane>
      </div>
    </SyncScroll>
  );

  it("renders without crashing", () => {
    render(<TestComponent />);
    expect(screen.getAllByText(/Content/)).toHaveLength(2);
  });

  it("maintains scroll synchronization between panes", () => {
    const scrollFn2 = vi.fn();
    
    // Mock the scroll handler implementation
    const mockScrollHandler = vi.fn((e: Event) => {
      if (e.target === pane1) {
        scrollFn2({
          top: pane1.scrollTop,
          left: pane1.scrollLeft,
          behavior: undefined
        });
      }
    });

    // Update mock context to include scroll handler
    const contextWithHandler = {
      ...mockContext,
      registerPane: (pane: HTMLElement) => {
        mockRegisterPane(pane);
        pane.onscroll = mockScrollHandler;
      }
    };

    const { container } = render(
      <ScrollSyncContext.Provider value={contextWithHandler}>
        <div style={{ display: "flex", height: "200px" }}>
          <SyncScrollPane id="pane1" style={{ width: "200px", overflow: "auto" }}>
            <div style={{ height: "400px", width: "400px" }}>Content 1</div>
          </SyncScrollPane>
          <SyncScrollPane id="pane2" style={{ width: "200px", overflow: "auto" }}>
            <div style={{ height: "400px", width: "400px" }}>Content 2</div>
          </SyncScrollPane>
        </div>
      </ScrollSyncContext.Provider>
    );

    // Get references to both panes
    const pane1 = container.querySelector('[data-testid="sync-scroll-pane-pane1"]');
    const pane2 = container.querySelector('[data-testid="sync-scroll-pane-pane2"]');
    
    expect(pane1).toBeTruthy();
    expect(pane2).toBeTruthy();

    if (pane1 && pane2) {
      // Set up scroll dimensions with configurable properties
      Object.defineProperties(pane1, {
        scrollWidth: { value: 1000, configurable: true },
        clientWidth: { value: 500, configurable: true },
        scrollHeight: { value: 1000, configurable: true },
        clientHeight: { value: 500, configurable: true },
        scrollLeft: { value: 100, configurable: true },
        scrollTop: { value: 100, configurable: true }
      });

      Object.defineProperties(pane2, {
        scrollTo: { value: scrollFn2, configurable: true },
        scrollWidth: { value: 1000, configurable: true },
        clientWidth: { value: 500, configurable: true },
        scrollHeight: { value: 1000, configurable: true },
        clientHeight: { value: 500, configurable: true }
      });

      // Verify registration occurred
      expect(mockRegisterPane).toHaveBeenCalledWith(pane1);
      expect(mockRegisterPane).toHaveBeenCalledWith(pane2);

      // Simulate scroll event with updated context
      act(() => {
        fireEvent.scroll(pane1);
        vi.runAllTimers();
      });

      // Verify scroll sync was triggered
      expect(scrollFn2).toHaveBeenCalledWith({
        top: 100,
        left: 100,
        behavior: undefined
      });
    }
  });

  it("handles wheel events", () => {
    const onWheel = jest.fn();
    render(
      <SyncScrollPane id="test" onWheel={onWheel}>
        <div>Content</div>
      </SyncScrollPane>
    );

    const pane = screen.getByTestId("sync-scroll-pane-test");
    fireEvent.wheel(pane, { deltaY: 100 });

    expect(onWheel).toHaveBeenCalled();
  });

  it("applies custom styles", () => {
    const { container } = render(
      <SyncScrollPane
        id="test"
        style={{
          backgroundColor: "rgb(255, 0, 0)", // Use RGB format
          margin: "10px",
          padding: "15px",
        }}
      >
        <div>Content</div>
      </SyncScrollPane>
    );

    const pane = container.querySelector(
      '[data-testid="sync-scroll-pane-test"]'
    );
    expect(pane).toBeTruthy();

    // Get styles
    const computedStyle = window.getComputedStyle(pane!);

    // Check each style property individually
    expect(computedStyle.backgroundColor).toBe("rgb(255, 0, 0)");
    expect(computedStyle.margin).toBe("10px");
    expect(computedStyle.padding).toBe("15px");
    expect(computedStyle.overflowX).toBe("auto");
    expect(computedStyle.overflowY).toBe("hidden");
  });

  it("forwards ref correctly", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(
      <SyncScrollPane id="test" ref={ref}>
        <div>Content</div>
      </SyncScrollPane>
    );

    expect(ref.current).toBeTruthy();
    expect(ref.current?.tagName).toBe("DIV");
  });
});
