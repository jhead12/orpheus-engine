// Export the WorkstationContext from the consolidated WorkstationProvider
export { WorkstationProvider, useWorkstation, type WorkstationContextType } from './WorkstationProvider';

// Export other contexts
export { ClipboardProvider, useClipboard } from './ClipboardContext';
export { PreferencesProvider, usePreferences } from './PreferencesContext'; 
export { MixerProvider, useMixer, type MixerContextType } from './MixerContext';
export { DAWProvider, useDAW, type DAWContextType } from './DAWContext';

// Create AnalysisContext for compatibility
import React from 'react';
export const AnalysisContext = React.createContext<any>(null);
export const AnalysisProvider = ({ children }: { children: React.ReactNode }) => children;
