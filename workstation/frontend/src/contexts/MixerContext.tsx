import React, { createContext, useContext, useState, useRef, ReactNode } from 'react';
import { audioContext } from '../services/utils/audio';

interface MixerContextType {
  masterVolume: number;
  setMasterVolume: (value: number) => void;
  updateTrackVolume: (trackId: string, value: number) => void;
  updateTrackPan: (trackId: string, value: number) => void;
  soloTrack: (trackId: string) => void;
  muteTrack: (trackId: string) => void;
  isSolo: (trackId: string) => boolean;
  isMuted: (trackId: string) => boolean;
  getTrackGainNode: (trackId: string) => GainNode;
  getTrackPanNode: (trackId: string) => StereoPannerNode;
}

const MixerContext = createContext<MixerContextType | undefined>(undefined);

export const MixerProvider = ({ children }: { children: ReactNode }) => {
  const [masterVolume, setMasterVolume] = useState(1);
  const [soloTracks, setSoloTracks] = useState<Set<string>>(new Set());
  const [mutedTracks, setMutedTracks] = useState<Set<string>>(new Set());
  const [trackVolumes, setTrackVolumes] = useState<Map<string, number>>(new Map());
  const [trackPans, setTrackPans] = useState<Map<string, number>>(new Map());
  
  // Audio nodes for mixing
  const masterGainNode = useRef(audioContext.createGain());
  const trackGainNodes = useRef<Map<string, GainNode>>(new Map());
  const trackPanNodes = useRef<Map<string, StereoPannerNode>>(new Map());

  // Initialize master gain node
  React.useEffect(() => {
    masterGainNode.current.connect(audioContext.destination);
    return () => {
      masterGainNode.current.disconnect();
    };
  }, []);

  // Update master volume
  React.useEffect(() => {
    masterGainNode.current.gain.value = masterVolume;
  }, [masterVolume]);

  // Create or get track audio nodes
  const getTrackGainNode = (trackId: string): GainNode => {
    if (!trackGainNodes.current.has(trackId)) {
      const gainNode = audioContext.createGain();
      const panNode = getTrackPanNode(trackId);
      gainNode.connect(panNode);
      trackGainNodes.current.set(trackId, gainNode);
    }
    return trackGainNodes.current.get(trackId)!;
  };

  const getTrackPanNode = (trackId: string): StereoPannerNode => {
    if (!trackPanNodes.current.has(trackId)) {
      const panNode = audioContext.createStereoPanner();
      panNode.connect(masterGainNode.current);
      trackPanNodes.current.set(trackId, panNode);
    }
    return trackPanNodes.current.get(trackId)!;
  };

  // Track controls
  const updateTrackVolume = (trackId: string, value: number) => {
    setTrackVolumes(prev => new Map(prev).set(trackId, value));
    const gainNode = getTrackGainNode(trackId);
    gainNode.gain.value = value;
  };

  const updateTrackPan = (trackId: string, value: number) => {
    setTrackPans(prev => new Map(prev).set(trackId, value));
    const panNode = getTrackPanNode(trackId);
    panNode.pan.value = value;
  };

  const soloTrack = (trackId: string) => {
    setSoloTracks(prev => {
      const next = new Set(prev);
      if (next.has(trackId)) {
        next.delete(trackId);
      } else {
        next.add(trackId);
      }
      return next;
    });
  };

  const muteTrack = (trackId: string) => {
    setMutedTracks(prev => {
      const next = new Set(prev);
      if (next.has(trackId)) {
        next.delete(trackId);
      } else {
        next.add(trackId);
      }
      return next;
    });
  };

  const isSolo = (trackId: string): boolean => soloTracks.has(trackId);
  const isMuted = (trackId: string): boolean => {
    // Track is muted if explicitly muted or if any track is soloed and this one isn't
    return mutedTracks.has(trackId) || (soloTracks.size > 0 && !soloTracks.has(trackId));
  };

  // Update track gains based on solo/mute state
  React.useEffect(() => {
    trackGainNodes.current.forEach((gainNode, trackId) => {
      gainNode.gain.value = isMuted(trackId) ? 0 : (trackVolumes.get(trackId) || 1);
    });
  }, [soloTracks, mutedTracks]);

  const value = {
    masterVolume,
    setMasterVolume,
    updateTrackVolume,
    updateTrackPan,
    soloTrack,
    muteTrack,
    isSolo,
    isMuted,
    getTrackGainNode,
    getTrackPanNode
  };

  return (
    <MixerContext.Provider value={value}>
      {children}
    </MixerContext.Provider>
  );
};

export const useMixer = () => {
  const context = useContext(MixerContext);
  if (!context) {
    throw new Error('useMixer must be used within a MixerProvider');
  }
  return context;
};

export default MixerProvider;
