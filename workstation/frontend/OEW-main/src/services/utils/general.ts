import { TimelineSettings } from "../types/types";

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

export function measureSeconds(seconds: number): string {
  return formatDuration(seconds);
}

export function parseDuration(timeString: string): { hours: number; minutes: number; seconds: number; milliseconds: number } | null {
  const parts = timeString.split(':');
  if (parts.length === 2) {
    return {
      hours: 0,
      minutes: parseInt(parts[0]) || 0,
      seconds: parseInt(parts[1]) || 0,
      milliseconds: 0
    };
  } else if (parts.length === 3) {
    return {
      hours: parseInt(parts[0]) || 0,
      minutes: parseInt(parts[1]) || 0,
      seconds: parseInt(parts[2]) || 0,
      milliseconds: 0
    };
  }
  return null;
}

export const cmdOrCtrl = (e: KeyboardEvent | React.KeyboardEvent): boolean => {
  return isMacOS() ? e.metaKey : e.ctrlKey;
};

export const isMacOS = (): boolean => {
  return typeof window !== 'undefined' && window.navigator.platform.toUpperCase().indexOf('MAC') >= 0;
};

export const debounce = <F extends (...args: any[]) => any>(func: F, wait: number) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  const debounced = (...args: Parameters<F>) => {
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => func(...args), wait);
  };
  
  debounced.cancel = () => {
    if (timeout !== null) {
      clearTimeout(timeout);
      timeout = null;
    }
  };
  
  return debounced;
};

export const clamp = (value: number, min: number, max: number): number => {
  return Math.max(min, Math.min(max, value));
};
