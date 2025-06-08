import React, { useRef, useEffect, useCallback } from 'react';
import { useDAW } from '../../contexts/DAWContext';

interface TimelineProps {
  width: number;
  height: number;
  position: {
    bar: number;
    beat: number;
    fraction: number;
  };
  zoom: number;
  onPositionChange: (position: {
    bar: number;
    beat: number;
    fraction: number;
  }) => void;
}

const Timeline: React.FC<TimelineProps> = ({ width, height, position, zoom, onPositionChange }) => {
  const { isPlaying, tempo, timeSignature } = useDAW();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDraggingRef = useRef(false);
  
  // Convert position to pixels
  const posToPixels = useCallback((pos: typeof position) => {
    const beatsPerBar = timeSignature.beats;
    const totalBeats = pos.bar * beatsPerBar + pos.beat + pos.fraction;
    return totalBeats * 100 * zoom; // 100px per beat at zoom=1
  }, [timeSignature.beats, zoom]);
  
  // Convert pixels to position
  const pixelsToPos = useCallback((pixels: number) => {
    const beatsPerBar = timeSignature.beats;
    const totalBeats = pixels / (100 * zoom);
    const bar = Math.floor(totalBeats / beatsPerBar);
    const beat = Math.floor(totalBeats % beatsPerBar);
    const fraction = totalBeats - Math.floor(totalBeats);
    
    return { bar, beat, fraction };
  }, [timeSignature.beats, zoom]);
  
  // Draw timeline grid
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.fillStyle = '#2d2d2d';
    ctx.fillRect(0, 0, width, height);
    
    // Draw grid
    const beatWidth = 100 * zoom;
    const barWidth = beatWidth * timeSignature.beats;
    
    // Draw vertical grid lines
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 1;
    
    // Draw bar lines
    for (let x = 0; x <= width; x += barWidth) {
      // Bar number
      const barNumber = Math.floor(x / barWidth);
      ctx.fillStyle = '#aaa';
      ctx.font = '10px Arial';
      ctx.fillText(barNumber.toString(), x + 5, 12);
      
      // Bar line
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
      
      // Beat lines
      ctx.strokeStyle = '#444';
      for (let beat = 1; beat < timeSignature.beats; beat++) {
        const beatX = x + beat * beatWidth;
        ctx.beginPath();
        ctx.moveTo(beatX, 0);
        ctx.lineTo(beatX, height);
        ctx.stroke();
      }
    }
    
    // Draw playhead
    const playheadX = posToPixels(position);
    if (playheadX >= 0 && playheadX <= width) {
      ctx.fillStyle = isPlaying ? '#00af5b' : '#ff3333';
      ctx.fillRect(playheadX - 1, 0, 2, height);
      
      // Draw playhead handle
      ctx.beginPath();
      ctx.moveTo(playheadX - 8, 0);
      ctx.lineTo(playheadX + 8, 0);
      ctx.lineTo(playheadX, 8);
      ctx.closePath();
      ctx.fill();
    }
    
  }, [width, height, position, zoom, isPlaying, timeSignature, posToPixels]);
  
  // Handle mouse interactions
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    
    // Set new position
    const newPos = pixelsToPos(x);
    onPositionChange(newPos);
    
    isDraggingRef.current = true;
  };
  
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    
    // Set new position
    const newPos = pixelsToPos(x);
    onPositionChange(newPos);
  };
  
  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };
  
  return (
    <div className="timeline-container">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
    </div>
  );
};

export default Timeline;
