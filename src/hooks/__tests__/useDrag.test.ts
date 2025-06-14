import { act } from "@testing-library/react";
import { renderHook } from "../../test/test-utils";
import { vi } from "vitest";
import useDrag from "../useDrag";

describe("useDrag", () => {
  it("initializes with default state", () => {
    const { result } = renderHook(() => useDrag());
    expect(result.current.isDragging).toBeFalsy();
    expect(result.current.dragDelta).toEqual({ x: 0, y: 0 });
  });

  it("handles mouse down event", () => {
    const onDragStart = vi.fn();
    const { result } = renderHook(() => useDrag({ onDragStart }));

    act(() => {
      // Simulate left click
      result.current.handleMouseDown({
        button: 0,
        clientX: 100,
        clientY: 100,
      } as MouseEvent);
    });

    expect(onDragStart).toHaveBeenCalled();
  });

  it("updates state during drag", () => {
    const onDragMove = vi.fn();
    const { result } = renderHook(() => useDrag({ onDragMove }));

    // Start drag
    act(() => {
      result.current.handleMouseDown({
        button: 0,
        clientX: 100,
        clientY: 100,
      } as MouseEvent);
    });

    // Move mouse
    act(() => {
      const moveEvent = new MouseEvent("mousemove", {
        clientX: 150,
        clientY: 150,
      });
      document.dispatchEvent(moveEvent);
    });

    expect(onDragMove).toHaveBeenCalledWith(expect.any(MouseEvent), {
      x: 50,
      y: 50,
    });
  });

  it("cleans up on unmount", () => {
    const { unmount } = renderHook(() => useDrag());
    const removeEventListenerSpy = vi.spyOn(document, "removeEventListener");

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "mousemove",
      expect.any(Function)
    );
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "mouseup",
      expect.any(Function)
    );
  });
});
