import { useContext } from "react";
import { WorkstationContext, WorkstationContextType } from "./WorkstationContext";

/**
 * Custom hook to use the WorkstationContext
 * @returns The WorkstationContext value
 */
export function useWorkstation(): WorkstationContextType {
  const context = useContext(WorkstationContext);
  
  if (!context) {
    throw new Error("useWorkstation must be used within a WorkstationProvider");
  }
  
  return context;
}
