import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface WorkstationContextType {
  isReady: boolean;
  currentProject: any;
  setCurrentProject: (project: any) => void;
}

const WorkstationContext = createContext<WorkstationContextType | undefined>(undefined);

export const WorkstationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isReady, setIsReady] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);

  const value = {
    isReady,
    currentProject,
    setCurrentProject,
  };

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

export default WorkstationContext;
