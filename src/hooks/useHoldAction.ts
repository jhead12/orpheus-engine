import { useCallback, useEffect, useRef, useState } from 'react';

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
  holdActionOnMouseDown = false
}: UseHoldActionProps) {
  const [isHolding, setIsHolding] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const endHold = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsHolding(false);
  }, []);

  const startHold = useCallback(() => {
    if (holdActionOnMouseDown) {
      onHoldAction();
    }

    timeoutRef.current = setTimeout(() => {
      setIsHolding(true);
    }, delay);
  }, [delay, holdActionOnMouseDown, onHoldAction]);

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;
    
    if (isHolding) {
      intervalId = setInterval(onHoldAction, interval);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isHolding, interval, onHoldAction]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    startHold,
    endHold
  };
}

export default useHoldAction;
