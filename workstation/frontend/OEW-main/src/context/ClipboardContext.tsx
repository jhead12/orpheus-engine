import React, { createContext, useContext, useState } from "react";

interface ClipboardContextType {
  clipboardData: any;
  setCopiedData: (data: any) => void;
}

const ClipboardContext = createContext<ClipboardContextType | undefined>(
  undefined
);

export const useClipboard = () => {
  const context = useContext(ClipboardContext);
  if (context === undefined) {
    throw new Error("useClipboard must be used within a ClipboardProvider");
  }
  return context;
};

export const ClipboardProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [clipboardData, setClipboardData] = useState<any>(null);

  const setCopiedData = (data: any) => {
    setClipboardData(data);
  };

  return (
    <ClipboardContext.Provider value={{ clipboardData, setCopiedData }}>
      {children}
    </ClipboardContext.Provider>
  );
};

export default ClipboardContext;
