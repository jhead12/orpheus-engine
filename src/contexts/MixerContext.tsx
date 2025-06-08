import React, { createContext, useContext, useState } from 'react';
import { Track, Effect } from '../types/core';

interface MeterData {
  left: number;
  right: number;
  peak: number;
}

export interface MixerContextType {
  tracks: Track[];
  masterVolume: number;
  masterPan: number;
  masterMute: boolean;
  setMasterVolume: (volume: number) => void;
  setMasterPan: (pan: number) => void;
  setMasterMute: (mute: boolean) => void;
  setTrackVolume: (trackId: string, volume: number) => void;
  setTrackPan: (trackId: string, pan: number) => void;
  setTrackMute: (trackId: string, mute: boolean) => void;
  setTrackSolo: (trackId: string, solo: boolean) => void;
  setTrackArmed: (trackId: string, armed: boolean) => void;
  addEffect: (trackId: string, effectType: string) => void;
  removeEffect: (trackId: string, effectId: string) => void;
  updateEffect: (trackId: string, effectId: string, parameters: Record<string, number>) => void;
  reorderEffects: (trackId: string, effectId: string, newIndex: number) => void;
  meters: Record<string, MeterData>;
  isVisible: boolean;
  setIsVisible: (visible: boolean) => void;
  soloedTracks: string[];
  muteAllTracks: () => void;
  unmuteAllTracks: () => void;
  resetAllLevels: () => void;
}

export const MixerContext = createContext<MixerContextType | undefined>(undefined);

export const useMixer = () => {
  const context = useContext(MixerContext);
  if (context === undefined) {
    throw new Error('useMixer must be used within a MixerProvider');
  }
  return context;
};

interface MixerProviderProps {
  children: React.ReactNode;
}

export const MixerProvider: React.FC<MixerProviderProps> = ({ children }) => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [masterVolume, setMasterVolume] = useState(1);
  const [masterPan, setMasterPan] = useState(0);
  const [masterMute, setMasterMute] = useState(false);
  const [meters, setMeters] = useState<Record<string, MeterData>>({
    master: { left: 0, right: 0, peak: 0 }
  });
  const [isVisible, setIsVisible] = useState(true);
  const [soloedTracks, setSoloedTracks] = useState<string[]>([]);

  const setTrackVolume = (trackId: string, volume: number) => {
    setTracks(tracks.map(track =>
      track.id === trackId ? { ...track, volume } : track
    ));
  };

  const setTrackPan = (trackId: string, pan: number) => {
    setTracks(tracks.map(track =>
      track.id === trackId ? { ...track, pan } : track
    ));
  };

  const setTrackMute = (trackId: string, mute: boolean) => {
    setTracks(tracks.map(track =>
      track.id === trackId ? { ...track, mute } : track
    ));
  };

  const setTrackSolo = (trackId: string, solo: boolean) => {
    setTracks(tracks.map(track =>
      track.id === trackId ? { ...track, solo } : track
    ));
    setSoloedTracks(prev =>
      solo
        ? [...prev, trackId]
        : prev.filter(id => id !== trackId)
    );
  };

  const setTrackArmed = (trackId: string, armed: boolean) => {
    setTracks(tracks.map(track =>
      track.id === trackId ? { ...track, armed } : track
    ));
  };

  const addEffect = (trackId: string, effectType: string) => {
    setTracks(tracks.map(track => {
      if (track.id === trackId) {
        const effect: Effect = {
          id: `${effectType}-${Date.now()}`,
          name: effectType.charAt(0).toUpperCase() + effectType.slice(1),
          type: 'native',
          enabled: true,
          parameters: {}
        };
        return {
          ...track,
          effects: track.effects ? [...track.effects, effect] : [effect]
        };
      }
      return track;
    }));
  };

  const removeEffect = (trackId: string, effectId: string) => {
    setTracks(tracks.map(track =>
      track.id === trackId
        ? {
            ...track,
            effects: track.effects ? track.effects.filter(e => e.id !== effectId) : []
          }
        : track
    ));
  };

  const updateEffect = (trackId: string, effectId: string, parameters: Record<string, number>) => {
    setTracks(tracks.map(track => {
      if (track.id === trackId && track.effects) {
        return {
          ...track,
          effects: track.effects.map(effect =>
            effect.id === effectId
              ? { ...effect, parameters: { ...effect.parameters, ...parameters } }
              : effect
          )
        };
      }
      return track;
    }));
  };

  const reorderEffects = (trackId: string, effectId: string, newIndex: number) => {
    setTracks(tracks.map(track => {
      if (track.id === trackId && track.effects) {
        const effects = [...track.effects];
        const oldIndex = effects.findIndex(e => e.id === effectId);
        if (oldIndex !== -1) {
          const [effect] = effects.splice(oldIndex, 1);
          effects.splice(newIndex, 0, effect);
          return { ...track, effects };
        }
      }
      return track;
    }));
  };

  const muteAllTracks = () => {
    setTracks(tracks.map(track => ({ ...track, mute: true })));
  };

  const unmuteAllTracks = () => {
    setTracks(tracks.map(track => ({ ...track, mute: false })));
  };

  const resetAllLevels = () => {
    setMeters(prev => {
      const newMeters = { ...prev };
      Object.keys(newMeters).forEach(key => {
        newMeters[key] = { left: 0, right: 0, peak: 0 };
      });
      return newMeters;
    });
  };

  const value = {
    tracks,
    masterVolume,
    masterPan,
    masterMute,
    setMasterVolume,
    setMasterPan,
    setMasterMute,
    setTrackVolume,
    setTrackPan,
    setTrackMute,
    setTrackSolo,
    setTrackArmed,
    addEffect,
    removeEffect,
    updateEffect,
    reorderEffects,
    meters,
    isVisible,
    setIsVisible,
    soloedTracks,
    muteAllTracks,
    unmuteAllTracks,
    resetAllLevels
  };

  return (
    <MixerContext.Provider value={value}>
      {children}
    </MixerContext.Provider>
  );
};

export default MixerContext;
