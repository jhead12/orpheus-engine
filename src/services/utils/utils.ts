import {
  Clip,
  TimelinePosition,
  AutomationLane,
  AutomationLaneEnvelope,
} from "../../types/core";
import { sliceClip as sliceClipFn } from "./clipUtils";

// Re-export sliceClip from clipUtils
export const sliceClip = sliceClipFn;

// Timeline constants
export const BASE_BEAT_WIDTH = 80;
export const BASE_HEIGHT = 100;
export const GRID_MIN_INTERVAL_WIDTH = 34;

// Scroll thresholds interface
export interface TimelineEditorWindowScrollThresholds {
  top: { slow: number; medium: number; fast: number };
  right: { slow: number; medium: number; fast: number };
  bottom: { slow: number; medium: number; fast: number };
  left: { slow: number; medium: number; fast: number };
}

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

// Window scroll thresholds
export const timelineEditorWindowScrollThresholds: TimelineEditorWindowScrollThresholds =
  {
    top: { slow: 25, medium: 50, fast: 100 },
    right: { slow: 50, medium: 100, fast: 200 },
    bottom: { slow: 25, medium: 50, fast: 100 },
    left: { slow: 50, medium: 100, fast: 200 },
  };

// Track file format validation
export const isValidTrackFileFormat = (type: string): boolean => {
  return isValidAudioTrackFileFormat(type) || type === "audio/midi";
};

// Volume utility functions
export const volumeToNormalized = (volume: number): number => {
  // Convert volume from dB to normalized value (0-1)
  if (volume <= -60) return 0;
  if (volume >= 0) return 1;
  return Math.pow(10, volume / 20);
};

export const normalizedToVolume = (normalized: number): number => {
  // Convert normalized value (0-1) to dB
  if (normalized <= 0) return -60;
  if (normalized >= 1) return 0;
  return 20 * Math.log10(normalized);
};

export const formatVolume = (volume: number): string => {
  if (volume <= -60) return "-∞ dB";
  return `${volume.toFixed(1)} dB`;
};

export const formatPanning = (panning: number, shortFormat?: boolean): string => {
  if (panning === 0) return "C";
  const percentage = Math.abs(panning * 100);
  const formattedPercentage = shortFormat ? percentage.toFixed(0) : percentage.toFixed(1);
  if (panning < 0) return `L${formattedPercentage}`;
  return `R${formattedPercentage}`;
};

export const getVolumeGradient = (volume: number): string => {
  const normalized = volumeToNormalized(volume);
  if (normalized < 0.1) return "linear-gradient(to right, #ff4444, #ff6666)";
  if (normalized < 0.5) return "linear-gradient(to right, #ffaa44, #ffcc66)";
  if (normalized < 0.8) return "linear-gradient(to right, #44ff44, #66ff66)";
  return "linear-gradient(to right, #44ff44, #88ff44)";
};

export const clipAtPos = (position: TimelinePosition, clip: Clip): Clip => {
  const duration = clip.end.toTicks() - clip.start.toTicks();
  const endPosition = TimelinePosition.fromTicks(position.toTicks() + duration);

  return {
    ...clip,
    start: position,
    end: endPosition,
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

export const removeAllClipOverlap = (clips: Clip[], newClip?: Clip): Clip[] => {
  if (!newClip) return clips;

  // Remove any clips that overlap with the new clip
  return clips
    .filter((clip) => {
      if (clip.id === newClip.id) return false;

      // Check if clips overlap
      const clipStart = clip.start.toTicks();
      const clipEnd = clip.end.toTicks();
      const newClipStart = newClip.start.toTicks();
      const newClipEnd = newClip.end.toTicks();

      // No overlap if one clip ends before the other starts
      return clipEnd <= newClipStart || newClipEnd <= clipStart;
    })
    .concat([newClip]);
};

export const getLaneColor = (
  lanes: AutomationLane[],
  idx: number,
  defaultColor: string
): string => {
  if (!lanes || !lanes.length) return defaultColor;
  const visibleLanes = lanes.filter((lane) => lane.show);
  return idx >= 0 && idx < visibleLanes.length ? defaultColor : "transparent";
};

export const automatedValueAtPos = (
  position: TimelinePosition,
  automationLane: AutomationLane
): number => {
  if (
    !automationLane ||
    !automationLane.nodes ||
    automationLane.nodes.length === 0
  ) {
    // Return a default value based on the envelope type
    switch (automationLane.envelope) {
      case AutomationLaneEnvelope.Volume:
        return 0; // 0 dB
      case AutomationLaneEnvelope.Pan:
        return 0; // Center
      case AutomationLaneEnvelope.Tempo:
        return 120; // Default tempo
      default:
        return 0;
    }
  }

  const positionTicks = position.toTicks();
  const nodes = automationLane.nodes.sort(
    (a, b) => a.pos.toTicks() - b.pos.toTicks()
  );

  // Find the nodes surrounding this position
  let beforeNode = null;
  let afterNode = null;

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const nodeTicks = node.pos.toTicks();

    if (nodeTicks <= positionTicks) {
      beforeNode = node;
    } else {
      afterNode = node;
      break;
    }
  }

  // If we're before the first node, return default value
  if (!beforeNode) {
    switch (automationLane.envelope) {
      case AutomationLaneEnvelope.Volume:
        return 0;
      case AutomationLaneEnvelope.Pan:
        return 0;
      case AutomationLaneEnvelope.Tempo:
        return 120;
      default:
        return 0;
    }
  }

  // If we're after the last node, use the last node's value
  if (!afterNode) {
    return beforeNode.value;
  }

  // Interpolate between the two nodes
  const beforeTicks = beforeNode.pos.toTicks();
  const afterTicks = afterNode.pos.toTicks();
  const progress = (positionTicks - beforeTicks) / (afterTicks - beforeTicks);

  return beforeNode.value + (afterNode.value - beforeNode.value) * progress;
};
