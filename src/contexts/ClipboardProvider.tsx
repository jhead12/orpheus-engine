// Export ClipboardProvider directly or implement it here if the external module does not exist.

import { createContext, useContext, useState, ReactNode } from "react";

type ClipboardContextType = {
  clipboard: string;
  setClipboard: (value: string) => void;
};

const ClipboardContext = createContext<ClipboardContextType | undefined>(undefined);

export const ClipboardProvider = ({ children }: { children: ReactNode }) => {
  const [clipboard, setClipboard] = useState<string>("");

  return (
	<ClipboardContext.Provider value={{ clipboard, setClipboard }}>
	  {children}
	</ClipboardContext.Provider>
  );
};

export const useClipboard = () => {
  const context = useContext(ClipboardContext);
  if (!context) {
	throw new Error("useClipboard must be used within a ClipboardProvider");
  }
  return context;
};
