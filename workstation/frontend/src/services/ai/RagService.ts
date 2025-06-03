import { EventEmitter } from 'events';
import { MCPServerService } from '../mcp/MCPServerService';
import { Clip, Track, AudioAnalysisType } from '../types/types';

export interface RagQuery {
  text: string;
  context?: {
    audioClips?: Clip[];
    tracks?: Track[];
    projectState?: any;
  };
  requiresRealTimeAnalysis?: boolean;
}

// Add enhanced context interface
interface EnhancedRagContext {
  audioClips?: Clip[];
  tracks?: Track[];
  projectState?: any;
  audioAnalysis?: any[];
}

export interface RagResponse {
  answer: string;
  confidence: number;
  sources: string[];
  suggestions?: {
    type: 'arrangement' | 'mixing' | 'effects' | 'composition';
    actions: any[];
  };
  audioSegments?: {
    clipId: string;
    startTime: number;
    endTime: number;
    relevanceScore: number;
  }[];
}

export class RagService extends EventEmitter {
  private mcpService: MCPServerService;
  private ragBackendUrl: string;

  constructor() {
    super();
    this.mcpService = new MCPServerService({
      onMessage: this.handleMCPMessage.bind(this),
      capabilities: [
        'audioAnalysis',
        'midiGeneration', 
        'mixingAssistant',
        'arrangementSuggestions',
        'ragQuery',
        'contextualSearch'
      ]
    });
    this.ragBackendUrl = process.env.BACKEND_URL || 'http://localhost:5001';
  }

  async queryWithContext(query: RagQuery): Promise<RagResponse> {
    try {
      // First, check if we need additional context from audio analysis
      const needsAnalysis = await this.assessContextNeed(query);
      
      let enhancedContext: EnhancedRagContext = { ...query.context };

      if (needsAnalysis && query.context?.audioClips) {
        // Perform real-time audio analysis
        const analysisResults = await this.analyzeAudioClips(query.context.audioClips);
        enhancedContext.audioAnalysis = analysisResults;
      }

      // Send to RAG backend
      const response = await fetch(`${this.ragBackendUrl}/rag/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: query.text,
          context: enhancedContext,
          requiresAnalysis: needsAnalysis
        })
      });

      const ragResult = await response.json();

      // Process through MCP for additional AI insights
      const mcpEnhanced = await this.mcpService.send({
        type: 'enhanceRagResponse',
        query: query.text,
        response: ragResult,
        context: enhancedContext
      });

      return {
        answer: ragResult.answer,
        confidence: ragResult.confidence || 0.8,
        sources: ragResult.sources || [],
        suggestions: mcpEnhanced.suggestions,
        audioSegments: ragResult.audioSegments
      };

    } catch (error) {
      console.error('RAG query failed:', error);
      throw error;
    }
  }

  private async assessContextNeed(query: RagQuery): Promise<boolean> {
    // Use MCP to determine if additional context is needed
    const assessment = await this.mcpService.send({
      type: 'assessContextNeed',
      query: query.text,
      availableContext: Object.keys(query.context || {})
    });

    return assessment.needsAdditionalContext;
  }

  private async analyzeAudioClips(clips: Clip[]): Promise<any[]> {
    const analysisPromises = clips.map(clip => 
      this.mcpService.send({
        type: 'audioAnalysis',
        clipId: clip.id,
        analysisType: 'comprehensive' as AudioAnalysisType,
        clip: {
          id: clip.id,
          audio: clip.data,
          start: clip.start,
          end: clip.end
        }
      })
    );

    return await Promise.all(analysisPromises);
  }

  private handleMCPMessage(message: any) {
    this.emit('mcp-message', message);
    
    switch(message.type) {
      case 'analysisComplete':
        this.emit('analysis-complete', message.data);
        break;
      case 'suggestionReady':
        this.emit('suggestion-ready', message.data);
        break;
    }
  }

  // Search through audio library using RAG
  async searchAudioLibrary(query: string): Promise<any[]> {
    const response = await fetch(`${this.ragBackendUrl}/audio/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });

    return await response.json();
  }
}

export const ragService = new RagService();
