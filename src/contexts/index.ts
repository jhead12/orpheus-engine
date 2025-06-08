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
