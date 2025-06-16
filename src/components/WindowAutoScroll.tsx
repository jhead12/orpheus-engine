import React, { useEffect, useRef, useState, useCallback } from "react";

// Add the missing getScrollParent function
function getScrollParent(element: HTMLElement, direction: "vertical" | "horizontal" = "vertical"): HTMLElement | null {
  const overflowProperty = direction === "horizontal" ? "overflowX" : "overflowY";
  
  const isScrollable = (style: CSSStyleDeclaration) => {
    const overflow = style[overflowProperty as keyof CSSStyleDeclaration];
    return overflow === 'auto' || overflow === 'scroll';
  };

  let style = window.getComputedStyle(element);
  let parent = element.parentElement;

  while (parent) {
    style = window.getComputedStyle(parent);
    
    if (isScrollable(style)) {
      return parent;
    }
    
    parent = parent.parentElement;
  }

  // If no scrollable parent found, return document.scrollingElement or body as fallback
  return document.scrollingElement as HTMLElement || document.body;
}

// Define and export the WindowAutoScrollThresholds interface
export interface WindowAutoScrollThresholds {
  top: {
    slow: number;
    medium: number;
    fast: number;
  };
  right: {
    slow: number;
    medium: number;
    fast: number;
  };
  bottom?: {
    slow: number;
    medium: number;
    fast: number;
  };
  left?: {
    slow: number;
    medium: number;
    fast: number;
  };
}

// Update the interface to add the missing onScroll property
export interface WindowAutoScrollProps {
  active: boolean;
  eventType: string;
  thresholds: WindowAutoScrollThresholds;
  withinBounds?: boolean;
  onScroll?: (by: number, vertical: boolean) => void;
}

// Implement the WindowAutoScroll component
export const WindowAutoScroll: React.FC<WindowAutoScrollProps> = ({
  active,
  eventType,
  thresholds,
  withinBounds,
  onScroll
}) => {
  const [windows, setWindows] = useState<{ horizontal: HTMLElement | null; vertical: HTMLElement | null; }>({
    horizontal: null,
    vertical: null
  })

  const coords = useRef({ x: 0, y: 0 });
  const hInterval = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const vInterval = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Move clearIntervals to useCallback to avoid recreation on every render
  const clearIntervals = useCallback(() => {
    if (hInterval.current) {
      clearInterval(hInterval.current);
      hInterval.current = null;
    }
    if (vInterval.current) {
      clearInterval(vInterval.current);
      vInterval.current = null;
    }
  }, []);

  // Move scroll to useCallback to avoid recreation on every render
  const scroll = useCallback((el: Element, by: number, vertical: boolean) => {
    const callback = () => {
      const scrollMargin = vertical ? el.scrollTop : el.scrollLeft;
      const scrollLength = vertical ? el.scrollHeight : el.scrollWidth;
      const clientLength = vertical ? el.clientHeight : el.clientWidth;
      
      // Don't scroll further if we've hit the boundary
      if ((by < 0 && scrollMargin <= 0) || (by > 0 && scrollMargin + clientLength >= scrollLength)) {
        return;
      }
      
      if (vertical) {
        el.scrollTop += by;
      } else {
        el.scrollLeft += by;
      }
      
      // Call the onScroll callback if provided
      if (onScroll) {
        onScroll(by, vertical);
      }
    };
    
    callback();
    
    const intervalRef = setInterval(callback, 100);
    if (vertical) {
      vInterval.current = intervalRef;
    } else {
      hInterval.current = intervalRef;
    }
  }, [onScroll]);

  // Move checkCoords to useCallback with appropriate dependencies
  const checkCoords = useCallback((x: number, y: number) => {
    clearIntervals();

    if (windows.horizontal) {
      const rect = windows.horizontal.getBoundingClientRect();
      
      if (!withinBounds || (rect.left <= x && x <= rect.right)) {
        const leftDiff = x - rect.left;
        const rightDiff = rect.right - x;
        const leftThresholds = thresholds?.left || { slow: 20, medium: 9, fast: 3 };
        const rightThresholds = thresholds?.right || { slow: 20, medium: 9, fast: 3 };

        if (leftDiff <= leftThresholds.slow && windows.horizontal.scrollLeft > 0) {
          let by = 5;
          if (leftDiff < leftThresholds.fast) {
            by = 30;
          } else if (leftDiff < leftThresholds.medium) {
            by = 15;
          }
          scroll(windows.horizontal, -by, false);
        } else if (
          rightDiff <= rightThresholds.slow &&
          windows.horizontal.scrollLeft < windows.horizontal.scrollWidth - windows.horizontal.clientWidth
        ) {
          let by = 5;
          if (rightDiff < rightThresholds.fast) {
            by = 30;
          } else if (rightDiff < rightThresholds.medium) {
            by = 15;
          }
          scroll(windows.horizontal, by, false);
        }
      }
    }

    if (windows.vertical) {
      const rect = windows.vertical.getBoundingClientRect();
      
      if (!withinBounds || (rect.top <= y && y <= rect.bottom)) {
        const topDiff = y - rect.top;
        const bottomDiff = rect.bottom - y;
        const topThresholds = thresholds?.top || { slow: 20, medium: 9, fast: 3 };
        const bottomThresholds = thresholds?.bottom || { slow: 20, medium: 9, fast: 3 };
        
        if (topDiff <= topThresholds.slow && windows.vertical.scrollTop > 0) {
          let by = 5;
          if (topDiff < topThresholds.fast) {
            by = 30;
          } else if (topDiff < topThresholds.medium) {
            by = 15;
          }
          scroll(windows.vertical, -by, true);
        } else if (
          bottomDiff <= bottomThresholds.slow &&
          windows.vertical.scrollTop < windows.vertical.scrollHeight - windows.vertical.clientHeight
        ) {
          let by = 5;
          if (bottomDiff < bottomThresholds.fast) {
            by = 30;
          } else if (bottomDiff < bottomThresholds.medium) {
            by = 15;
          }
          scroll(windows.vertical, by, true);
        }
      }
    }
  }, [windows, withinBounds, thresholds, scroll, clearIntervals]);

  // Create event handlers with useCallback
  const handleDragOver = useCallback((e: DragEvent) => {
    if (coords.current.x !== e.x || coords.current.y !== e.y) {
      checkCoords(e.x, e.y);
      coords.current = { x: e.x, y: e.y };
    }
  }, [checkCoords]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    checkCoords(e.x, e.y);
  }, [checkCoords]);

  // Clean up intervals when component unmounts or dependencies change
  useEffect(() => {
    return () => clearIntervals();
  }, [clearIntervals]);

  // Set up scrollable parent windows
  useEffect(() => {
    if (active) {
      let horizontal = ref.current ? getScrollParent(ref.current, "horizontal") : null;
      let vertical = ref.current ? getScrollParent(ref.current, "vertical") : null;
      
      setWindows({ horizontal, vertical });
    }
  }, [active]);
  
  // Set up event listeners
  useEffect(() => {
    if (!active || !eventType) return;
    
    if (eventType === "drag") {
      document.addEventListener("dragover", handleDragOver);
    } else if (eventType === "mouse") {
      document.addEventListener("mousemove", handleMouseMove);
    }

    return () => {
      document.removeEventListener("dragover", handleDragOver);
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, [active, eventType, handleDragOver, handleMouseMove]);

  return <div ref={ref} style={{ width: '100%', height: '100%' }}></div>;
}

export default WindowAutoScroll;