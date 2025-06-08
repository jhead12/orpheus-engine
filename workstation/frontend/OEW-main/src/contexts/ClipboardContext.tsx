import React, { createContext, useContext, useState } from "react";
import { ClipboardItemType } from "../types/clipboard";

interface ClipboardItem {
  type: ClipboardItemType;
  data: any;
}

interface ClipboardContextType {
  clipboardItem: ClipboardItem | null;
  setClipboardItem: (item: ClipboardItem | null) => void;
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
  const [clipboardItem, setClipboardItem] = useState<ClipboardItem | null>(null);

  return (
    <ClipboardContext.Provider value={{ clipboardItem, setClipboardItem }}>
      {children}
    </ClipboardContext.Provider>
  );
};

export { ClipboardContext, type ClipboardContextType, type ClipboardItem };
export default ClipboardContext;