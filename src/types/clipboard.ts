export enum ClipboardItemType {
  Track = "track",
  Clip = "clip",
  AutomationNode = "automation-node",
  Node = "node"
}

export interface ClipboardItem {
  type: ClipboardItemType;
  data: any;
}
