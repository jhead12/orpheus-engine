import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ClipboardContextType {
  clipboardData: any;
  setClipboardData: (data: any) => void;
}

const ClipboardContext = createContext<ClipboardContextType | null>(null);

export const ClipboardProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [clipboardData, setClipboardData] = useState(null);

  const value = {
    clipboardData,
    setClipboardData,
  };

  return (
    <ClipboardContext.Provider value={value}>
      {children}
    </ClipboardContext.Provider>
  );
};

export const useClipboard = () => {
  const context = useContext(ClipboardContext);
  if (!context) {
    throw new Error('useClipboard must be used within a ClipboardProvider');
  }
  return context;
};
