export interface WorkstationPlugin {
  id: string;
  name: string;
  type: 'effect' | 'instrument' | 'analyzer';
  enabled: boolean;
  metadata?: {
    version: string;
    author: string;
    description?: string;
  };
}
