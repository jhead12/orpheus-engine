import { useState, useEffect, useCallback } from 'react';

interface ScrollSyncState {
  scrollLeft: number;
  scrollTop: number;
}

/**
 * Hook to synchronize scrolling between multiple elements
 * @param targetRefs Array of refs to elements that should sync scrolling
 */
export function useSyncScroll(targetRefs: React.RefObject<HTMLElement>[]) {
  const [scrollState, setScrollState] = useState<ScrollSyncState>({
    scrollLeft: 0,
    scrollTop: 0
  });

  // Keep track of whether a scroll update is in progress to prevent loops
  const isScrolling = useCallback((ref: HTMLElement | null) => {
    return ref?.dataset.scrolling === 'true';
  }, []);

  const setScrolling = useCallback((ref: HTMLElement | null, value: boolean) => {
    if (ref) {
      ref.dataset.scrolling = value.toString();
    }
  }, []);

  const syncScroll = useCallback((sourceRef: HTMLElement | null) => {
    if (!sourceRef || isScrolling(sourceRef)) return;

    const newState = {
      scrollLeft: sourceRef.scrollLeft,
      scrollTop: sourceRef.scrollTop
    };

    setScrolling(sourceRef, true);
    setScrollState(newState);

    // Sync other elements
    targetRefs.forEach(targetRef => {
      const target = targetRef.current;
      if (target && target !== sourceRef && !isScrolling(target)) {
        setScrolling(target, true);
        target.scrollLeft = newState.scrollLeft;
        target.scrollTop = newState.scrollTop;
        requestAnimationFrame(() => setScrolling(target, false));
      }
    });

    requestAnimationFrame(() => setScrolling(sourceRef, false));
  }, [targetRefs, isScrolling, setScrolling]);

  useEffect(() => {
    const handleScroll = (e: Event) => {
      syncScroll(e.target as HTMLElement);
    };

    // Add scroll listeners to all refs
    targetRefs.forEach(ref => {
      const element = ref.current;
      if (element) {
        element.addEventListener('scroll', handleScroll);
      }
    });

    return () => {
      // Clean up scroll listeners
      targetRefs.forEach(ref => {
        const element = ref.current;
        if (element) {
          element.removeEventListener('scroll', handleScroll);
        }
      });
    };
  }, [targetRefs, syncScroll]);

  return scrollState;
}

export default useSyncScroll;
