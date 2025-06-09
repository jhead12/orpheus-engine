import { renderHook, act } from "@testing-library/react";
import useHoldAction from "../useHoldAction";

describe("useHoldAction", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it("triggers callback on hold", () => {
    const mockCallback = jest.fn();
    const { result } = renderHook(() =>
      useHoldAction({
        onHoldAction: mockCallback,
        delay: 100
      })
    );

    act(() => {
      result.current.startHold();
    });

    // Fast-forward time to simulate hold
    jest.advanceTimersByTime(150);

    expect(mockCallback).toHaveBeenCalled();
  });

  it("calls callback repeatedly at specified intervals during hold", () => {
    const mockCallback = jest.fn();
    const { result } = renderHook(() =>
      useHoldAction({
        onHoldAction: mockCallback,
        delay: 100,
        interval: 50,
        holdActionOnMouseDown: false // Important - disable initial call
      })
    );

    // Start the hold action
    act(() => {
      result.current.startHold();
    });

    // Test the timing pattern:
    // 1. No callbacks initially (holdActionOnMouseDown: false)
    expect(mockCallback).not.toHaveBeenCalled();

    // 2. First call at the delay time
    jest.advanceTimersByTime(100);
    expect(mockCallback).toHaveBeenCalledTimes(1);

    // 3. Second call after one interval
    jest.advanceTimersByTime(50);
    expect(mockCallback).toHaveBeenCalledTimes(2);

    // 4. Third call after another interval
    jest.advanceTimersByTime(50);
    expect(mockCallback).toHaveBeenCalledTimes(3);
  });

  it("triggers callback immediately when holdActionOnMouseDown is true", () => {
    const mockCallback = jest.fn();
    const { result } = renderHook(() =>
      useHoldAction({
        onHoldAction: mockCallback,
        delay: 100,
        holdActionOnMouseDown: true
      })
    );

    act(() => {
      result.current.startHold();
    });

    // Callback should be triggered immediately without any time advancement
    expect(mockCallback).toHaveBeenCalledTimes(1);
  });

  it("stops calling the callback after endHold is called", () => {
    const mockCallback = jest.fn();
    const { result } = renderHook(() =>
      useHoldAction({
        onHoldAction: mockCallback,
        delay: 100,
        interval: 50,
        holdActionOnMouseDown: false
      })
    );

    act(() => {
      result.current.startHold();
    });

    // Advance to first call
    jest.advanceTimersByTime(100);
    expect(mockCallback).toHaveBeenCalledTimes(1);

    // Stop the hold action
    act(() => {
      result.current.endHold();
    });

    // Advance time - should not trigger more calls
    jest.advanceTimersByTime(200);
    expect(mockCallback).toHaveBeenCalledTimes(1); // Still only one call
  });

  it("checks interval timing with timestamps", () => {
    // Create a spy on Date.now to track call timing
    const mockCallback = jest.fn();
    let currentTime = 0;
    jest.spyOn(Date, 'now').mockImplementation(() => currentTime);
    
    const { result } = renderHook(() =>
      useHoldAction({
        onHoldAction: mockCallback,
        delay: 100,
        interval: 50,
        holdActionOnMouseDown: false
      })
    );

    act(() => {
      result.current.startHold();
    });

    // Advance to delay time
    currentTime += 100;
    jest.advanceTimersByTime(100);
    expect(mockCallback).toHaveBeenCalledTimes(1);
    
    // Advance to one interval
    currentTime += 50;
    jest.advanceTimersByTime(50);
    expect(mockCallback).toHaveBeenCalledTimes(2);
  });
});
