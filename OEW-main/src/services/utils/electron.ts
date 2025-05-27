import { ContextMenuType } from '../types/types';

// Simplified implementation
export function openContextMenu(type: ContextMenuType, options: any, callback: (params: any) => void): void {
  console.log('Open context menu:', type, options);
  setTimeout(() => callback({ action: 1 }), 100);
}
