import React, { createContext, useContext, useState, ReactNode } from 'react';

interface MixerContextType {
  masterVolume: number;
  setMasterVolume: (volume: number) => void;
}

const MixerContext = createContext<MixerContextType | undefined>(undefined);

export const MixerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [masterVolume, setMasterVolume] = useState(1);

  const value = {
    masterVolume,
    setMasterVolume,
  };

  return (
    <MixerContext.Provider value={value}>
      {children}
    </MixerContext.Provider>
  );
};

export const useMixer = () => {
  const context = useContext(MixerContext);
  if (!context) {
    throw new Error('useMixer must be used within a MixerProvider');
  }
  return context;
};
