// Context exports for OEW-main
export { WorkstationProvider, useWorkstation, WorkstationContext } from './WorkstationContext';
export { MixerProvider, useMixer } from './MixerContext';
export { DAWProvider, useDAW } from './DAWContext';
export { PreferencesProvider, usePreferences, PreferencesContext } from './PreferencesContext';
export { ClipboardProvider, useClipboard, ClipboardContext } from './ClipboardContext';
export { AIProvider, useAI } from './AIContext';

// ClipboardItemType enum
export enum ClipboardItemType {
  Clip = 'clip',
  Node = 'node',
  Track = 'track'
}

// Note: AnalysisContext might need to be created or imported from elsewhere
// For now, let's create a basic one
import React, { createContext, useContext } from 'react';

interface AnalysisContextType {
  // Add analysis context properties here
  analysisType?: string;
  setAnalysisType?: (type: string) => void;
}

const AnalysisContext = createContext<AnalysisContextType>({});

export const useAnalysis = () => useContext(AnalysisContext);
export { AnalysisContext };
