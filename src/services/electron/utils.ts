import { ContextMenuType } from "../../types/context-menu";

// Define more specific types for context menu params
export interface ContextMenuParams {
  [key: string]: unknown;
}

export function openContextMenu(
  type: ContextMenuType,
  _data: Record<string, unknown>,
  callback: (params: ContextMenuParams) => void
): void {
  // TODO: Implement actual electron context menu
  console.log('Opening context menu of type:', type);
  callback({});
}
