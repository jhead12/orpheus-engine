/**
 * General utility functions for the OEW application
 */

/**
 * Finds the closest scrollable parent element
 */
export function getScrollParent(element: HTMLElement | null): HTMLElement | null {
  if (!element) return null;
  
  // Skip hidden elements
  if (element.style.display === 'none' || element.style.visibility === 'hidden') {
    return getScrollParent(element.parentElement);
  }

  const { overflow, overflowX, overflowY } = getComputedStyle(element);
  
  if (
    /(auto|scroll|overlay)/.test(overflow + overflowY + overflowX)
  ) {
    return element;
  }

  return getScrollParent(element.parentElement);
}

/**
 * Shades a hex color by a percentage
 */
export function shadeColor(color: string, percent: number): string {
  let R = parseInt(color.substring(1, 3), 16);
  let G = parseInt(color.substring(3, 5), 16);
  let B = parseInt(color.substring(5, 7), 16);

  R = Math.round(R * (1 + percent / 100));
  G = Math.round(G * (1 + percent / 100));
  B = Math.round(B * (1 + percent / 100));

  R = Math.min(255, Math.max(0, R));
  G = Math.min(255, Math.max(0, G));
  B = Math.min(255, Math.max(0, B));

  const RR = R.toString(16).padStart(2, '0');
  const GG = G.toString(16).padStart(2, '0');
  const BB = B.toString(16).padStart(2, '0');

  return `#${RR}${GG}${BB}`;
}

/**
 * Parses duration string in the format "hh:mm:ss" to seconds
 */
export function parseDuration(durationStr: string): number {
  if (!durationStr) return 0;
  
  const parts = durationStr.split(':').map(Number);
  
  if (parts.length === 3) {
    // Hours:Minutes:Seconds format
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) {
    // Minutes:Seconds format
    return parts[0] * 60 + parts[1];
  } else if (parts.length === 1) {
    // Seconds only
    return parts[0];
  }
  
  return 0;
}

/**
 * Formats seconds to a duration string "hh:mm:ss"
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Debounces a function to prevent too frequent calls
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  const debouncedFunction = function(this: any, ...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func.apply(this, args);
    };
    
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(later, wait);
  };
  
  debouncedFunction.cancel = () => {
    if (timeout !== null) {
      clearTimeout(timeout);
      timeout = null;
    }
  };
  
  return debouncedFunction;
}
