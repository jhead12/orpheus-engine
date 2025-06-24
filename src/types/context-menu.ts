export enum ContextMenuType {
  AddAutomationLane = 'add-automation-lane',
  Automation = 'automation',
  Clip = 'clip',
  FXChainPreset = 'fx-chain-preset',
  Lane = 'lane',
  Node = 'node',
  Region = 'region',
  Text = 'text',
  Timeline = 'timeline',
  Track = 'track',
}

export interface ContextMenuParams {
  action: string;
  x?: number;
  y?: number;
  data?: any;
}
