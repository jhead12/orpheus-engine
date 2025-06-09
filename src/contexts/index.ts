export {
  WorkstationContext,
  type WorkstationContextType,
} from "./WorkstationContext";
export { AnalysisContext } from "./AnalysisContext";
export type { AnalysisContextType } from "./types";
export {
  ClipboardContext,
  ClipboardProvider,
  useClipboard,
  type ClipboardContextType,
  type ClipboardItem,
} from "./ClipboardContext";
export {
  MixerContext,
  MixerProvider,
  useMixer,
  type MixerContextType,
} from "./MixerContext";
export {
  usePreferences,
} from "./PreferencesContext";
export { ClipboardItemType } from "../types/clipboard";
export { useWorkstation } from "./useWorkstation";

// Audio search exports (placeholder)
export interface SearchResult {
  id: string;
  text: string;
  confidence: number;
  start_time: number;
  end_time: number;
  file_path?: string;
  audio_file?: string;
}

export const useAudioSearch = () => {
  // Placeholder implementation
  return {
    search: (_query: string) => Promise.resolve([]),
    results: [] as SearchResult[],
    loading: false,
    isSearching: false,
    error: null as string | null,
    selectResult: (_result: SearchResult) => {},
  };
};
