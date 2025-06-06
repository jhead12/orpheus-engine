import { renderHook, act } from "@testing-library/react";
import useHoldAction from "../hooks/useHoldAction";

describe("useHoldAction", () => {
  it("triggers callback on hold", () => {
    const mockCallback = jest.fn();
    const { result } = renderHook(() =>
      useHoldAction(mockCallback, { delay: 100 })
    );

    act(() => {
      result.current.onMouseDown();
    });

    // Fast-forward time to simulate hold
    jest.advanceTimersByTime(150);

    expect(mockCallback).toHaveBeenCalled();
  });
});
