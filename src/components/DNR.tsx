import React, { Component, createRef, CSSProperties, forwardRef } from "react";

export interface Coords {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

export interface DNRData {
  coords: Coords;
  width: number;
  height: number;
  delta: { x: number; y: number };
}

export interface DNRProps {
  allowAnyClick?: boolean;
  className?: string;
  children?: React.ReactNode;
  bounds?: { left?: number; top?: number; right?: number; bottom?: number };
  coords: Coords;
  drag?: boolean;
  dragAxis?: "x" | "y" | "both";
  maxHeight?: number;
  maxWidth?: number;
  minHeight?: number;
  minWidth?: number;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  onContextMenu?: (e: React.MouseEvent<HTMLDivElement>) => void;
  onDoubleClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  onDrag?: (data: DNRData) => void;
  onDragMouseMove?: (e: MouseEvent, data: DNRData) => void;
  onDragStart?: (e: React.MouseEvent<HTMLDivElement>, data: DNRData) => void;
  onDragStop?: (e: MouseEvent, data: DNRData) => void;
  onMouseDown?: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseEnter?: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseLeave?: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseOver?: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseOut?: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseUp?: (e: React.MouseEvent<HTMLDivElement>) => void;
  onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
  onWheel?: (e: React.WheelEvent<HTMLDivElement>) => void;
  onResize?: (
    data: DNRData & { edge: { x: "left" | "right"; y: "top" | "bottom" } }
  ) => void;
  position?: { x: number; y: number };
  resize?:
    | boolean
    | {
        top?: boolean;
        right?: boolean;
        bottom?: boolean;
        left?: boolean;
        bottomRight?: boolean;
      };
  resizeAxis?: "x" | "y" | "both";
  scale?: number;
  style?: CSSProperties;
}

interface DNRState {
  dragging: boolean;
  resizing: boolean;
  lastX: number;
  lastY: number;
  startWidth: number;
  startHeight: number;
}

class DNRBase extends Component<DNRProps, DNRState> {
  static defaultProps = {
    allowAnyClick: false,
    drag: true,
    dragAxis: "both",
    resize: true,
    resizeAxis: "both",
    scale: 1,
  };

  private readonly containerRef: React.RefObject<HTMLDivElement>;

  constructor(props: DNRProps) {
    super(props);
    this.containerRef = createRef();
    this.state = {
      dragging: false,
      resizing: false,
      lastX: 0,
      lastY: 0,
      startWidth: 0,
      startHeight: 0,
    };
  }

  componentWillUnmount() {
    this.removeListeners();
  }

  private applyBoundsConstraints(
    x: number,
    y: number
  ): { x: number; y: number } {
    const { bounds } = this.props;
    if (!bounds) return { x, y };

    const container = this.containerRef.current;
    if (!container) return { x, y };

    const { width, height } = container.getBoundingClientRect();
    const currentTransform = new DOMMatrix(
      window.getComputedStyle(container).transform
    );
    const currentX = currentTransform.m41;
    const currentY = currentTransform.m42;

    let constrainedX = x;
    let constrainedY = y;

    if (bounds.left !== undefined && currentX + x < bounds.left) {
      constrainedX = bounds.left - currentX;
    }
    if (bounds.right !== undefined && currentX + x + width > bounds.right) {
      constrainedX = bounds.right - width - currentX;
    }
    if (bounds.top !== undefined && currentY + y < bounds.top) {
      constrainedY = bounds.top - currentY;
    }
    if (bounds.bottom !== undefined && currentY + y + height > bounds.bottom) {
      constrainedY = bounds.bottom - height - currentY;
    }

    return { x: constrainedX, y: constrainedY };
  }

  private applySizeConstraints(
    width: number,
    height: number
  ): { width: number; height: number } {
    const { minWidth, maxWidth, minHeight, maxHeight } = this.props;

    let constrainedWidth = width;
    let constrainedHeight = height;

    if (minWidth !== undefined) {
      constrainedWidth = Math.max(minWidth, width);
    }
    if (maxWidth !== undefined) {
      constrainedWidth = Math.min(maxWidth, width);
    }
    if (minHeight !== undefined) {
      constrainedHeight = Math.max(minHeight, height);
    }
    if (maxHeight !== undefined) {
      constrainedHeight = Math.min(maxHeight, height);
    }

    return { width: constrainedWidth, height: constrainedHeight };
  }

  private handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const { allowAnyClick, drag, resize, onMouseDown, onDragStart } =
      this.props;

    if (onMouseDown) {
      onMouseDown(e);
    }

    // Only handle left clicks unless allowAnyClick is true
    if (!allowAnyClick && e.button !== 0) return;

    const container = this.containerRef.current;
    if (!container) return;

    const { width, height } = container.getBoundingClientRect();
    const isResizeHandle = (e.target as HTMLElement).classList.contains(
      "dnr-resize-handle"
    );

    if ((resize && isResizeHandle) || drag) {
      e.preventDefault();

      this.setState(
        {
          lastX: e.clientX,
          lastY: e.clientY,
          startWidth: width,
          startHeight: height,
          dragging: !isResizeHandle,
          resizing: isResizeHandle,
        },
        () => {
          document.addEventListener("mousemove", this.handleMouseMove);
          document.addEventListener("mouseup", this.handleMouseUp);

          if (!isResizeHandle && onDragStart) {
            const data = this.createDNRData(e.clientX, e.clientY);
            onDragStart(e, data);
          }
        }
      );
    }
  };

  private handleMouseMove = (e: MouseEvent) => {
    const { dragging, resizing, lastX, lastY } = this.state;
    if (!dragging && !resizing) return;

    const { dragAxis, resizeAxis, onDrag, onResize, onDragMouseMove } =
      this.props;
    const deltaX = e.clientX - lastX;
    const deltaY = e.clientY - lastY;

    if (dragging) {
      const container = this.containerRef.current;
      if (!container) return;

      const { x, y } = this.getDragPosition(deltaX, deltaY, dragAxis);
      const { x: boundedX, y: boundedY } = this.applyBoundsConstraints(x, y);

      container.style.transform = `translate(${boundedX}px, ${boundedY}px)`;

      if (onDrag || onDragMouseMove) {
        const data = this.createDNRData(e.clientX, e.clientY);
        onDrag?.(data);
        onDragMouseMove?.(e, data);
      }
    } else if (resizing) {
      const container = this.containerRef.current;
      if (!container) return;

      const { width, height } = this.getResizeSize(deltaX, deltaY, resizeAxis);
      const { width: constrainedWidth, height: constrainedHeight } =
        this.applySizeConstraints(width, height);

      container.style.width = `${constrainedWidth}px`;
      container.style.height = `${constrainedHeight}px`;

      if (onResize) {
        const resizeData = {
          ...this.createDNRData(e.clientX, e.clientY),
          edge: {
            x: "right" as const,
            y: "bottom" as const,
          },
        };
        onResize(resizeData);
      }
    }

    this.setState({
      lastX: e.clientX,
      lastY: e.clientY,
    });
  };

  private handleMouseUp = (e: MouseEvent) => {
    const { onDragStop } = this.props;
    const { dragging, resizing } = this.state;

    if (dragging || resizing) {
      if (onDragStop) {
        const data = this.createDNRData(e.clientX, e.clientY);
        onDragStop(e, data);
      }

      this.setState({
        dragging: false,
        resizing: false,
      });
      this.removeListeners();
    }
  };

  private removeListeners() {
    document.removeEventListener("mousemove", this.handleMouseMove);
    document.removeEventListener("mouseup", this.handleMouseUp);
  }

  private getDragPosition(
    deltaX: number,
    deltaY: number,
    axis?: "x" | "y" | "both"
  ): { x: number; y: number } {
    const container = this.containerRef.current;
    if (!container) return { x: 0, y: 0 };

    const computedStyle = window.getComputedStyle(container);
    const transform = computedStyle.transform;

    let currentX = 0;
    let currentY = 0;

    if (transform && transform !== "none") {
      try {
        const matrix = new DOMMatrix(transform);
        currentX = matrix.m41;
        currentY = matrix.m42;
      } catch (e) {
        // Safe fallback for matrix parsing
        const matches = transform.match(
          /matrix\(([-\d.]+,\s*[-\d.]+,\s*[-\d.]+,\s*[-\d.]+,\s*[-\d.]+,\s*[-\d.]+)\)/
        );
        if (matches && matches[1]) {
          const values = matches[1].split(",").map((v) => parseFloat(v.trim()));
          currentX = values[4] || 0;
          currentY = values[5] || 0;
        }
      }
    }

    let x = currentX;
    let y = currentY;

    if (axis === "both" || axis === "x") {
      x += deltaX;
    }
    if (axis === "both" || axis === "y") {
      y += deltaY;
    }

    return { x, y };
  }

  private getResizeSize(
    deltaX: number,
    deltaY: number,
    axis?: "x" | "y" | "both"
  ): { width: number; height: number } {
    const { startWidth, startHeight } = this.state;

    let width = startWidth;
    let height = startHeight;

    if (axis === "both" || axis === "x") {
      width += deltaX;
    }
    if (axis === "both" || axis === "y") {
      height += deltaY;
    }

    return { width, height };
  }

  private createDNRData(clientX: number, clientY: number): DNRData {
    const container = this.containerRef.current;
    if (!container) {
      throw new Error("Container ref not set");
    }

    const { left, top, width, height } = container.getBoundingClientRect();
    const { lastX, lastY } = this.state;

    return {
      coords: {
        startX: left,
        startY: top,
        endX: left + width,
        endY: top + height,
      },
      width,
      height,
      delta: {
        x: clientX - lastX,
        y: clientY - lastY,
      },
    };
  }

  render() {
    const {
      children,
      className,
      style,
      coords,
      position,
      // These event handlers are handled by our custom handlers
      onDrag: _onDrag,
      onDragMouseMove: _onDragMouseMove,
      onDragStart: _onDragStart,
      onDragStop: _onDragStop,
      onResize: _onResize,
      // Don't spread these to DOM
      drag: _drag,
      resize: _resize,
      dragAxis: _dragAxis,
      resizeAxis: _resizeAxis,
      bounds: _bounds,
      minWidth: _minWidth,
      maxWidth: _maxWidth,
      minHeight: _minHeight,
      maxHeight: _maxHeight,
      scale: _scale,
      allowAnyClick: _allowAnyClick,
      ...rest
    } = this.props;

    const finalClassName = `dnr-container ${className || ""}`;
    const finalTransform = position
      ? `translate(${position.x}px, ${position.y}px)`
      : coords
      ? `translate(${coords.startX}px, ${coords.startY}px)`
      : undefined;

    const finalStyle = {
      position: "absolute" as const,
      userSelect: "none" as const,
      transform: finalTransform,
      width: coords ? `${coords.endX - coords.startX}px` : undefined,
      height: coords ? `${coords.endY - coords.startY}px` : undefined,
      ...style,
    };

    return (
      <div
        ref={this.containerRef}
        className={finalClassName}
        style={finalStyle}
        onMouseDown={this.handleMouseDown}
        {...rest}
      >
        {children}
        <div
          className="dnr-resize-handle"
          style={{
            position: "absolute",
            right: "-5px",
            bottom: "-5px",
            width: "10px",
            height: "10px",
            cursor: "nwse-resize",
            backgroundColor: "transparent",
          }}
        />
      </div>
    );
  }
}

const DNR = forwardRef<HTMLDivElement, DNRProps>((props, ref) => {
  return (
    <div ref={ref}>
      <DNRBase {...props} />
    </div>
  );
});

DNR.displayName = "DNR";

export default DNR;
