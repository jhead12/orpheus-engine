export function hslToHex(h: number, s: number, l: number): string {
  h /= 360;
  s /= 100;
  l /= 100;

  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function hueFromHex(hex: string): number {
  hex = normalizeHex(hex);
  
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  
  let h = 0;
  
  if (max === min) {
    return 0; // achromatic
  }
  
  const d = max - min;
  
  if (max === r) {
    h = (g - b) / d + (g < b ? 6 : 0);
  } else if (max === g) {
    h = (b - r) / d + 2;
  } else if (max === b) {
    h = (r - g) / d + 4;
  }
  
  return Math.round(h * 60);
}

export function normalizeHex(hex: string): string {
  // Remove # if present
  hex = hex.replace(/^#/, '');
  
  // Convert 3-character hex to 6-character hex
  if (hex.length === 3) {
    hex = hex.split('').map(char => char + char).join('');
  }
  
  // Add # prefix
  return `#${hex}`;
}

export function getCSSVarValue(varName: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
}

export function inverseLerp(value: number, min: number, max: number): number {
  return (value - min) / (max - min);
}

export function lerp(t: number, min: number, max: number): number {
  return min + t * (max - min);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export function measureSeconds(measures: number, tempo: number, timeSignature: { beats: number; noteValue: number }): number {
  const beatsPerMeasure = timeSignature.beats;
  const secondsPerBeat = 60 / tempo;
  return measures * beatsPerMeasure * secondsPerBeat;
}

export const shadeColor = (color: string, percent: number): string => {
  return "#000000"; // Placeholder implementation
};
