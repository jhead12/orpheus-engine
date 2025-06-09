import { ContextMenuType } from "../../types/context-menu";

export function openContextMenu(
  type: ContextMenuType,
  _data: Record<string, any>,
  callback: (params: Record<string, any>) => void
): void {
  // TODO: Implement actual electron context menu
  console.log('Opening context menu of type:', type);
  callback({});
}
