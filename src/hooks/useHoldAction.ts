import { useCallback, useEffect, useRef } from 'react';

interface UseHoldActionProps {
  onHoldAction: () => void;
  delay?: number;
  interval?: number;
  holdActionOnMouseDown?: boolean;
}

/**
 * Hook for handling hold-to-repeat actions
 * @param onHoldAction Function to call when hold action triggers
 * @param delay Initial delay before repeat starts (ms)
 * @param interval Interval between repeat actions (ms) 
 * @param holdActionOnMouseDown Whether to trigger action on initial mouse down
 */
export function useHoldAction({
  onHoldAction,
  delay = 500,
  interval = 50,
  holdActionOnMouseDown = true
}: UseHoldActionProps) {
  const initialCallMadeRef = useRef(false);
  const delayCallMadeRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const intervalRef = useRef<ReturnType<typeof setInterval>>();
  const isHoldingRef = useRef(false);

  // Clean up function that's reused in multiple places
  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = undefined;
    }
    initialCallMadeRef.current = false;
    delayCallMadeRef.current = false;
    isHoldingRef.current = false;
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  const startHold = useCallback(() => {
    // Don't restart if already holding
    if (isHoldingRef.current) return;
    
    // Reset state
    cleanup();
    isHoldingRef.current = true;
    
    // Initial call if holdActionOnMouseDown is true
    if (holdActionOnMouseDown) {
      onHoldAction();
      initialCallMadeRef.current = true;
    }

    // Exactly match the test expectations for timing
    // First call exactly after delay ms
    timeoutRef.current = setTimeout(() => {
      if (!isHoldingRef.current) return;
      
      // Make the delayed call
      onHoldAction();
      delayCallMadeRef.current = true;
      
      // Then set up regular interval for subsequent calls
      // Use setInterval instead of nested setTimeout for more consistent timing
      intervalRef.current = setInterval(() => {
        if (!isHoldingRef.current) {
          cleanup();
          return;
        }
        onHoldAction();
      }, interval);
      
    }, delay);
  }, [delay, holdActionOnMouseDown, interval, onHoldAction, cleanup]);

  const endHold = useCallback(() => {
    cleanup();
  }, [cleanup]);

  return {
    startHold,
    endHold
  };
}

export default useHoldAction;
