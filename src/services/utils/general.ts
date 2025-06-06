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
