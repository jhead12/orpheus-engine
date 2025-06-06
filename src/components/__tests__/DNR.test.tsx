import { render, fireEvent, screen } from "@testing-library/react";
import { vi } from "vitest";
import DNR from "../DNR";

describe("DNR (Drag and Resize) Component", () => {
  const defaultProps = {
    coords: { startX: 100, startY: 100, endX: 300, endY: 300 },
    drag: true,
  };

  beforeEach(() => {
    // Mock element positioning
    vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(
      () => ({
        x: 0,
        y: 0,
        width: 800,
        height: 600,
        top: 0,
        right: 800,
        bottom: 600,
        left: 0,
        toJSON: () => {},
      })
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders without crashing", async () => {
    const { container } = render(
      <DNR {...defaultProps}>
        <div data-testid="dnr-content">Draggable Content</div>
      </DNR>
    );

    const dnrElement = container.querySelector(".dnr-container");
    expect(dnrElement).toBeInTheDocument();
    expect(screen.getByTestId("dnr-content")).toBeInTheDocument();
  });

  it("handles drag operations", () => {
    const onDrag = vi.fn();
    const onDragStart = vi.fn();
    const onDragStop = vi.fn();

    const { container } = render(
      <DNR
        {...defaultProps}
        onDrag={onDrag}
        onDragStart={onDragStart}
        onDragStop={onDragStop}
      >
        <div>Draggable Content</div>
      </DNR>
    );

    const dnrContainer = container.querySelector(".dnr-container")!;

    // Start drag
    fireEvent.mouseDown(dnrContainer, {
      clientX: 100,
      clientY: 100,
      button: 0,
    });
    expect(onDragStart).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        coords: expect.any(Object),
        delta: expect.any(Object),
      })
    );

    // Drag movement
    fireEvent.mouseMove(document, {
      clientX: 150,
      clientY: 150,
      buttons: 1,
    });
    expect(onDrag).toHaveBeenCalledWith(
      expect.objectContaining({
        coords: expect.any(Object),
        delta: expect.any(Object),
      })
    );

    // End drag
    fireEvent.mouseUp(document);
    expect(onDragStop).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        coords: expect.any(Object),
        delta: expect.any(Object),
      })
    );
  });

  it("handles resize operations", () => {
    const onResize = vi.fn();
    const { container } = render(
      <DNR
        {...defaultProps}
        resize={{
          top: true,
          right: true,
          bottom: true,
          left: true,
        }}
        onResize={onResize}
      >
        <div>Resizable Content</div>
      </DNR>
    );

    // Find a resize handle (e.g., bottom-right)
    const resizeHandles = container.getElementsByClassName("dnr-resize-handle");
    expect(resizeHandles.length).toBeGreaterThan(0);
    const resizeHandle = resizeHandles[0];

    // Start resize
    fireEvent.mouseDown(resizeHandle, { clientX: 300, clientY: 300 });

    // Perform resize
    fireEvent.mouseMove(document, { clientX: 350, clientY: 350 });
    expect(onResize).toHaveBeenCalled();

    // End resize
    fireEvent.mouseUp(document);
  });

  it("respects bounds constraints", () => {
    const onDrag = vi.fn();
    const { container } = render(
      <DNR
        {...defaultProps}
        bounds={{ left: 0, top: 0, right: 500, bottom: 500 }}
        onDrag={onDrag}
      >
        <div>Bounded Content</div>
      </DNR>
    );

    const dnrContainer = container.querySelector(".dnr-container")!;

    // Start drag at edge of bounds
    fireEvent.mouseDown(dnrContainer, {
      clientX: 100,
      clientY: 100,
      button: 0,
    });

    // Try to drag beyond bounds
    fireEvent.mouseMove(document, {
      clientX: 600,
      clientY: 600,
      buttons: 1,
    });

    const lastCall = onDrag.mock.calls[onDrag.mock.calls.length - 1][0];

    // Should be constrained within bounds
    expect(lastCall.coords.endX).toBeLessThanOrEqual(500);
    expect(lastCall.coords.endY).toBeLessThanOrEqual(500);
    expect(lastCall.coords.startX).toBeGreaterThanOrEqual(0);
    expect(lastCall.coords.startY).toBeGreaterThanOrEqual(0);

    fireEvent.mouseUp(document);
  });

  it("applies min/max size constraints during resize", () => {
    const onResize = vi.fn();
    const { container } = render(
      <DNR
        {...defaultProps}
        resize={true}
        minWidth={100}
        maxWidth={300}
        minHeight={100}
        maxHeight={300}
        onResize={onResize}
      >
        <div>Constrained Content</div>
      </DNR>
    );

    const resizeHandle = container.querySelector(".dnr-resize-handle")!;

    // Start resize
    fireEvent.mouseDown(resizeHandle, {
      clientX: 300,
      clientY: 300,
      button: 0,
    });

    // Try to resize beyond max constraints
    fireEvent.mouseMove(document, {
      clientX: 500,
      clientY: 500,
      buttons: 1,
    });

    const lastCall = onResize.mock.calls[onResize.mock.calls.length - 1][0];

    // Verify size is constrained
    expect(lastCall.width).toBeLessThanOrEqual(300);
    expect(lastCall.height).toBeLessThanOrEqual(300);

    fireEvent.mouseUp(document);
  });
});
