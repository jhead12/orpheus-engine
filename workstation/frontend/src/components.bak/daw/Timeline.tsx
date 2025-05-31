import React, { useRef, useEffect } from 'react';
import { TimelinePosition } from '../../services/types/types';

interface TimelineProps {
  width: number;
  height: number;
  position: TimelinePosition;
  zoom: number;
  onPositionChange: (position: TimelinePosition) => void;
}

const Timeline: React.FC<TimelineProps> = ({ width, height, position, zoom, onPositionChange }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDragging = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    drawTimeline(ctx, width, height, position, zoom);
  }, [width, height, position, zoom]);

  const drawTimeline = (ctx: CanvasRenderingContext2D, width: number, height: number, pos: TimelinePosition, zoom: number) => {
    ctx.clearRect(0, 0, width, height);
    
    // Draw bars and beats
    const pixelsPerBeat = 100 * zoom;
    const totalBeats = width / pixelsPerBeat;
    
    ctx.strokeStyle = '#666';
    ctx.fillStyle = '#888';
    ctx.font = '12px Arial';
    
    for (let i = 0; i <= totalBeats; i++) {
      const x = i * pixelsPerBeat;
      const isBar = i % 4 === 0;
      
      ctx.beginPath();
      ctx.moveTo(x, isBar ? 0 : height * 0.5);
      ctx.lineTo(x, height);
      ctx.stroke();
      
      if (isBar) {
        ctx.fillText((i / 4).toString(), x + 4, 15);
      }
    }
  };

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="timeline"
    />
  );
};

export default Timeline;
