import { RefObject, useEffect, useRef } from 'react';

interface AutoScrollOptions {
  thresholds?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
  speed?: number;
}

/**
 * Hook to handle auto-scrolling when elements are near viewport edges
 * @param containerRef Reference to the scrollable container
 * @param options Auto-scroll configuration options
 */
export function useAutoScroll(
  containerRef: RefObject<HTMLElement>,
  options: AutoScrollOptions = {}
) {
  const {
    thresholds = {
      top: 20,
      right: 20,
      bottom: 20,
      left: 20
    },
    speed = 5
  } = options;

  const intervalRef = useRef<ReturnType<typeof setInterval>>();
  const coordsRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      coordsRef.current = { x: e.clientX, y: e.clientY };

      // Clear existing interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      // Check if mouse is near edges
      const isNearTop = e.clientY - rect.top < thresholds.top!;
      const isNearBottom = rect.bottom - e.clientY < thresholds.bottom!;
      const isNearLeft = e.clientX - rect.left < thresholds.left!;
      const isNearRight = rect.right - e.clientX < thresholds.right!;

      if (isNearTop || isNearBottom || isNearLeft || isNearRight) {
        intervalRef.current = setInterval(() => {
          if (isNearTop && container.scrollTop > 0) {
            container.scrollBy(0, -speed);
          }
          if (isNearBottom && container.scrollTop < container.scrollHeight - container.clientHeight) {
            container.scrollBy(0, speed);
          }
          if (isNearLeft && container.scrollLeft > 0) {
            container.scrollBy(-speed, 0);
          }
          if (isNearRight && container.scrollLeft < container.scrollWidth - container.clientWidth) {
            container.scrollBy(speed, 0);
          }
        }, 16); // ~60fps
      }
    };

    container.addEventListener('mousemove', handleMouseMove);

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [containerRef, speed, thresholds.top, thresholds.right, thresholds.bottom, thresholds.left]);
}

export default useAutoScroll;
