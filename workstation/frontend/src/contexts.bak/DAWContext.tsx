import React, { createContext, useContext } from 'react';
import { audioService } from '../services/audio/audioService';
import { ClipService } from '../services/daw/clipService';

interface DAWContextType {
  audioService: typeof audioService;
  clipService: ClipService;
}

export const DAWContext = createContext<DAWContextType | null>(null);

export const DAWProvider = ({ children }: { children: React.ReactNode }) => {
  const clipService = new ClipService();

  return (
    <DAWContext.Provider value={{
      audioService,
      clipService
    }}>
      {children}
    </DAWContext.Provider>
  );
};

export const useDAW = () => {
  const context = useContext(DAWContext);
  if (!context) {
    throw new Error('useDAW must be used within a DAWProvider');
  }
  return context;
};
