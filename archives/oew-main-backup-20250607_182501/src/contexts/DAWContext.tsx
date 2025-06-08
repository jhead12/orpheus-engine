import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface TimelinePosition {
  bar: number;
  beat: number;
  fraction: number;
}

interface DAWContextType {
  audioService: {
    getWaveformData: () => Promise<Float32Array>;
    getFrequencyData: () => Promise<Float32Array>;
  };
  isPlaying: boolean;
  togglePlayback: () => void;
  currentPosition: TimelinePosition;
  setPosition: (position: TimelinePosition) => void;
  tempo: number;
  setTempo: (tempo: number) => void;
  timeSignature: { beats: number, noteValue: number };
  setTimeSignature: (timeSignature: { beats: number, noteValue: number }) => void;
}

const DAWContext = createContext<DAWContextType | null>(null);

export const useDAW = () => {
  const context = useContext(DAWContext);
  if (!context) {
    throw new Error('useDAW must be used within a DAWProvider');
  }
  return context;
};

export const DAWProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPosition, setCurrentPosition] = useState<TimelinePosition>({ bar: 0, beat: 0, fraction: 0 });
  const [tempo, setTempo] = useState(120);
  const [timeSignature, setTimeSignature] = useState({ beats: 4, noteValue: 4 });
  const [audioContext] = useState(() => new (window.AudioContext || (window as any).webkitAudioContext)());
  const [analyser] = useState(() => audioContext.createAnalyser());

  const audioService = {
    getWaveformData: async () => {
      const dataArray = new Float32Array(analyser.frequencyBinCount);
      analyser.getFloatTimeDomainData(dataArray);
      return dataArray;
    },
    getFrequencyData: async () => {
      const dataArray = new Float32Array(analyser.frequencyBinCount);
      analyser.getFloatFrequencyData(dataArray);
      return dataArray;
    }
  };

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  const setPosition = (pos: TimelinePosition) => {
    setCurrentPosition(pos);
  };

  useEffect(() => {
    // Connect audio nodes
    analyser.connect(audioContext.destination);
    
    return () => {
      // Cleanup audio context
      analyser.disconnect();
      audioContext.close();
    };
  }, []);

  // Update playhead position when playing
  useEffect(() => {
    let animationId: number;
    let lastTimestamp = 0;
    
    const updatePlayhead = (timestamp: number) => {
      if (isPlaying) {
        if (lastTimestamp) {
          const elapsed = timestamp - lastTimestamp;
          const beatsPerSecond = tempo / 60;
          const fractionPerMs = beatsPerSecond / 1000;
          
          // Calculate new position
          let newFraction = currentPosition.fraction + elapsed * fractionPerMs;
          let newBeat = currentPosition.beat;
          let newBar = currentPosition.bar;
          
          // Handle overflow
          if (newFraction >= 1) {
            newBeat += Math.floor(newFraction);
            newFraction = newFraction % 1;
          }
          
          if (newBeat >= timeSignature.beats) {
            newBar += Math.floor(newBeat / timeSignature.beats);
            newBeat = newBeat % timeSignature.beats;
          }
          
          setCurrentPosition({ bar: newBar, beat: newBeat, fraction: newFraction });
        }
        lastTimestamp = timestamp;
        animationId = requestAnimationFrame(updatePlayhead);
      } else {
        lastTimestamp = 0;
      }
    };
    
    if (isPlaying) {
      animationId = requestAnimationFrame(updatePlayhead);
    }
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isPlaying, currentPosition, tempo, timeSignature]);

  return (
    <DAWContext.Provider value={{
      audioService,
      isPlaying,
      togglePlayback,
      currentPosition,
      setPosition,
      tempo,
      setTempo,
      timeSignature,
      setTimeSignature
    }}>
      {children}
    </DAWContext.Provider>
  );
};

export default DAWProvider;
