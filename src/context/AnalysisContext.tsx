import React, { createContext } from "react";
import { AnalysisContextType } from "../types/context";

export const AnalysisContext = createContext<AnalysisContextType>({
  analysisType: "spectral",
  analysisResults: null,
  selectedClip: null,
  setAnalysisType: () => {},
  setSelectedClip: () => {},
  runAudioAnalysis: async () => null,
});

export default AnalysisContext;
