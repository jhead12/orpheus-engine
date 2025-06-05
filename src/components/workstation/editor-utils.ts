import { cmdOrCtrl } from "../../services/utils/general";

/**
 * Create a debounced function that adds delay between invocations
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): T & { cancel: () => void } {
  let timeout: NodeJS.Timeout | null;

  function debounced(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func.apply(null, args);
    };

    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  }

  debounced.cancel = () => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  };

  return debounced as T & { cancel: () => void };
}

/**
 * Clamp a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Check if system is macOS
 */
export function isMacOS(): boolean {
  return navigator.platform.toLowerCase().includes("mac");
}

/**
 * Open context menu with specified parameters
 */
export function openContextMenu(
  type: string,
  params: any = {},
  callback: (actionParams: any) => void
): void {
  // Implementation would connect to electron for native context menu
  console.log("Opening context menu", { type, params });
  callback(params);
}

export { cmdOrCtrl };
