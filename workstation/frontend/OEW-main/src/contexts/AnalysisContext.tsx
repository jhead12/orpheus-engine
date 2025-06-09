import { createContext } from "react";
import { AudioAnalysisType } from "../types";
import { AnalysisContextType } from "./types";

export const AnalysisContext = createContext<AnalysisContextType>({
  analysisType: AudioAnalysisType.Spectral,
  analysisResults: null,
  selectedClip: null,
  setAnalysisType: () => {},
  setSelectedClip: () => {},
  runAudioAnalysis: async () => null,
});
