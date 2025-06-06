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

export function openContextMenu(
  type: ContextMenuType | string, 
  data: Record<string, any> = {}, 
  callback: (params: any) => void
): void {
  // Implementation would display context menu and call the callback with action
  setTimeout(() => {
    callback({ action: 'default', ...data });
  }, 100);
}

export function debounce<T extends (...args: any[]) => any>(
  func: T, 
  wait: number
): T {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  const debouncedFunction = function(this: any, ...args: any[]) {
    const context = this;
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      timeout = null;
      func.apply(context, args);
    }, wait);
  } as unknown as T;
  
  // Add cancel method
  (debouncedFunction as any).cancel = function() {
    if (timeout !== null) {
      clearTimeout(timeout);
      timeout = null;
    }
  };
  
  return debouncedFunction;
}
