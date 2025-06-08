export {
  WorkstationContext,
  type WorkstationContextType,
} from "./WorkstationContext";
export { AnalysisContext, type AnalysisContextType } from "./AnalysisContext";
export {
  ClipboardContext,
  ClipboardProvider,
  useClipboard,
  type ClipboardContextType,
  type ClipboardItem,
} from "./ClipboardContext";
export { ClipboardItemType } from "../types/clipboard";
export { useWorkstation } from "./useWorkstation";

// Add PreferencesContext for compatibility
export const PreferencesContext = {
  Provider: ({ children }: { children: React.ReactNode }) => children,
  Consumer: ({ children }: { children: (value: any) => React.ReactNode }) =>
    children({}),
};

// Audio search exports (placeholder)
export interface SearchResult {
  id: string;
  name: string;
  path: string;
  type: string;
}

export const useAudioSearch = () => {
  // Placeholder implementation
  return {
    search: (query: string) => Promise.resolve([]),
    results: [] as SearchResult[],
    loading: false,
  };
};
