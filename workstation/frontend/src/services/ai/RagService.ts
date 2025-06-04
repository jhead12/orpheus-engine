import { EventEmitter } from 'events';
import { MCPServerService } from '../mcp/MCPServerService';
import type { RagQuery, RagResult, RagContext } from '../../../../shared/types/ragResult';
import type { AudioSegment } from '../../../../shared/types/audioSegment';
import type { Clip, Track } from '../types/types';

interface QueryWithContextParams {
  text: string;
  context: any;
}

export class RagService {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:7008') {
    this.baseUrl = baseUrl;
  }

  async query(ragQuery: RagQuery): Promise<RagResult> {
    try {
      const response = await fetch(`${this.baseUrl}/api/rag/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ragQuery),
      });

      if (!response.ok) {
        throw new Error(`RAG query failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('RAG Service error:', error);
      throw error;
    }
  }

  async searchAudio(query: string, audioClips?: Clip[]): Promise<AudioSegment[]> {
    const ragQuery: RagQuery = {
      text: query,
      context: {
        audioClips: audioClips?.map(clip => ({
          id: clip.id,
          name: clip.name,
          duration: clip.audio?.audioBuffer?.duration,
          transcription: clip.metadata?.transcription,
        })),
      },
      requiresRealTimeAnalysis: true,
    };

    const result = await this.query(ragQuery);
    return result.audioSegments || [];
  }
  
  // Add searchAudioLibrary method to handle the search request with query string
  async searchAudioLibrary(query: string): Promise<any[]> {
    const ragQuery: RagQuery = {
      text: query,
      requiresRealTimeAnalysis: true,
    };

    const result = await this.query(ragQuery);
    return result.audioSegments || [];
  }

  // Add queryWithContext method for context-based queries
  async queryWithContext(params: QueryWithContextParams): Promise<RagResult> {
    const ragQuery: RagQuery = {
      text: params.text,
      context: params.context,
      requiresRealTimeAnalysis: false,
    };

    return await this.query(ragQuery);
  }

  async analyzeContext(context: RagContext): Promise<RagResult> {
    const ragQuery: RagQuery = {
      text: 'Analyze current project context',
      context,
      requiresRealTimeAnalysis: false,
    };

    return await this.query(ragQuery);
  }
}

export const ragService = new RagService();
