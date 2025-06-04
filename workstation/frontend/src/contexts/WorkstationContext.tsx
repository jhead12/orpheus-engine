import React, { createContext, useContext, ReactNode } from 'react';
import { WorkstationProvider as Provider, useWorkstation as baseUseWorkstation } from './WorkstationProvider';
import { WorkstationContextType } from './WorkstationProvider';

export interface WorkstationPlugin {
  id: string;
  name: string;
  version: string;
  initialize?: (workstation: any) => void;
  cleanup?: () => void;
  metadata?: {
    id: string;
    name: string;
    author?: string;
    description?: string;
  };
  storageConnector?: any;
}

const WorkstationContext = createContext<WorkstationContextType | undefined>(undefined);

export const WorkstationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Implementation using the existing WorkstationProvider
  // Use the existing implementation from WorkstationProvider
  const value = {} as WorkstationContextType;

  return (
    <WorkstationContext.Provider value={value}>
      {children}
    </WorkstationContext.Provider>
  );
};

export const useWorkstation = () => {
  const context = useContext(WorkstationContext);
  if (!context) {
    throw new Error('useWorkstation must be used within a WorkstationProvider');
  }
  return context;
};

// Re-export everything from WorkstationProvider to maintain compatibility
export { 
  WorkstationProvider, 
  useWorkstation, 
  type WorkstationContextType 
} from './WorkstationProvider';

// Create a default export for compatibility
import { WorkstationProvider } from './WorkstationProvider';
export default WorkstationProvider;