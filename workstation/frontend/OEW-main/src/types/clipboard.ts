export enum ClipboardItemType {
  Track = "track",
  Clip = "clip",
  AutomationNode = "automation-node",
}

export interface ClipboardItem {
  type: ClipboardItemType;
  data: any;
}
