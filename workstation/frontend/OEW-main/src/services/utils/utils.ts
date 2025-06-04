// Utils for OEW-main
export const BASE_HEIGHT = 40;
export const BASE_BEAT_WIDTH = 100;
export const GRID_MIN_INTERVAL_WIDTH = 20;

// Timeline utilities
export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const formatPanning = (value: number): string => {
  if (value === 0) return 'C';
  if (value < 0) return `L${Math.abs(value).toFixed(0)}`;
  return `R${value.toFixed(0)}`;
};

export const formatVolume = (value: number): string => {
  return `${(value * 100).toFixed(0)}%`;
};

export const volumeToNormalized = (volume: number): number => {
  return Math.max(0, Math.min(1, volume));
};

export const getVolumeGradient = (volume: number): string => {
  const normalized = volumeToNormalized(volume);
  return `linear-gradient(90deg, #4ecdc4 0%, #44a08d ${normalized * 100}%, #333 ${normalized * 100}%)`;
};

export const getLaneColor = (laneType: string): string => {
  const colors = {
    volume: '#4ecdc4',
    pan: '#ff6b6b',
    filter: '#ffa502',
    default: '#45b7d1'
  };
  return colors[laneType as keyof typeof colors] || colors.default;
};

export const scrollToAndAlign = (element: HTMLElement, target: HTMLElement) => {
  if (!element || !target) return;
  const elementRect = element.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();
  const offset = targetRect.left - elementRect.left;
  element.scrollLeft += offset;
};

export const waitForScrollWheelStop = (callback: () => void, delay = 150) => {
  let timeoutId: NodeJS.Timeout;
  return () => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(callback, delay);
  };
};

export const timelineEditorWindowScrollThresholds = {
  left: 50,
  right: 50,
  top: 50,
  bottom: 50
};

export const sliceClip = (clip: any, startTime: number, endTime: number) => {
  // Clip slicing logic would go here
  return {
    ...clip,
    startTime,
    endTime,
    duration: endTime - startTime
  };
};

// Audio file validation utilities
export const isValidAudioTrackFileFormat = (filename: string): boolean => {
  const validExtensions = ['.wav', '.mp3', '.flac', '.aac', '.ogg', '.m4a'];
  return validExtensions.some(ext => filename.toLowerCase().endsWith(ext));
};

export const isValidTrackFileFormat = (filename: string): boolean => {
  return isValidAudioTrackFileFormat(filename);
};

// Timeline and clip utilities
export const clipAtPos = (clips: any[], position: number) => {
  return clips.find(clip => 
    position >= clip.startTime && position <= (clip.startTime + clip.duration)
  );
};

export const automatedValueAtPos = (automation: any[], position: number, defaultValue: number = 0) => {
  if (!automation || automation.length === 0) return defaultValue;
  
  // Find the automation point at or before the position
  const beforePoint = automation
    .filter(point => point.time <= position)
    .sort((a, b) => b.time - a.time)[0];
    
  return beforePoint ? beforePoint.value : defaultValue;
};

export const normalizedToVolume = (normalized: number): number => {
  return Math.max(0, Math.min(1, normalized));
};

export const removeAllClipOverlap = (clips: any[]) => {
  // Sort clips by start time
  const sortedClips = [...clips].sort((a, b) => a.startTime - b.startTime);
  
  // Remove overlaps
  for (let i = 1; i < sortedClips.length; i++) {
    const currentClip = sortedClips[i];
    const previousClip = sortedClips[i - 1];
    
    if (currentClip.startTime < previousClip.startTime + previousClip.duration) {
      // Overlap detected, adjust previous clip duration
      previousClip.duration = currentClip.startTime - previousClip.startTime;
    }
  }
  
  return sortedClips.filter(clip => clip.duration > 0);
};
