import { useEffect, useRef, useCallback } from "react";

interface UseClickAwayOptions {
  /** Event to listen for. Defaults to 'mousedown' */
  event?: "mousedown" | "mouseup" | "click" | "touchstart" | "touchend";
  /** Whether to disable the click away handler */
  disabled?: boolean;
}

/**
 * Hook that handles clicks outside of a component
 * @template T Type of the HTML element to attach the ref to
 * @param callback Function to call when a click outside occurs
 * @param options Configuration options
 * @returns React ref to attach to the element
 * @example
 * ```tsx
 * const ref = useClickAway<HTMLDivElement>(() => {
 *   console.log('Clicked outside');
 * });
 *
 * return <div ref={ref}>Click outside me</div>;
 * ```
 */
export default function useClickAway<T extends HTMLElement>(
  callback: () => void,
  options: UseClickAwayOptions = {}
): React.RefObject<T> {
  const { event = "mousedown", disabled = false } = options;
  const ref = useRef<T>(null);

  // Memoize the handler to prevent unnecessary re-renders
  const handleClickOutside = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!ref.current || disabled) return;

      const target = e.target as Node;
      if (!ref.current.contains(target)) {
        callback();
      }
    },
    [callback, disabled]
  );

  useEffect(() => {
    if (disabled) return;

    document.addEventListener(event, handleClickOutside);
    return () => {
      document.removeEventListener(event, handleClickOutside);
    };
  }, [event, handleClickOutside, disabled]);

  return ref;
}

// Type guard for touch events
function isTouchEvent(event: MouseEvent | TouchEvent): event is TouchEvent {
  return "touches" in event;
}
