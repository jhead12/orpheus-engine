import { ContextMenuType } from "../../types/context-menu";

// Define SortData interface
export interface SortData {
  sourceIndex: number;
  edgeIndex?: number;
  destIndex?: number;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function cmdOrCtrl(e: KeyboardEvent | React.KeyboardEvent): boolean {
  return isMacOS() ? e.metaKey : e.ctrlKey;
}

export function isMacOS(): boolean {
  return navigator.platform.toUpperCase().indexOf('MAC') >= 0;
}

export interface ContextMenuParams {
  action: string;
  [key: string]: unknown;
}

export function openContextMenu(
  _type: ContextMenuType | string,
  data: Record<string, unknown> = {},
  callback: (params: ContextMenuParams) => void
): void {
  // Implementation would display context menu and call the callback with action
  setTimeout(() => {
    callback({ action: 'default', ...data });
  }, 100);
}

/**
 * Creates a debounced version of a function that delays invoking it until after
 * `wait` milliseconds have elapsed since the last invocation.
 * 
 * @param func The function to debounce
 * @param wait The number of milliseconds to delay
 * @returns A debounced version of the function with an additional `cancel` method
 */
export function debounce<Args extends unknown[], R>(
  func: (...args: Args) => R,
  wait: number
): {
  (...args: Args): void;
  cancel: () => void;
} {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  const debouncedFunction = function(this: unknown, ...args: Args) {
    const context = this;
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      timeout = null;
      func.apply(context, args);
    }, wait);
  };

  debouncedFunction.cancel = function() {
    if (timeout !== null) {
      clearTimeout(timeout);
      timeout = null;
    }
  };

  return debouncedFunction;
}
