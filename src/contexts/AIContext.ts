import { createContext, useContext } from 'react';
import { Clip } from '../services/types/types';

interface AIContextType {
  analyzeAudioFeatures: (clip: Clip | null) => Promise<any>;
  suggestArrangement: (clipIds: string[]) => Promise<any>;
}

const defaultContext: AIContextType = {
  analyzeAudioFeatures: async () => ({}),
  suggestArrangement: async () => ({})
};

export const AIContext = createContext<AIContextType>(defaultContext);

export const useAI = () => {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
};
