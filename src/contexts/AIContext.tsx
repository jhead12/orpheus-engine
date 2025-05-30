import { createContext, useContext } from 'react';
import { Clip } from '../services/types/types';

interface AIContextValue {
  analyzeAudioFeatures: (clip: Clip) => Promise<any>;
  suggestArrangement: (clipIds: string[]) => Promise<void>;
}

const AIContext = createContext<AIContextValue | null>(null);

export const useAI = () => {
  const context = useContext(AIContext);
  if (!context) throw new Error('useAI must be used within AIProvider');
  return context;
};

export default AIContext;
