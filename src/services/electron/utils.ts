import { ContextMenuType } from "../types/types";

export function openContextMenu(
  type: ContextMenuType,
  data: Record<string, any>,
  callback: (params: Record<string, any>) => void
): void {
  // TODO: Implement actual electron context menu
  callback({});
}
