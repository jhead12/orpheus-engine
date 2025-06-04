import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Clip } from '../services/types/types';

// Define AudioAnalysisType enum
export enum AudioAnalysisType {
  Spectral = 'spectral',
  Waveform = 'waveform',
  Features = 'features'
}

export interface AnalysisContextType {
  analysisType: AudioAnalysisType;
  setAnalysisType: (type: AudioAnalysisType) => void;
  selectedClip: Clip | null;
  setSelectedClip: (clip: Clip | null) => void;
  analysisResults: any;
  runAudioAnalysis: (audioBuffer: AudioBuffer, type: AudioAnalysisType) => Promise<any>;
}

export const AnalysisContext = createContext<AnalysisContextType | null>(null);

export const AnalysisProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [analysisType, setAnalysisType] = useState<AudioAnalysisType>(AudioAnalysisType.Spectral);
  const [selectedClip, setSelectedClip] = useState<Clip | null>(null);
  const [analysisResults, setAnalysisResults] = useState<any>(null);

  const runAudioAnalysis = async (audioBuffer: AudioBuffer, type: AudioAnalysisType) => {
    // Mock implementation
    const results = { type, data: [] };
    setAnalysisResults(results);
    return results;
  };

  const value: AnalysisContextType = {
    analysisType,
    setAnalysisType,
    selectedClip,
    setSelectedClip,
    analysisResults,
    runAudioAnalysis,
  };

  return (
    <AnalysisContext.Provider value={value}>
      {children}
    </AnalysisContext.Provider>
  );
};
