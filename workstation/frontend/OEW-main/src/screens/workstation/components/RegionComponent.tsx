
/**
 * RegionComponent
 * 
 * A React component that handles the visualization and interaction with timeline regions
 * in the workstation editor. Regions are selectable, resizable areas that can represent
 * things like loop points, song sections, or selection ranges.
 * 
 * Features:
 * - Click and drag to create new regions
 * - Resize regions from either edge
 * - Snap to grid functionality
 * - Auto-scrolling when dragging near viewport edges
 */

import React, { Component, ContextType } from "react";
import { WorkstationContext } from '@orpheus/contexts';
import { Region, TimelinePosition } from '@orpheus/types/core';
import { BASE_BEAT_WIDTH } from "../../../constants/timeline";
import { timelineEditorWindowScrollThresholds } from '@orpheus/utils/utils';
import WindowAutoScroll from "../../../components/WindowAutoScroll";
import { flushSync } from "react-dom";
;

/**
 * Interface for auto-scroll configuration
 */
interface AutoScrollConfig {
  /** Scroll trigger thresholds in pixels from viewport edges */
  thresholds?: { left?: number; right?: number };
}

/** Props interface for RegionComponent */
interface RegionComponentProps {
  /** Enable auto-scrolling when resizing near viewport edges */
  autoScroll?: boolean | AutoScrollConfig;
  /** Content to render inside the region */
  children?: React.ReactNode;
  /** Handler for right-click context menu */
  onContextMenu?: (e: React.MouseEvent<HTMLDivElement>) => void;
  /** Called when region resizing starts */
  onResizeStart?: () => void;
  /** Called during region resize with updated region data */
  onResize?: (region: Region) => void;
  /** Called when region resizing ends */
  onResizeStop?: (region: Region) => void;
  /** Called when region is updated or removed */
  onSetRegion?: (region: Region | null) => void;
  /** Region data containing start and end positions */
  region?: Region | null;
  /** Custom styles to apply to the region element */
  style?: React.CSSProperties;
}

/** State interface for RegionComponent */
interface RegionComponentState {
  /** Whether user is in the process of creating a new region */
  isCreatingNewRegion: boolean;
  /** Current region data */
  region: Region | null;
  /** Which edge is being resized ("start" | "end" | null) */
  resizeEdge: "start" | "end" | null;
  /** Whether region is currently being resized */
  resizing: boolean;
  /** Temporary region data during resize operations */
  temp: Region | null;
}

/**
 * RegionComponent Class
 * 
 * A React component for rendering and managing timeline regions.
 * Supports creation, resizing, and snap-to-grid functionality.
 */
export default class RegionComponent extends Component<RegionComponentProps, RegionComponentState> {
  static contextType = WorkstationContext;
  declare context: NonNullable<ContextType<typeof WorkstationContext>>;
  
  /** Reference to the root DOM element */
  private ref = React.createRef<HTMLDivElement>();

  /**
   * Initialize the component with default state and bind event handlers
   * @param props - Component props
   */
  constructor(props: RegionComponentProps) {
    super(props);

    this.state = {
      isCreatingNewRegion: false,
      region: props.region || null,
      resizeEdge: null,
      resizing: false,
      temp: null
    };

    // Bind methods to preserve 'this' context
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleResizeStart = this.handleResizeStart.bind(this);
  }

  /**
   * Set up global mouse event listeners when component mounts
   */
  componentDidMount() {
    document.addEventListener("mousemove", this.handleMouseMove);
    document.addEventListener("mouseup", this.handleMouseUp);
  }

  /**
   * Update region state when props change
   * @param prevProps - Previous props for comparison
   */
  componentDidUpdate(prevProps: RegionComponentProps) {
    if (prevProps.region !== this.props.region) {
      this.setState({ region: this.props.region || null });
    }
  }

  /**
   * Clean up global event listeners when component unmounts
   */
  componentWillUnmount() {
    document.removeEventListener("mousemove", this.handleMouseMove);
    document.removeEventListener("mouseup", this.handleMouseUp);
  }

  /**
   * Handle mouse down to start creating a new region
   * @param e - Mouse event
   */
  handleMouseDown(e: React.MouseEvent) {
    if (e.button !== 0) return;

    const rect = this.ref.current?.getBoundingClientRect();
    if (!rect) return;

    const margin = e.clientX - rect.left;
    const pos = TimelinePosition.fromMargin(margin);

    this.setState({ 
      isCreatingNewRegion: true, 
      resizeEdge: "end", 
      temp: { 
        start: pos,
        end: pos 
      } 
    });
  }

  /**
   * Handle mouse movement during region creation or resizing
   * @param e - Mouse event
   */
  handleMouseMove(e: MouseEvent) {
    if (this.state.resizeEdge) {
      this.resize(e.movementX, this.state.resizeEdge);
    }
  }

  /**
   * Handle mouse up to finalize region changes
   */
  handleMouseUp() {
    this.setState({ isCreatingNewRegion: false, resizing: false });

    if (!this.state.region) return;

    const startMargin = this.state.region.start.toMargin();
    const endMargin = this.state.region.end.toMargin();

    if (startMargin !== endMargin) {
      const region: Region = {
        start: this.state.region.start,
        end: this.state.region.end
      };

      this.props.onSetRegion?.(region);
    } else {
      this.props.onSetRegion?.(null);
    }
  }

  /**
   * Start resizing the region from a specific edge
   * @param edge - Which edge to resize ("start" or "end")
   */
  handleResizeStart(edge: "start" | "end") {
    if (!this.props.onResizeStart || !this.ref.current || this.state.resizing) return;

    this.setState({ resizing: true, resizeEdge: edge, temp: this.state.region });
    this.props.onResizeStart();
  }

  /**
   * Handle region resizing logic with grid snapping
   * @param x - Mouse movement in x direction
   * @param edge - Which edge is being resized
   */
  resize(x: number, edge: "start" | "end") {
    if (!this.state.temp || !this.context?.timelineSettings) return;

    const { horizontalScale = 1, timeSignature = { noteValue: 4 } } = this.context.timelineSettings;
    const snapWidth = BASE_BEAT_WIDTH * horizontalScale * (4 / timeSignature.noteValue);
    const temp = { ...this.state.temp };
    let region: Region;

    // Handle start edge resizing
    if (edge === "start") {
      const currentMargin = temp.start.toMargin();
      const newPos = TimelinePosition.fromMargin(currentMargin + x);
      temp.start = newPos;
      
      const snappedMargin = snapWidth ? snapWidth * Math.round(newPos.toMargin() / snapWidth) : newPos.toMargin();
      region = { 
        ...temp, 
        start: TimelinePosition.fromMargin(snappedMargin)
      };
    } 
    // Handle end edge resizing
    else {
      const currentMargin = temp.end.toMargin();
      const newPos = TimelinePosition.fromMargin(currentMargin + x);
      temp.end = newPos;
      
      const snappedMargin = snapWidth ? snapWidth * Math.round(newPos.toMargin() / snapWidth) : newPos.toMargin();
      region = {
        ...temp,
        end: TimelinePosition.fromMargin(snappedMargin)
      };
    }

    // Ensure start is always before end
    if (region.start.toMargin() > region.end.toMargin()) {
      const start = region.start;
      region.start = region.end;
      region.end = start;
    }

    flushSync(() => this.setState({ region, temp, resizeEdge: edge }));
    this.props.onResize?.(region);
  }

  /**
   * Render the region component
   * 
   * The region is rendered as a div with resize handles on both ends.
   * When creating a new region or during resize operations, the WindowAutoScroll
   * component enables auto-scrolling when near viewport edges.
   * 
   * Visual feedback is provided through cursor changes and the region's appearance
   * is controlled through CSS classes and inline styles.
   */
  render() {
    const show = this.state.isCreatingNewRegion || this.props.region;

    if (!show || !this.state.region) return null;

    const startMargin = this.state.region.start.toMargin();
    const endMargin = this.state.region.end.toMargin();

    return (
      <>
        <WindowAutoScroll
          active={this.state.isCreatingNewRegion || this.state.resizing}
          eventType="drag"
          thresholds={timelineEditorWindowScrollThresholds}
          onScroll={(by: number) => this.resize(by, this.state.resizeEdge || "end")}
        />
        <div
          className="region pe-none"
          ref={this.ref}
          onContextMenu={this.props.onContextMenu}
          style={{
            cursor: !this.state.isCreatingNewRegion && !this.state.resizing ? "default" : "",
            height: "100%",
            left: startMargin,
            position: "absolute",
            width: endMargin - startMargin,
            ...this.props.style
          }}
        >
          {this.props.region && !this.state.isCreatingNewRegion && (
            <div className="d-flex h-100">
              {/* Left resize handle */}
              <div
                className="pe-auto resize-handle"
                onMouseDown={() => this.handleResizeStart("start")}
                style={{ cursor: "e-resize", width: 5 }}
              />
              {/* Region content */}
              <div className="flex-grow-1">
                {this.props.children}
              </div>
              {/* Right resize handle */}
              <div
                className="pe-auto resize-handle"
                onMouseDown={() => this.handleResizeStart("end")}
                style={{ cursor: "e-resize", width: 5 }}
              />
            </div>
          )}
        </div>
      </>
    );
  }
}