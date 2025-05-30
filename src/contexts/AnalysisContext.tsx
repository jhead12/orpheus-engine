import { createContext } from 'react';
import { AudioAnalysisType, Clip } from '../services/types/types';

export interface AnalysisContextType {
  analysisType: AudioAnalysisType;
  setAnalysisType: (type: AudioAnalysisType) => void;
  selectedClip: Clip | null;
  setSelectedClip: (clip: Clip | null) => void;
  analysisResults: any;
  runAudioAnalysis: (audioBuffer: AudioBuffer, type: AudioAnalysisType) => Promise<any>;
}

export const AnalysisContext = createContext<AnalysisContextType | null>(null);
