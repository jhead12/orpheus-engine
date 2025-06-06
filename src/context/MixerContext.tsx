import React, { createContext, useState, useContext } from "react";

interface Track {
  id: string;
  name: string;
  volume: number;
  pan: number;
  mute: boolean;
  solo: boolean;
}

export interface MixerContextValue {
  tracks: Track[];
  mixerHeight: number;
  setMixerHeight: (height: number) => void;
  addTrack: (track: Track) => void;
  removeTrack: (id: string) => void;
  updateTrack: (id: string, updates: Partial<Track>) => void;
}

// Create context with default values
export const MixerContext = createContext<MixerContextValue>({
  tracks: [],
  mixerHeight: 200,
  setMixerHeight: () => {},
  addTrack: () => {},
  removeTrack: () => {},
  updateTrack: () => {},
});

export const MixerProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [mixerHeight, setMixerHeight] = useState<number>(200);

  const addTrack = (track: Track) => {
    setTracks((prev) => [...prev, track]);
  };

  const removeTrack = (id: string) => {
    setTracks((prev) => prev.filter((track) => track.id !== id));
  };

  const updateTrack = (id: string, updates: Partial<Track>) => {
    setTracks((prev) =>
      prev.map((track) => (track.id === id ? { ...track, ...updates } : track))
    );
  };

  const value: MixerContextValue = {
    tracks,
    mixerHeight,
    setMixerHeight,
    addTrack,
    removeTrack,
    updateTrack,
  };

  return (
    <MixerContext.Provider value={value}>{children}</MixerContext.Provider>
  );
};

export const useMixer = () => {
  const context = useContext(MixerContext);
  if (!context) {
    throw new Error("useMixer must be used within a MixerProvider");
  }
  return context;
};
