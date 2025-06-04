import { ContextMenuType } from "../../services/types/types";

// Define SortData interface
export interface SortData {
  sourceIndex: number;
  destIndex?: number;
  edgeIndex: number;
}

export const clamp = (value: number, min: number, max: number): number => 
  Math.min(Math.max(value, min), max);

export const cmdOrCtrl = (e: KeyboardEvent | React.KeyboardEvent): boolean => 
  e.metaKey || e.ctrlKey;

export const isMacOS = (): boolean => 
  typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;

export const openContextMenu = (type: any, data: any, callback: (params: any) => void) => {
  // Implementation for context menu
  console.log('Context menu:', type, data);
  // Mock callback for now
  setTimeout(() => callback({ action: 'mock' }), 100);
};

export const debounce = <T extends (...args: any[]) => void>(
  func: T, 
  wait: number
): T & { cancel(): void } => {
  let timeout: NodeJS.Timeout | null = null;
  
  const debounced = ((...args: any[]) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  }) as T & { cancel(): void };
  
  debounced.cancel = () => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  };
  
  return debounced;
};
