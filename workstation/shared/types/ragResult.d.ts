import type { AudioSegment } from './audioSegment';

export interface RagResult {
  query: string;
  answer: string;
  confidence: number;
  sources: RagSource[];
  audioSegments?: AudioSegment[];
  metadata?: Record<string, any>;
}

export interface RagSource {
  id: string;
  type: 'audio' | 'text' | 'metadata';
  content: string;
  timestamp?: string;
  confidence: number;
  audioClipId?: string;
  trackId?: string;
}

export interface RagQuery {
  text: string;
  context?: RagContext;
  requiresRealTimeAnalysis?: boolean;
  maxResults?: number;
  confidenceThreshold?: number;
}

export interface RagContext {
  audioClips?: Array<{
    id: string;
    name?: string;
    duration?: number;
    transcription?: string;
  }>;
  tracks?: Array<{
    id: string;
    name: string;
    type: string;
  }>;
  projectState?: {
    tempo?: number;
    timeSignature?: {
      beats: number;
      noteValue: number;
    };
    currentPosition?: any;
  };
  analysisType?: 'spectral' | 'waveform' | 'features';
}