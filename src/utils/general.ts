/**
 * Linear interpolation between start and end values
 */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

/**
 * Inverse linear interpolation - returns where a value lies between start and end (0-1)
 */
export function inverseLerp(start: number, end: number, value: number): number {
  return (value - start) / (end - start);
}

/**
 * Clamps a value between min and max values
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Maps a value from one range to another
 */
export function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number {
  const t = inverseLerp(inMin, inMax, value);
  return lerp(outMin, outMax, t);
}

/**
 * Returns true if all values in array are within tolerance of target
 */
export function allWithinTolerance(
  array: number[],
  target: number,
  tolerance: number
): boolean {
  return array.every((val) => Math.abs(val - target) <= tolerance);
}

/**
 * Deep clones an object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Debounces a function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Gets the closest scrollable parent of an element
 */
export function getScrollParent(
  element: HTMLElement | null
): HTMLElement | null {
  if (!element) return null;

  const style = getComputedStyle(element);
  const overflow = style.overflow + style.overflowY + style.overflowX;

  if (overflow.includes("scroll") || overflow.includes("auto")) {
    return element;
  }

  return getScrollParent(element.parentElement);
}

/**
 * Converts HSL to Hex color
 */
export function hslToHex(h: number, s: number, l: number): string {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

/**
 * Gets hue from hex color
 */
export function hueFromHex(hex: string): number {
  // Remove # if present
  hex = hex.replace("#", "");

  // Convert to RGB
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let hue = 0;
  if (delta === 0) {
    return hue;
  }

  if (max === r) {
    hue = ((g - b) / delta) % 6;
  } else if (max === g) {
    hue = (b - r) / delta + 2;
  } else {
    hue = (r - g) / delta + 4;
  }

  hue = Math.round(hue * 60);
  return hue < 0 ? hue + 360 : hue;
}

/**
 * Formats duration in seconds to string
 */
export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

/**
 * Parses duration string to seconds
 */
export function parseDuration(duration: string): number {
  const [minutes, seconds] = duration.split(":").map(Number);
  return minutes * 60 + seconds;
}

/**
 * Calculate seconds for given measures based on BPM and time signature
 */
export function measureSeconds(
  measures: number,
  bpm: number,
  timeSignature = { beats: 4, noteValue: 4 }
): number {
  const beatsPerMeasure = timeSignature.beats;
  const secondsPerBeat = 60 / bpm;
  return measures * beatsPerMeasure * secondsPerBeat;
}

/**
 * Adjusts color shade
 */
export function shadeColor(color: string, percent: number): string {
  let R = parseInt(color.substring(1, 3), 16);
  let G = parseInt(color.substring(3, 5), 16);
  let B = parseInt(color.substring(5, 7), 16);

  R = Math.round((R * (100 + percent)) / 100);
  G = Math.round((G * (100 + percent)) / 100);
  B = Math.round((B * (100 + percent)) / 100);

  R = Math.min(R, 255);
  G = Math.min(G, 255);
  B = Math.min(B, 255);

  const RR = R.toString(16).padStart(2, "0");
  const GG = G.toString(16).padStart(2, "0");
  const BB = B.toString(16).padStart(2, "0");

  return `#${RR}${GG}${BB}`;
}
