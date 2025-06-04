import React from 'react';

export { WorkstationContext, WorkstationProvider, useWorkstation } from './WorkstationContext';
export type { WorkstationContextType } from './WorkstationContext';

// Export ClipboardContext
export { ClipboardProvider } from './ClipboardContext';

// Export other contexts
export { PreferencesProvider } from './PreferencesContext';
export { MixerProvider } from './MixerContext';
export { DAWProvider } from './DAWContext';
export { AnalysisProvider } from './AnalysisContext';

// Export analysis context
export const AnalysisContext = React.createContext<any>(null);
