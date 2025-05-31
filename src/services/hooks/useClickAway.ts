import { useEffect, RefObject } from 'react';

/**
 * Hook that triggers a callback when user clicks outside the referenced element
 */
export default function useClickAway<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T>,
  onClickAway: (event: MouseEvent | TouchEvent) => void,
  enabled: boolean = true
): void {
  useEffect(() => {
    if (!enabled) return;
    
    function handleClickAway(event: MouseEvent | TouchEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClickAway(event);
      }
    }
    
    document.addEventListener('mousedown', handleClickAway);
    document.addEventListener('touchstart', handleClickAway);
    
    return () => {
      document.removeEventListener('mousedown', handleClickAway);
      document.removeEventListener('touchstart', handleClickAway);
    };
  }, [ref, onClickAway, enabled]);
}
