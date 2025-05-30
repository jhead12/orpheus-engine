import { ContextMenuType } from '../types/types';

export const openContextMenu = (type: ContextMenuType, options: any, callback: (params: any) => void) => {
  // Implementation would go here - likely using electron IPC
  callback({ action: 0 });
};
