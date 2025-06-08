/**
 * Clamps a number between min and max values
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Linear interpolation between start and end values based on t (0-1)
 */
export function lerp(t: number, start: number, end: number): number {
  return start + (end - start) * t;
}

/**
 * Inverse linear interpolation - returns t (0-1) given a value between start and end
 */
export function inverseLerp(value: number, start: number, end: number): number {
  return (value - start) / (end - start);
}

/**
 * Gets the value of a CSS variable from root
 */
export function getCSSVarValue(varName: string): string {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(varName)
    .trim();
}

/**
 * Normalizes a hex color code to standard 6-digit format
 */
export function normalizeHex(hex: string): string {
  // Remove # if present
  hex = hex.replace("#", "");

  // Convert 3-digit hex to 6-digit
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }

  // Add # back
  return "#" + hex;
}

/**
 * Extracts hue from a hex color code
 * @param hex Hex color code (e.g. "#ff0000")
 * @returns Hue value in degrees (0-359)
 */
export function hueFromHex(hex: string): number {
  hex = normalizeHex(hex);

  // Convert hex to RGB
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let hue = 0;

  if (delta === 0) {
    hue = 0;
  } else if (max === r) {
    hue = ((g - b) / delta) % 6;
  } else if (max === g) {
    hue = (b - r) / delta + 2;
  } else {
    hue = (r - g) / delta + 4;
  }

  hue = Math.round(hue * 60);
  if (hue < 0) hue += 360;

  return hue;
}

/**
 * Converts HSL color values to hex color code
 * @param h Hue in degrees (0-359)
 * @param s Saturation percentage (0-100)
 * @param l Lightness percentage (0-100)
 * @returns Hex color code (e.g. "#ff0000")
 */
export function hslToHex(h: number, s: number, l: number): string {
  h = h % 360;
  s = s / 100;
  l = l / 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r = 0;
  let g = 0;
  let b = 0;

  if (h >= 0 && h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (h >= 60 && h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (h >= 120 && h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (h >= 180 && h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (h >= 240 && h < 300) {
    r = x;
    g = 0;
    b = c;
  } else if (h >= 300 && h < 360) {
    r = c;
    g = 0;
    b = x;
  }

  // Convert to hex
  const toHex = (n: number) => {
    const hex = Math.round((n + m) * 255).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };

  return "#" + toHex(r) + toHex(g) + toHex(b);
}

/**
 * Waits for a scroll wheel to stop moving
 */
export function waitForScrollWheelStop(
  element: HTMLElement,
  callback: () => void,
  timeout: number = 150
): void {
  let timeoutId: NodeJS.Timeout;

  const handleScroll = () => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      element.removeEventListener("scroll", handleScroll);
      callback();
    }, timeout);
  };

  element.addEventListener("scroll", handleScroll);
}

/**
 * Scrolls an element to align with a target position
 */
export function scrollToAndAlign(
  element: HTMLElement,
  position: { left?: number; top?: number },
  align: { left?: number; top?: number } = { left: 0, top: 0 }
): void {
  if (position.left !== undefined) {
    element.scrollLeft =
      position.left - element.clientWidth * (align.left || 0);
  }
  if (position.top !== undefined) {
    element.scrollTop = position.top - element.clientHeight * (align.top || 0);
  }
}

/**
 * Shades a hex color by a given percentage
 */
/**
 * Checks if the Cmd (macOS) or Ctrl (other platforms) key is pressed
 */
export function cmdOrCtrl(e: KeyboardEvent | React.KeyboardEvent): boolean {
  return navigator.platform.toLowerCase().includes("mac")
    ? e.metaKey
    : e.ctrlKey;
}

export const shadeColor = (color: string, percent: number) => {
  if (!color) return color;

  let R = parseInt(color.substring(1, 3), 16);
  let G = parseInt(color.substring(3, 5), 16);
  let B = parseInt(color.substring(5, 7), 16);

  R = parseInt(((R * (100 + percent)) / 100).toString());
  G = parseInt(((G * (100 + percent)) / 100).toString());
  B = parseInt(((B * (100 + percent)) / 100).toString());

  R = R < 255 ? R : 255;
  G = G < 255 ? G : 255;
  B = B < 255 ? B : 255;

  const RR =
    R.toString(16).length === 1 ? "0" + R.toString(16) : R.toString(16);
  const GG =
    G.toString(16).length === 1 ? "0" + G.toString(16) : G.toString(16);
  const BB =
    B.toString(16).length === 1 ? "0" + B.toString(16) : B.toString(16);

  return "#" + RR + GG + BB;
};
