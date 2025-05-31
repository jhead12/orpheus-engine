export interface WorkstationPlugin {
  id: string;
  name: string;
  version: string;
  type: 'effect' | 'instrument' | 'utility';
  enabled: boolean;
  metadata?: {
    author: string;
    description: string;
    tags: string[];
  };
}
