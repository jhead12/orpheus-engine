import { AudioAnalysisType } from '../types/types';

export interface MCPWebhookConfig {
  endpoint: string;
  port: number;
  secure: boolean;
}

export class MCPWebhookService {
  private baseUrl: string;

  constructor(config: MCPWebhookConfig) {
    this.baseUrl = `${config.secure ? 'https' : 'http'}://${config.endpoint}:${config.port}`;
  }

  async registerAnalysisWebhook(clipId: string, type: AudioAnalysisType) {
    return fetch(`${this.baseUrl}/webhooks/analysis`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clipId, type })
    });
  }

  async unregisterAnalysisWebhook(clipId: string) {
    return fetch(`${this.baseUrl}/webhooks/analysis/${clipId}`, {
      method: 'DELETE'
    });
  }
}
