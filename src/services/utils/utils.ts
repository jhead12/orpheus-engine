import { Clip, TimelinePosition } from "../types/types";

export const BASE_HEIGHT = 100;

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
  top: { size: 50, speed: 1 },
  right: { size: 100, speed: 1 },
  bottom: { size: 50, speed: 1 },
  left: { size: 100, speed: 1 },
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
