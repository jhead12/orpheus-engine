import React, { useRef, useEffect, useCallback } from 'react';
import { Box } from '@mui/material';
import { useDAW } from '../../contexts/DAWContext';
import { TimelinePosition, TimelineSettings } from '../../services/types/types';

interface TimelineProps {
  width: number;
  height: number;
  position: TimelinePosition;
  zoom: number;
  onPositionChange: (position: TimelinePosition) => void;
  snapEnabled?: boolean;
  snapGridSize?: number;
  isPlaying?: boolean;
  timelineSettings?: TimelineSettings;
}

const Timeline: React.FC<TimelineProps> = ({
  width,
  height,
  position,
  zoom,
  onPositionChange,
  snapEnabled = true,
  snapGridSize = 1,
  isPlaying = false,
  timelineSettings = {
    timeSignature: { beats: 4, noteValue: 4 },
    tempo: 120,
    horizontalScale: 1
  }
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDragging = useRef(false);
  const lastMouseX = useRef<number>(0);

  // Draw the timeline grid and markings
  const drawTimeline = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, width, height);
    
    const beatWidth = 100 * zoom;
    const beatsPerBar = timelineSettings.timeSignature.beats;
    const barWidth = beatWidth * beatsPerBar;
    const subdivisions = 4; // 16th notes
    const subdivisionWidth = beatWidth / subdivisions;
    
    // Draw background
    const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
    bgGradient.addColorStop(0, '#2a2a2a');
    bgGradient.addColorStop(1, '#1a1a1a');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);
    
    // Draw grid lines
    for (let x = 0; x < width; x += barWidth) {
      // Draw bar lines (thick)
      ctx.beginPath();
      ctx.strokeStyle = '#666';
      ctx.lineWidth = 2;
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
      
      // Draw bar numbers
      ctx.fillStyle = '#888';
      ctx.font = '12px Inter';
      ctx.textAlign = 'left';
      ctx.fillText((x / barWidth).toString(), x + 4, 15);
      
      // Draw beat lines within each bar
      for (let beat = 1; beat < beatsPerBar; beat++) {
        const beatX = x + beat * beatWidth;
        ctx.beginPath();
        ctx.strokeStyle = '#444';
        ctx.lineWidth = 1;
        ctx.moveTo(beatX, height * 0.3);
        ctx.lineTo(beatX, height);
        ctx.stroke();
      }
      
      // Draw subdivision lines
      for (let sub = 0; sub < beatsPerBar * subdivisions; sub++) {
        const subX = x + sub * subdivisionWidth;
        if (subX % beatWidth !== 0) { // Skip if it's already a beat line
          ctx.beginPath();
          ctx.strokeStyle = '#333';
          ctx.lineWidth = 0.5;
          ctx.moveTo(subX, height * 0.6);
          ctx.lineTo(subX, height);
          ctx.stroke();
        }
      }
    }
  }, [width, height, zoom, timelineSettings]);

  // Handle mouse events for timeline interaction
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    
    isDragging.current = true;
    lastMouseX.current = e.nativeEvent.offsetX;
    
    // Calculate new position based on click location
    const beatWidth = 100 * zoom;
    const clickedBeat = e.nativeEvent.offsetX / beatWidth;
    let newPosition = new TimelinePosition(
      Math.floor(clickedBeat / timelineSettings.timeSignature.beats),
      Math.floor(clickedBeat % timelineSettings.timeSignature.beats),
      0
    );
    
    // Apply snapping if enabled
    if (snapEnabled) {
      newPosition = newPosition.snap(snapGridSize);
    }
    
    onPositionChange(newPosition);
  }, [zoom, timelineSettings, snapEnabled, snapGridSize, onPositionChange]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging.current || !canvasRef.current) return;
    
    const dx = e.nativeEvent.offsetX - lastMouseX.current;
    const beatWidth = 100 * zoom;
    const beatDelta = dx / beatWidth;
    
    // Create a new position based on the delta movement
    const newPosition = position.translate({ 
      measures: Math.floor(beatDelta / timelineSettings.timeSignature.beats),
      beats: Math.floor(beatDelta % timelineSettings.timeSignature.beats),
      fraction: 0,
      sign: Math.sign(beatDelta)
    }, snapEnabled);
    
    onPositionChange(newPosition);
    lastMouseX.current = e.nativeEvent.offsetX;
  }, [position, zoom, timelineSettings, snapEnabled, onPositionChange]);

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  // Draw the timeline and handle updates
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    drawTimeline(ctx);

    // Draw playhead
    const beatWidth = 100 * zoom;
    const playheadX = (position.bar * timelineSettings.timeSignature.beats + position.beat) * beatWidth;
    
    ctx.beginPath();
    ctx.strokeStyle = isPlaying ? '#00ff00' : '#ff0000';
    ctx.lineWidth = 2;
    ctx.moveTo(playheadX, 0);
    ctx.lineTo(playheadX, height);
    ctx.stroke();
    
    // Draw playhead triangle
    ctx.beginPath();
    ctx.fillStyle = isPlaying ? '#00ff00' : '#ff0000';
    ctx.moveTo(playheadX - 8, 0);
    ctx.lineTo(playheadX + 8, 0);
    ctx.lineTo(playheadX, 8);
    ctx.closePath();
    ctx.fill();
  }, [width, height, position, zoom, isPlaying, drawTimeline, timelineSettings]);

  return (
    <Box sx={{ 
      position: 'relative',
      backgroundColor: '#1a1a1a',
      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
      borderRadius: '4px'
    }}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          cursor: 'pointer',
          userSelect: 'none'
        }}
      />
    </Box>
  );
};

export default Timeline;
