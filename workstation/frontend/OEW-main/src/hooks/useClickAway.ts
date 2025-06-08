import { useCallback, useEffect, useRef } from 'react';

/**
 * Hook that triggers a callback when a click occurs outside of the target element
 * @param callback Function to call when a click outside occurs
 * @returns Ref to attach to the target element
 */
export function useClickAway<T extends HTMLElement>(callback: () => void) {
  const ref = useRef<T>(null);

  const handleClick = useCallback((e: MouseEvent) => {
    if (ref.current && !ref.current.contains(e.target as Node)) {
      callback();
    }
  }, [callback]);

  useEffect(() => {
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [handleClick]);

  return ref;
}

export default useClickAway;
