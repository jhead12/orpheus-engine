import { Clip, TimelinePosition } from "../types/types";

export const BASE_HEIGHT = 100;
export const BASE_BEAT_WIDTH = 80;
export const GRID_MIN_INTERVAL_WIDTH = 34;

// Audio file validation utilities
export const isValidAudioTrackFileFormat = (type: string): boolean => {
  const audioFormats = [
    "audio/wav",
    "audio/mp3",
    "audio/ogg",
    "audio/m4ta",
    "audio/flac",
    "audio/aac",
    "audio/webm",
  ];
  return audioFormats.includes(type);
};

export const isValidTrackFileFormat = (type: string): boolean => {
  return isValidAudioTrackFileFormat(type) || type === "audio/midi";
};

export const clipAtPos = (position: TimelinePosition, clip: Clip): Clip => {
  return {
    ...clip,
    start: position,
    end: TimelinePosition.fromSpan(clip.end.diff(clip.start)).add(position),
  };
};

export const scrollToAndAlign = (
  element: HTMLElement,
  scrollOptions: { top?: number; left?: number },
  align: { top?: number; left?: number }
) => {
  const { top, left } = scrollOptions;
  const { clientHeight, clientWidth, scrollHeight, scrollWidth } = element;

  if (top !== undefined) {
    const maxScrollTop = scrollHeight - clientHeight;
    const alignedTop = top - clientHeight * (align.top || 0);
    element.scrollTop = Math.max(0, Math.min(alignedTop, maxScrollTop));
  }

  if (left !== undefined) {
    const maxScrollLeft = scrollWidth - clientWidth;
    const alignedLeft = left - clientWidth * (align.left || 0);
    element.scrollLeft = Math.max(0, Math.min(alignedLeft, maxScrollLeft));
  }
};

export const timelineEditorWindowScrollThresholds = {
  top: { slow: 25, medium: 50, fast: 100 },
  right: { slow: 50, medium: 100, fast: 200 },
  bottom: { slow: 25, medium: 50, fast: 100 },
  left: { slow: 50, medium: 100, fast: 200 },
};

export const waitForScrollWheelStop = (
  element: HTMLElement,
  callback: () => void
) => {
  let timeout: NodeJS.Timeout;

  const handleScroll = () => {
    clearTimeout(timeout);
    timeout = setTimeout(callback, 150);
  };

  element.addEventListener("scroll", handleScroll, { passive: true });

  return () => element.removeEventListener("scroll", handleScroll);
};
