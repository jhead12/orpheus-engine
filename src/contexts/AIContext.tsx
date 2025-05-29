import { createContext, useContext, useEffect } from 'react';
import { AIWorkspaceManager } from '../services/ai/AIWorkspaceManager';

const AIContext = createContext<AIWorkspaceManager | null>(null);

export function AIProvider({ children }: { children: React.ReactNode }) {
  const aiManager = new AIWorkspaceManager();

  return (
    <AIContext.Provider value={aiManager}>
      {children}
    </AIContext.Provider>
  );
}

export function useAI() {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error('useAI must be used within AIProvider');
  }
  return context;
}
