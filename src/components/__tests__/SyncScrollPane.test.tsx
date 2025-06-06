import React from "react";
import { render, fireEvent, screen } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { SyncScroll } from "../SyncScroll";
import SyncScrollPane from "../SyncScrollPane";

describe("SyncScrollPane", () => {
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

  it("maintains scroll synchronization between panes", async () => {
    const { container } = render(<TestComponent />);

    const pane1 = container.querySelector(
      '[data-testid="sync-scroll-pane-pane1"]'
    );
    const pane2 = container.querySelector(
      '[data-testid="sync-scroll-pane-pane2"]'
    );

    expect(pane1).toBeTruthy();
    expect(pane2).toBeTruthy();

    if (pane1 && pane2) {
      // Mock scroll methods for both panes
      const scrollFn1 = vi.fn();
      const scrollFn2 = vi.fn();

      Object.defineProperties(pane1, {
        scrollWidth: { value: 1000, configurable: true },
        clientWidth: { value: 500, configurable: true },
        scrollHeight: { value: 1000, configurable: true },
        clientHeight: { value: 500, configurable: true },
        scrollLeft: {
          get: () => 100,
          configurable: true,
        },
        scrollTop: {
          get: () => 100,
          configurable: true,
        },
        onscroll: {
          get: () => scrollFn1,
          set: () => {},
          configurable: true,
        },
      });

      Object.defineProperties(pane2, {
        scrollWidth: { value: 1000, configurable: true },
        clientWidth: { value: 500, configurable: true },
        scrollHeight: { value: 1000, configurable: true },
        clientHeight: { value: 500, configurable: true },
        scrollLeft: { value: 0, writable: true, configurable: true },
        scrollTop: { value: 0, writable: true, configurable: true },
        scrollTo: {
          value: scrollFn2,
          configurable: true,
          writable: true,
        },
      });

      // Wait for registration
      await new Promise((resolve) => setTimeout(resolve, 0));

      // Trigger scroll event
      const scrollEvent = new Event("scroll", {
        bubbles: true,
        cancelable: true,
      });

      pane1.dispatchEvent(scrollEvent);

      // Wait for sync to process
      await vi.waitFor(
        () => {
          expect(scrollFn2).toHaveBeenCalledWith({
            top: 100,
            left: 100,
            behavior: undefined,
          });
        },
        { timeout: 1000 }
      );
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
