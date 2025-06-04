import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Clip, Track } from '../services/types/types';

interface ClipboardContextType {
  copyClip: (clip: Clip) => void;
  copyTrack: (track: Track) => void;
  getPasteableClip: () => Clip | null;
  getPasteableTrack: () => Track | null;
  hasCopiedClip: boolean;
  hasCopiedTrack: boolean;
}

const ClipboardContext = createContext<ClipboardContextType | undefined>(undefined);

export { ClipboardContext };

export const ClipboardProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [copiedClip, setCopiedClip] = useState<Clip | null>(null);
  const [copiedTrack, setCopiedTrack] = useState<Track | null>(null);

  const copyClip = (clip: Clip) => {
    setCopiedClip({ ...clip, id: Math.random().toString() });
  };

  const copyTrack = (track: Track) => {
    setCopiedTrack({ 
      ...track, 
      id: Math.random().toString(),
      clips: track.clips.map(clip => ({ ...clip, id: Math.random().toString() }))
    });
  };

  const getPasteableClip = () => copiedClip;
  const getPasteableTrack = () => copiedTrack;

  const value: ClipboardContextType = {
    copyClip,
    copyTrack,
    getPasteableClip,
    getPasteableTrack,
    hasCopiedClip: !!copiedClip,
    hasCopiedTrack: !!copiedTrack,
  };

  return (
    <ClipboardContext.Provider value={value}>
      {children}
    </ClipboardContext.Provider>
  );
};

export const useClipboard = () => {
  const context = useContext(ClipboardContext);
  if (!context) {
    throw new Error('useClipboard must be used within a ClipboardProvider');
  }
  return context;
};

export default ClipboardProvider;
