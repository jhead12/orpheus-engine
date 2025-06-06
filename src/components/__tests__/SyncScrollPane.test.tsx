import React from "react";
import { render, fireEvent, screen } from "@testing-library/react";
import SyncScrollPane from "../SyncScrollPane";
import { SyncScroll } from "../SyncScroll";

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
    const panes = container.querySelectorAll(
      '[data-testid^="sync-scroll-pane"]'
    ) as NodeListOf<HTMLElement>;

    // Set scroll position of first pane
    const firstPane = panes[0];
    firstPane.scrollTop = 100;
    firstPane.scrollLeft = 100;

    // Trigger scroll event
    fireEvent.scroll(firstPane);

    // Wait for next frame to let scroll sync happen
    await new Promise((resolve) => requestAnimationFrame(resolve));

    // Check that second pane scrolled to same position
    const secondPane = panes[1];
    expect(secondPane.scrollTop).toBe(100);
    expect(secondPane.scrollLeft).toBe(100);
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
    render(
      <SyncScrollPane
        id="test"
        style={{
          backgroundColor: "red",
          margin: "10px",
          padding: "15px",
        }}
      >
        <div>Content</div>
      </SyncScrollPane>
    );

    const pane = screen.getByTestId("sync-scroll-pane-test");

    // Check that both our custom styles and default styles are applied
    expect(pane).toHaveStyle({
      backgroundColor: "red",
      margin: "10px",
      padding: "15px",
      overflowX: "auto",
      overflowY: "hidden",
    });
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
