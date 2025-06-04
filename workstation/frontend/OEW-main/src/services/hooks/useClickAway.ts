import { useEffect, useRef } from 'react';

type Handler = (event: MouseEvent | TouchEvent) => void;

/**
 * Custom hook to detect clicks outside of a referenced element
 * @param handler - Function to call when clicking outside
 * @returns ref - Ref to attach to the element you want to detect outside clicks for
 */
function useClickAway<T extends HTMLElement = HTMLElement>(
  handler: Handler
): React.RefObject<T> {
  const ref = useRef<T>(null);

  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      const el = ref?.current;
      if (!el || el.contains((event?.target as Node) || null)) {
        return;
      }

      handler(event);
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);

  return ref;
}

export default useClickAway;
