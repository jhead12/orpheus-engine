import React, { createContext, useContext, useState } from 'react';

interface WorkstationContextType {
  mixerHeight: number;
  setMixerHeight: (height: number) => void;
  showMixer: boolean;
  setShowMixer: (show: boolean) => void;
  allowMenuAndShortcuts: boolean;
  setAllowMenuAndShortcuts: (allow: boolean) => void;
}

export const WorkstationContext = createContext<WorkstationContextType | null>(null);

export const WorkstationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mixerHeight, setMixerHeight] = useState<number>(200);
  const [showMixer, setShowMixer] = useState<boolean>(true);
  const [allowMenuAndShortcuts, setAllowMenuAndShortcuts] = useState<boolean>(true);

  const value = {
    mixerHeight,
    setMixerHeight,
    showMixer,
    setShowMixer,
    allowMenuAndShortcuts,
    setAllowMenuAndShortcuts
  };

  return (
    <WorkstationContext.Provider value={value}>
      {children}
    </WorkstationContext.Provider>
  );
};

export const useWorkstation = (): WorkstationContextType => {
  const context = useContext(WorkstationContext);
  if (!context) {
    throw new Error('useWorkstation must be used within a WorkstationProvider');
  }
  return context;
};
