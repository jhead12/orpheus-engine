import React, { createContext, useContext } from 'react';
import { 
  Track, 
  Clip, 
  TimelinePosition, 
  TimelineSettings,
  WorkstationPlugin,
  WorkstationContextType 
} from '../services/types';

// Create the context with a default undefined value
export const WorkstationContext = createContext<WorkstationContextType | undefined>(undefined);

// No need to redefine interfaces already defined in consolidated-types.ts

export const useWorkstation = () => {
  const context = useContext(WorkstationContext);
  if (!context) {
    throw new Error('useWorkstation must be used within a WorkstationProvider');
  }
  return context;
};

export default WorkstationContext;