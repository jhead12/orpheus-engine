import { createContext } from 'react';

// Import core types from types.ts
import {
  AutomationLane,
  AutomationNode,
  Clip,
  Region,
  TimelinePosition,
  TimelineSettings,
  TimelineSpan,
  Track,
  TrackType,
} from '../services/types/types';

export enum ClipboardItemType {
  Clip,
  Node
}

export type ClipboardItem = 
  { type: ClipboardItemType.Clip; item: Clip; } | 
  { type: ClipboardItemType.Node; item: { node: AutomationNode, lane: AutomationLane }; }

export interface ClipboardContextType {
  clipboardItem: ClipboardItem | null;
  copy: (item: ClipboardItem) => void;
  clear: () => void;
}

export const ClipboardContext = createContext<ClipboardContextType | undefined>(undefined);

export interface ScrollToItem {
  type: "cursor" | "track" | "clip" | "node";
  params?: {
    alignment?: "center" | "scrollIntoView";
    clipId?: string;
    trackId?: string;
    nodeId?: string;
  } & Record<string, unknown>;
}

// Import WorkstationContext exports
import WorkstationContext, {
  useWorkstation,
  WorkstationPlugin,
  WorkstationData,
  StorageConnector,
  PluginMetadata,
  WorkstationContextType
} from './WorkstationContext';
import WorkstationProvider from './WorkstationProvider';

// Export WorkstationContext items
export {
  WorkstationContext,
  WorkstationProvider,
  useWorkstation,
  WorkstationContextType
};

// Re-export all imported types
export type {
  AutomationLane,
  AutomationNode,
  Clip,
  Region,
  TimelinePosition,
  TimelineSettings,
  TimelineSpan,
  Track,
  TrackType,
  WorkstationPlugin,
  WorkstationData,
  StorageConnector,
  PluginMetadata,
};

export { ClipboardProvider, useClipboard } from './ClipboardProvider';
export { AnalysisContext } from './AnalysisContext';
export { 
  default as AudioSearchContext, 
  useAudioSearch, 
  AudioSearchProvider,
  type SearchResult 
} from './AudioSearchContext';
