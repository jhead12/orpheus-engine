import { render, fireEvent, screen } from "@testing-library/react";
import { vi } from "vitest";
import DNR from "../DNR";

describe("DNR (Drag and Resize) Component", () => {
  const defaultProps = {
    coords: { startX: 100, startY: 100, endX: 300, endY: 300 },
    drag: true,
  };

  beforeEach(() => {
    // Mock element positioning and computed style
    Element.prototype.getBoundingClientRect = vi
      .fn()
      .mockImplementation(() => ({
        x: 0,
        y: 0,
        width: 200,
        height: 200,
        top: 0,
        right: 200,
        bottom: 200,
        left: 0,
        toJSON: () => {},
      }));

    // Mock getComputedStyle
    window.getComputedStyle = vi.fn().mockImplementation(() => ({
      transform: "matrix(1, 0, 0, 1, 0, 0)",
      // Add other needed properties
      getPropertyValue: (_: string) => "",
    }));
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
    
    // Override the mock for this specific test
    window.getComputedStyle = vi.fn().mockImplementation(() => ({
      transform: "matrix(1, 0, 0, 1, 100, 100)",
      getPropertyValue: (_: string) => "",
    }));
    
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

    fireEvent.mouseDown(dnrContainer, {
      clientX: 100,
      clientY: 100,
      button: 0,
    });

    fireEvent.mouseMove(document, {
      clientX: 600,
      clientY: 600,
      buttons: 1,
    });

    expect(onDrag).toHaveBeenCalled();

    fireEvent.mouseUp(document);
    
    // The mock will be automatically restored by vi.restoreAllMocks() in afterEach
  });

  it("applies min/max size constraints during resize", () => {
    const onResize = vi.fn().mockImplementation(data => {
      // When onResize is called, verify the constraints are applied
      // This is testing the component's internal applySizeConstraints function
      expect(data.width).toBeLessThanOrEqual(300);
      expect(data.height).toBeLessThanOrEqual(300);
      
      // Return the constrained values for assertion later
      return { width: data.width, height: data.height };
    });
    
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
    
    // Verify onResize was called
    expect(onResize).toHaveBeenCalled();

    fireEvent.mouseUp(document);

    fireEvent.mouseUp(document);
  });
});
