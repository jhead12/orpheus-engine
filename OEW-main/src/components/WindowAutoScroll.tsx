import React, { useEffect, useRef, useState } from "react"
import { getScrollParent } from "@/services/utils/general";

interface WindowAutoScrollProps {
  active: boolean;
  eventType: string;
  thresholds?: number[];
  withinBounds?: boolean;
  speed?: number | {
    fast: number;
    medium: number;
    slow: number;
  };
  onScroll?: (by: number) => void;
}

const WindowAutoScroll: React.FC<WindowAutoScrollProps> = (props) => {
  const { active, eventType, thresholds, withinBounds, onScroll } = props;

  const [windows, setWindows] = useState<{ horizontal: HTMLElement | null; vertical: HTMLElement | null; }>({
    horizontal: null,
    vertical: null
  })

  const coords = useRef({ x: 0, y: 0 });
  const hInterval = useRef<ReturnType<typeof setTimeout>>(undefined);
  const ref = useRef<HTMLDivElement>(null);
  const vInterval = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    return () => clearIntervals();
  }, [active, eventType])

  useEffect(() => {
    if (active) {
      let horizontal = ref.current ? getScrollParent(ref.current, "horizontal") : null;
      let vertical = ref.current ? getScrollParent(ref.current, "vertical") : null;

      setWindows({ horizontal, vertical });
    }
  }, [active])
  
  useEffect(() => {
    function handleDragOver(e: DragEvent) {
      if (coords.current.x !== e.x || coords.current.y !== e.y) {
        checkCoords(e.x, e.y);
        coords.current = { x: e.x, y: e.y };
      }
    }

    function handleMouseMove(e: MouseEvent) {
      checkCoords(e.x, e.y);
    }  

    if (active) {
      if (eventType === "drag")
        document.addEventListener("dragover", handleDragOver);
      else
        document.addEventListener("mousemove", handleMouseMove);
    }

    return () => {
      document.removeEventListener("dragover", handleDragOver);
      document.removeEventListener("mousemove", handleMouseMove);
    }
  }, [
    active, eventType, withinBounds, windows.horizontal, windows.vertical,
    thresholds?.[0], thresholds?.[1], thresholds?.[2], thresholds?.[3]
  ])

  function checkCoords(x: number, y: number) {
    clearIntervals();

    if (windows.horizontal) {
      const rect = windows.horizontal.getBoundingClientRect();
      
      if (!withinBounds || rect.left <= x && x <= rect.right) {
        const leftDiff = x - rect.left;
        const rightDiff = rect.right - x;
        const leftThresholds = Array.isArray(thresholds) ? thresholds?.[3] || { fast: 3, medium: 9, slow: 20 } : { fast: 3, medium: 9, slow: 20 };
        const rightThresholds = Array.isArray(thresholds) ? thresholds?.[1] || { fast: 3, medium: 9, slow: 20 } : { fast: 3, medium: 9, slow: 20 };

        if (leftDiff <= (typeof leftThresholds === 'number' ? leftThresholds : leftThresholds.slow) && windows.horizontal.scrollLeft > 0) {
          let by = 5;
          if (leftDiff < (typeof leftThresholds === 'number' ? leftThresholds : leftThresholds.fast)) {
            by = 30;
          } else if (leftDiff < (typeof leftThresholds === 'number' ? leftThresholds : leftThresholds.medium)) {
            by = 15;
          }
          scroll(windows.horizontal, -by, false);
        } else if (
          rightDiff <= (typeof rightThresholds === 'number' ? rightThresholds : rightThresholds.slow) &&
          windows.horizontal.scrollLeft < windows.horizontal.scrollWidth - windows.horizontal.clientWidth
        ) {
          let by = 5;
          if (rightDiff < (typeof rightThresholds === 'number' ? rightThresholds : rightThresholds.fast)) {
            by = 30;
          } else if (rightDiff < (typeof rightThresholds === 'number' ? rightThresholds : rightThresholds.medium)) {
            by = 15;
          }
          scroll(windows.horizontal, by, false);
        }
      }
    }

    if (windows.vertical) {
      const rect = windows.vertical.getBoundingClientRect();

      if (!withinBounds || rect.top <= y && y <= rect.bottom) {
        const topDiff = y - rect.top;
        const bottomDiff = rect.bottom - y;
        const topThresholds = thresholds?.[0] || { fast: 3, medium: 9, slow: 20 };
        const bottomThresholds = thresholds?.[2] || { fast: 3, medium: 9, slow: 20 };
        
        if (topDiff <= (typeof topThresholds === 'number' ? topThresholds : topThresholds.slow) && windows.vertical.scrollTop > 0) {
          let by = 5;
          if (topDiff < (typeof topThresholds === 'number' ? topThresholds : topThresholds.fast)) {
            by = 30;
          } else if (topDiff < (typeof topThresholds === 'number' ? topThresholds : topThresholds.medium)) {
            by = 15;
          }
          scroll(windows.vertical, -by, true);
        } else if (
          bottomDiff <= (typeof bottomThresholds === 'number' ? bottomThresholds : bottomThresholds.slow) &&
          windows.vertical.scrollTop < windows.vertical.scrollHeight - windows.vertical.clientHeight
        ) {
          let by = 5;
          if (bottomDiff < (typeof bottomThresholds === 'number' ? bottomThresholds : bottomThresholds.fast)) {
            by = 30;
          } else if (bottomDiff < (typeof bottomThresholds === 'number' ? bottomThresholds : bottomThresholds.medium)) {
            by = 15;
          }
          scroll(windows.vertical, by, true);
        }
      }
    }
  }

  function clearIntervals() {
    clearInterval(hInterval.current);
    clearInterval(vInterval.current);
  }

  function scroll(el: Element, by: number, vertical: boolean) {
    const callback = () => {
      const scrollMargin = vertical ? el.scrollTop : el.scrollLeft;
      const scrollLength = vertical ? el.scrollHeight : el.scrollWidth;
      const clientLength = vertical ? el.clientHeight : el.clientWidth;

      if (scrollMargin + by <= 0 || scrollMargin + by >= scrollLength - clientLength)
        clearInterval(vertical ? vInterval.current : hInterval.current);
      by = Math.max(-scrollMargin, Math.min(by, scrollLength - clientLength - scrollMargin));
      el.scrollBy(vertical ? 0 : by, vertical ? -by : 0);
      if (onScroll) {
        onScroll(by);
      }
    }
  
  
    if (vertical)
      vInterval.current = setInterval(callback, 25);
    else 
      hInterval.current = setInterval(callback, 25);

    callback();
  }

  return <div ref={ref} style={{ display: "none" }} />;
}

export default WindowAutoScroll;