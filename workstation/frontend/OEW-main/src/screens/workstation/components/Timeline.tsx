import React, { useRef, useEffect, useState, useContext } from 'react';
import { WorkstationContext, WorkstationContextType } from '../../../contexts/WorkstationContext';
import { TimelinePosition, Track, TrackType } from '../../../types/core';

export interface TimelineProps {
  className?: string;
  width?: number;
  height?: number;
  tracks?: Track[];
  currentPosition?: TimelinePosition;
  zoom?: number;
  onPositionChange?: (position: TimelinePosition) => void;
  onZoomChange?: (zoom: number) => void;
  onTrackSelect?: (trackId: string) => void;
  onSelectionChange?: (selection: { start: TimelinePosition; end: TimelinePosition } | null) => void;
  pixelsPerSecond?: number;
}

export const Timeline: React.FC<TimelineProps> = ({
  className = '',
  width = 800,
  height = 400,
  tracks = [],
  currentPosition = new TimelinePosition(0, 0, 0),
  zoom = 1,
  onPositionChange,
  onZoomChange,
  onTrackSelect,
  onSelectionChange,
  pixelsPerSecond = 50
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selection, setSelection] = useState<{ start: TimelinePosition; end: TimelinePosition } | null>(null);
  const [playheadPosition, setPlayheadPosition] = useState(currentPosition);
  
  const context = useContext(WorkstationContext) as WorkstationContextType | null;

  // Update playhead position when currentPosition prop changes
  useEffect(() => {
    setPlayheadPosition(currentPosition);
  }, [currentPosition]);

  // Render timeline
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw background
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, width, height);

    // Draw time ruler
    drawTimeRuler(ctx, width, height, zoom, pixelsPerSecond);

    // Draw tracks
    tracks.forEach((track, index) => {
      drawTrack(ctx, track, index, width, height, zoom, pixelsPerSecond);
    });

    // Draw playhead
    drawPlayhead(ctx, playheadPosition, height, zoom, pixelsPerSecond);

    // Draw selection
    if (selection) {
      drawSelection(ctx, selection, height, zoom, pixelsPerSecond);
    }
  }, [width, height, tracks, zoom, playheadPosition, selection, pixelsPerSecond]);

  const drawTimeRuler = (ctx: CanvasRenderingContext2D, w: number, h: number, z: number, pps: number) => {
    ctx.fillStyle = '#333';
    ctx.fillRect(0, 0, w, 30);

    ctx.strokeStyle = '#555';
    ctx.lineWidth = 1;

    // Draw time markers
    const secondWidth = pps * z;
    const visibleSeconds = Math.ceil(w / secondWidth);

    for (let i = 0; i <= visibleSeconds; i++) {
      const x = i * secondWidth;
      
      // Draw major tick (seconds)
      ctx.beginPath();
      ctx.moveTo(x, 20);
      ctx.lineTo(x, 30);
      ctx.stroke();

      // Draw time label
      ctx.fillStyle = '#aaa';
      ctx.font = '12px monospace';
      ctx.fillText(`${i}s`, x + 2, 18);
    }
  };

  const drawTrack = (ctx: CanvasRenderingContext2D, track: Track, index: number, w: number, h: number, z: number, pps: number) => {
    const trackHeight = (h - 30) / Math.max(tracks.length, 1);
    const y = 30 + index * trackHeight;

    // Draw track background
    ctx.fillStyle = track.id === context?.selectedClipId ? '#2a4d3a' : '#2a2a2a';
    ctx.fillRect(0, y, w, trackHeight);

    // Draw track border
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, y, w, trackHeight);

    // Draw track name
    ctx.fillStyle = '#fff';
    ctx.font = '14px Arial';
    ctx.fillText(track.name, 10, y + trackHeight / 2 + 5);

    // Draw clips
    track.clips?.forEach(clip => {
      const clipX = clip.startTime * pps * z;
      const clipWidth = clip.duration * pps * z;
      
      // Draw clip background
      ctx.fillStyle = '#4a90e2';
      ctx.fillRect(clipX, y + 5, clipWidth, trackHeight - 10);

      // Draw clip border
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1;
      ctx.strokeRect(clipX, y + 5, clipWidth, trackHeight - 10);

      // Draw clip name
      ctx.fillStyle = '#fff';
      ctx.font = '12px Arial';
      ctx.fillText(clip.name, clipX + 5, y + trackHeight / 2 + 3);
    });
  };

  const drawPlayhead = (ctx: CanvasRenderingContext2D, position: TimelinePosition, h: number, z: number, pps: number) => {
    const x = position.toSeconds() * pps * z;
    
    ctx.strokeStyle = '#ff4444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();

    // Draw playhead handle
    ctx.fillStyle = '#ff4444';
    ctx.fillRect(x - 5, 0, 10, 20);
  };

  const drawSelection = (ctx: CanvasRenderingContext2D, sel: { start: TimelinePosition; end: TimelinePosition }, h: number, z: number, pps: number) => {
    const startX = sel.start.toSeconds() * pps * z;
    const endX = sel.end.toSeconds() * pps * z;
    
    ctx.fillStyle = 'rgba(255, 255, 0, 0.2)';
    ctx.fillRect(startX, 30, endX - startX, h - 30);

    ctx.strokeStyle = '#ffff00';
    ctx.lineWidth = 1;
    ctx.strokeRect(startX, 30, endX - startX, h - 30);
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Convert pixel position to time
    const seconds = x / (pixelsPerSecond * zoom);
    const newPosition = TimelinePosition.fromSeconds(seconds);

    // Check if clicking on a track
    const trackHeight = (height - 30) / Math.max(tracks.length, 1);
    const trackIndex = Math.floor(y / trackHeight);
    
    if (trackIndex < tracks.length) {
      onTrackSelect?.(tracks[trackIndex].id);
    }

    // Update playhead position
    setPlayheadPosition(newPosition);
    onPositionChange?.(newPosition);
  };

  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    handleCanvasClick(event);
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    handleCanvasClick(event);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        const currentSeconds = playheadPosition.toSeconds();
        const prevPosition = TimelinePosition.fromSeconds(Math.max(0, currentSeconds - 1));
        setPlayheadPosition(prevPosition);
        onPositionChange?.(prevPosition);
        break;
      
      case 'ArrowRight':
        event.preventDefault();
        const nextSeconds = playheadPosition.toSeconds();
        const nextPosition = TimelinePosition.fromSeconds(nextSeconds + 1);
        setPlayheadPosition(nextPosition);
        onPositionChange?.(nextPosition);
        break;
      
      case ' ':
        event.preventDefault();
        // context?.togglePlayback();
        break;
      
      case 'Home':
        event.preventDefault();
        const homePosition = new TimelinePosition(0, 0, 0);
        setPlayheadPosition(homePosition);
        onPositionChange?.(homePosition);
        break;
    }
  };

  const handleWheel = (event: React.WheelEvent) => {
    event.preventDefault();
    const zoomDelta = event.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.1, Math.min(10, zoom * zoomDelta));
    onZoomChange?.(newZoom);
  };

  return (
    <div className={`timeline ${className}`} style={{ position: 'relative' }}>
      {/* Time Ruler */}
      <div data-testid="time-ruler" style={{ height: '30px', background: '#333', position: 'relative' }}>
        {Array.from({ length: Math.ceil(width / (pixelsPerSecond * zoom)) + 1 }, (_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${i * pixelsPerSecond * zoom}px`,
              top: '20px',
              height: '10px',
              borderLeft: '1px solid #555',
              fontSize: '12px',
              color: '#aaa',
              paddingLeft: '2px'
            }}
          >
            {i}
          </div>
        ))}
      </div>

      {/* Timeline Content Area */}
      <div 
        data-testid="timeline-content"
        style={{ position: 'relative', height: `${height - 30}px`, overflow: 'hidden' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onKeyDown={handleKeyDown}
        onWheel={handleWheel}
        tabIndex={0}
      >
        {/* Canvas for visual rendering */}
        <canvas
          ref={canvasRef}
          width={width}
          height={height - 30}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            backgroundColor: '#1a1a1a',
            cursor: isDragging ? 'grabbing' : 'crosshair',
            pointerEvents: 'none'
          }}
          data-testid="timeline-canvas"
        />

        {/* Playhead */}
        <div
          data-testid="timeline-playhead"
          style={{
            position: 'absolute',
            left: `${playheadPosition.toSeconds() * pixelsPerSecond * zoom}px`,
            top: 0,
            width: '2px',
            height: '100%',
            backgroundColor: '#ff6b6b',
            pointerEvents: 'none',
            zIndex: 10
          }}
        />

        {/* Snap Grid */}
        {context?.timelineSettings && (
          <div data-testid="snap-grid" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
            {Array.from({ length: Math.ceil(width / (context.timelineSettings.beatWidth || 64)) }, (_, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: `${i * (context.timelineSettings.beatWidth || 64)}px`,
                  top: 0,
                  width: '1px',
                  height: '100%',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)'
                }}
              />
            ))}
          </div>
        )}

        {/* Track Elements */}
        {tracks.map((track, index) => {
          const trackHeight = (height - 30) / Math.max(tracks.length, 1);
          const y = index * trackHeight;
          
          return (
            <div
              key={track.id}
              data-testid={`track-${track.id}`}
              style={{
                position: 'absolute',
                top: `${y}px`,
                left: 0,
                width: '100%',
                height: `${trackHeight}px`,
                border: '1px solid #444',
                backgroundColor: track.id === context?.selectedClipId ? '#2a4d3a' : '#2a2a2a',
                display: 'flex',
                alignItems: 'center',
                padding: '0 10px'
              }}
              onContextMenu={(e) => {
                e.preventDefault();
                // Show context menu
                const menu = document.createElement('div');
                menu.setAttribute('data-testid', 'track-context-menu');
                menu.style.position = 'fixed';
                menu.style.background = '#333';
                menu.style.border = '1px solid #555';
                menu.style.padding = '5px';
                menu.style.left = `${e.clientX}px`;
                menu.style.top = `${e.clientY}px`;
                menu.style.zIndex = '1000';
                menu.textContent = 'Track Menu';
                document.body.appendChild(menu);
                
                const removeMenu = () => {
                  if (document.body.contains(menu)) {
                    document.body.removeChild(menu);
                  }
                  document.removeEventListener('click', removeMenu);
                };
                
                setTimeout(() => document.addEventListener('click', removeMenu), 100);
              }}
              onClick={() => onTrackSelect?.(track.id)}
            >
              <span style={{ color: '#fff', marginRight: '10px' }}>{track.name}</span>
              
              {/* Mute Button */}
              <button
                data-testid={`track-${track.id}-mute`}
                style={{
                  marginRight: '5px',
                  padding: '2px 6px',
                  background: track.mute ? '#ff6b6b' : '#555',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '3px',
                  fontSize: '12px'
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  // TODO: Implement track mute functionality
                  console.log('Toggle mute for track:', track.id);
                }}
              >
                M
              </button>

              {/* Solo Button */}
              <button
                data-testid={`track-${track.id}-solo`}
                style={{
                  padding: '2px 6px',
                  background: track.solo ? '#ffd93d' : '#555',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '3px',
                  fontSize: '12px'
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  // TODO: Implement track solo functionality
                  console.log('Toggle solo for track:', track.id);
                }}
              >
                S
              </button>
            </div>
          );
        })}
      </div>

      {/* Add Track Button */}
      <div style={{ padding: '10px' }}>
        <button
          data-testid="add-track-button"
          style={{
            padding: '8px 16px',
            background: '#4a9eff',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
          onClick={() => context?.addTrack?.('audio')}
        >
          Add Track
        </button>
      </div>
    </div>
  );
};

export default Timeline;
