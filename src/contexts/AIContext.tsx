import React, { createContext, useContext, useState } from "react";
import { Clip } from "../types/core";
import {
  invokePythonAnalysis,
  PythonAnalysisResult,
} from "../services/pythonBridge";

interface AIFeatureAnalysis extends PythonAnalysisResult {}

interface ArrangementSuggestion {
  type: "arrangement";
  description: string;
  clipOrder: string[];
}

interface AIContextType {
  analyzeAudioFeatures: (clip: Clip) => Promise<AIFeatureAnalysis>;
  suggestArrangement: (
    clipIds: string[]
  ) => Promise<{ suggestions: ArrangementSuggestion[] }>;
  analyzeAudioWithDeepLearning?: (clip: Clip) => Promise<{
    features: NonNullable<PythonAnalysisResult["features"]>;
  }>;
}

const defaultAIContext: AIContextType = {
  analyzeAudioFeatures: async () => ({
    tempo_bpm: 0,
    loudness_lufs: 0,
    peak_db: 0,
    rms_db: 0,
    waveform_image: "",
    spectrogram_image: "",
    time_signature: null,
    features: {
      mfcc: [],
      spectralContrast: [],
      chromagram: [],
    },
  }),
  suggestArrangement: async () => ({ suggestions: [] }),
};

export const AIContext = createContext<AIContextType>(defaultAIContext);

export const useAI = () => {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error("useAI must be used within an AIProvider");
  }
  return context;
};

export const AIProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [analysisCache] = useState<Map<string, AIFeatureAnalysis>>(new Map());

  const analyzeAudioFeatures = async (
    clip: Clip
  ): Promise<AIFeatureAnalysis> => {
    if (analysisCache.has(clip.id)) {
      return analysisCache.get(clip.id)!;
    }

    try {
      if (clip.audio?.buffer) {
        // Convert AudioBuffer to Float32Array by getting the first channel data
        const audioData = clip.audio.buffer.getChannelData(0);
        const results = await invokePythonAnalysis({
          command: "analyze_audio",
          audioData,
          parameters: {
            resolution: 1024,
            windowSize: 2048,
          },
        });
        analysisCache.set(clip.id, results);
        return results;
      }
    } catch (error) {
      console.error("AI analysis failed:", error);
    }

    return {
      tempo_bpm: 0,
      loudness_lufs: 0,
      peak_db: 0,
      rms_db: 0,
      waveform_image: "",
      spectrogram_image: "",
      time_signature: null,
    };
  };

  const suggestArrangement = async (
    clipIds: string[]
  ): Promise<{ suggestions: ArrangementSuggestion[] }> => {
    try {
      return {
        suggestions: [
          {
            type: "arrangement" as const,
            description: "Consider placing clips in this order for better flow",
            clipOrder: [...clipIds],
          },
        ],
      };
    } catch (error) {
      console.error("AI arrangement suggestion failed:", error);
      return { suggestions: [] };
    }
  };

  return (
    <AIContext.Provider
      value={{
        analyzeAudioFeatures,
        suggestArrangement,
      }}
    >
      {children}
    </AIContext.Provider>
  );
};

export default AIContext;
