import { clamp } from "../../services/utils/general";

declare global {
  interface Window {
    electron: {
      ipcRenderer: {
        send(channel: string, data: unknown): void;
      };
    };
  }
}

export interface ContextMenuParams {
  action: string;
  [key: string]: unknown;
}

type DebouncedFunction<T extends (...args: unknown[]) => unknown> = T & {
  cancel: () => void;
};

/**
 * Creates a debounced function that delays invoking func until after wait milliseconds
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): DebouncedFunction<T> {
  let timeout: NodeJS.Timeout | null = null;

  const debounced = function (this: unknown, ...args: Parameters<T>): void {
    const later = () => {
      timeout = null;
      func.apply(this, args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  } as DebouncedFunction<T>;

  debounced.cancel = function () {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  };

  return debounced;
}

/**
 * Opens the context menu with the specified type and parameters
 */
export function openContextMenu(
  type: string,
  params: Record<string, unknown> = {},
  callback: (actionParams: ContextMenuParams) => void
): void {
  window.electron.ipcRenderer.send("show-context-menu", {
    type,
    ...params,
    callback,
  });
}

/**
 * Returns true if the current platform is macOS
 */
export function isMacOS(): boolean {
  return navigator.platform.toUpperCase().indexOf("MAC") >= 0;
}

/**
 * Checks if a keyboard event should trigger a context menu
 */
export function shouldOpenContextMenu(
  e: KeyboardEvent | React.KeyboardEvent
): boolean {
  return cmdOrCtrl(e) && e.key === " ";
}

/**
 * Returns true if the Cmd key is pressed on Mac or Ctrl key on other platforms
 */
export function cmdOrCtrl(e: KeyboardEvent | React.KeyboardEvent): boolean {
  return isMacOS() ? e.metaKey : e.ctrlKey;
}

// Export SortData interface
export interface SortData {
  sourceIndex: number;
  edgeIndex?: number;
  destIndex?: number;
}

export { clamp };
