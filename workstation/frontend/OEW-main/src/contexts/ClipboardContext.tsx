import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ClipboardContextType {
  clipboardContent: any;
  copyToClipboard: (content: any) => void;
}

const ClipboardContext = createContext<ClipboardContextType | undefined>(undefined);

export const useClipboard = () => {
  const context = useContext(ClipboardContext);
  if (!context) {
    throw new Error('useClipboard must be used within a ClipboardProvider');
  }
  return context;
};

export const ClipboardProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [clipboardContent, setClipboardContent] = useState<any>(null);

  const copyToClipboard = (content: any) => {
    setClipboardContent(content);
  };

  return (
    <ClipboardContext.Provider value={{ clipboardContent, copyToClipboard }}>
      {children}
    </ClipboardContext.Provider>
  );
};
