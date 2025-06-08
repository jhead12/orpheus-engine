import React, { useEffect, useRef, useState } from "react";

interface ScrollbarProps {
  axis: "x" | "y";
  style?: React.CSSProperties;
  targetEl: HTMLElement | null;
  thumbStyle?: React.CSSProperties;
}

const Scrollbar: React.FC<ScrollbarProps> = ({
  axis,
  style,
  targetEl,
  thumbStyle,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState(0);
  const [startScroll, setStartScroll] = useState(0);
  const thumbRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRatioRef = useRef(1);

  useEffect(() => {
    const handleTargetScroll = () => {
      if (!targetEl || !thumbRef.current) return;

      const contentSize =
        axis === "y" ? targetEl.scrollHeight : targetEl.scrollWidth;
      const viewportSize =
        axis === "y" ? targetEl.clientHeight : targetEl.clientWidth;
      const maxScroll = contentSize - viewportSize;

      if (maxScroll <= 0) return;

      const scrollPercent =
        axis === "y"
          ? targetEl.scrollTop / maxScroll
          : targetEl.scrollLeft / maxScroll;

      thumbRef.current.style[axis === "y" ? "top" : "left"] = `${
        scrollPercent * 100
      }%`;
    };

    // Set up scroll event handling
    targetEl?.addEventListener("scroll", handleTargetScroll);
    // Calculate initial thumb position
    requestAnimationFrame(() => {
      requestAnimationFrame(handleTargetScroll);
    });

    return () => targetEl?.removeEventListener("scroll", handleTargetScroll);
  }, [targetEl, axis]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!targetEl || !containerRef.current) return;

    e.preventDefault();
    setIsDragging(true);

    const currentPos = axis === "y" ? e.clientY : e.clientX;
    setStartPos(currentPos);
    setStartScroll(axis === "y" ? targetEl.scrollTop : targetEl.scrollLeft);

    // Calculate drag ratio based on content and viewport sizes
    const contentSize =
      axis === "y" ? targetEl.scrollHeight : targetEl.scrollWidth;
    const viewportSize =
      axis === "y" ? targetEl.clientHeight : targetEl.clientWidth;
    const trackSize =
      axis === "y"
        ? containerRef.current.clientHeight
        : containerRef.current.clientWidth;

    dragRatioRef.current = (contentSize - viewportSize) / trackSize;

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !targetEl) return;

    e.preventDefault();

    const currentPos = axis === "y" ? e.clientY : e.clientX;
    const movementDelta = currentPos - startPos;
    const newScroll = startScroll + movementDelta * dragRatioRef.current;

    const contentSize =
      axis === "y" ? targetEl.scrollHeight : targetEl.scrollWidth;
    const viewportSize =
      axis === "y" ? targetEl.clientHeight : targetEl.clientWidth;
    const maxScroll = contentSize - viewportSize;

    // Clamp the scroll position
    const clampedScroll = Math.max(0, Math.min(newScroll, maxScroll));

    // Apply the scroll
    if (axis === "y") {
      targetEl.scrollTop = clampedScroll;
    } else {
      targetEl.scrollLeft = clampedScroll;
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (!targetEl) return;

    e.preventDefault();
    const delta = axis === "y" ? e.deltaY : e.deltaX;

    if (axis === "y") {
      targetEl.scrollTop += delta;
    } else {
      targetEl.scrollLeft += delta;
    }
  };

  // Calculate thumb size based on viewport to content ratio
  const getThumbSize = () => {
    if (!targetEl) return "0%";

    const contentSize =
      axis === "y" ? targetEl.scrollHeight : targetEl.scrollWidth;
    const viewportSize =
      axis === "y" ? targetEl.clientHeight : targetEl.clientWidth;

    return `${Math.max((viewportSize / contentSize) * 100, 10)}%`;
  };

  return (
    <div
      ref={containerRef}
      data-testid="scrollbar"
      className={`scrollbar ${axis}`}
      style={Object.assign(
        {
          display: "block",
          position: "relative",
          overflow: "hidden",
          padding: 0,
          margin: 0,
        },
        style || {}
      )}
      onWheel={handleWheel}
      role="scrollbar"
      aria-orientation={axis === "y" ? "vertical" : "horizontal"}
      aria-controls={targetEl?.id}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={
        targetEl
          ? Math.round(
              ((axis === "y" ? targetEl.scrollTop : targetEl.scrollLeft) /
                (axis === "y"
                  ? targetEl.scrollHeight - targetEl.clientHeight
                  : targetEl.scrollWidth - targetEl.clientWidth)) *
                100
            )
          : 0
      }
    >
      <div
        ref={thumbRef}
        className="scrollbar-thumb"
        role="slider"
        style={Object.assign(
          {
            position: "absolute",
            backgroundColor: thumbStyle?.backgroundColor || "#00000040",
            borderRadius: "4px",
            ...(axis === "y"
              ? {
                  top: "0",
                  width: "100%",
                  height: getThumbSize(),
                }
              : {
                  left: "0",
                  height: "100%",
                  width: getThumbSize(),
                }),
            transition: isDragging ? "none" : "top 0.1s, left 0.1s",
          },
          thumbStyle || {}
        )}
        onMouseDown={handleMouseDown}
      />
    </div>
  );
};

export default Scrollbar;
