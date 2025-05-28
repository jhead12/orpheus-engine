import React, { createContext, useState, useContext } from 'react';

interface MixerContextType {
  mixerHeight: number;
  setMixerHeight: (height: number) => void;
}

const MixerContext = createContext<MixerContextType | undefined>(undefined);

export const MixerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mixerHeight, setMixerHeight] = useState(200); // Default height

  return (
    <MixerContext.Provider value={{ mixerHeight, setMixerHeight }}>
      {children}
    </MixerContext.Provider>
  );
};

export const useMixer = () => {
  const context = useContext(MixerContext);
  if (context === undefined) {
    throw new Error('useMixer must be used within a MixerProvider');
  }
  return context;
};
