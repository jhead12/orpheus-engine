import { useEffect, useState, useCallback } from 'react';

interface ResizeState {
  width: number;
  height: number;
}

/**
 * Hook to observe and react to element size changes
 * @param targetRef Reference to the element to observe
 * @param options ResizeObserver options
 */
export function useResizeObserver<T extends HTMLElement>(
  targetRef: React.RefObject<T>,
  options: ResizeObserverOptions = {}
) {
  const [size, setSize] = useState<ResizeState>({ width: 0, height: 0 });

  const handleResize = useCallback((entries: ResizeObserverEntry[]) => {
    if (!Array.isArray(entries) || !entries.length) {
      return;
    }

    const entry = entries[0];
    const { width, height } = entry.contentRect;
    
    setSize({ width, height });
  }, []);

  useEffect(() => {
    if (!targetRef.current) return;

    const observer = new ResizeObserver(handleResize);
    observer.observe(targetRef.current, options);

    return () => {
      observer.disconnect();
    };
  }, [targetRef, options, handleResize]);

  return size;
}

export default useResizeObserver;
