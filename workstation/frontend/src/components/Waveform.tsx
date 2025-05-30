import { useEffect, useRef } from "react";

export interface WaveformProps {
  data: Float32Array[];
  height: number;
  width: number;
  offset?: number;
  onDraw?: (canvas: HTMLCanvasElement | null) => void;
  offscreenDrawing?: boolean;
}

export default function Waveform({ 
  data, 
  height, 
  width, 
  offset = 0, 
  onDraw,
  offscreenDrawing = false 
}: WaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);
    ctx.strokeStyle = "var(--color1)";
    ctx.lineWidth = 1;

    const middle = height / 2;
    const amplitude = height / 2;

    // For each channel
    for (let channel = 0; channel < data.length; channel++) {
      const channelData = data[channel];
      const channelHeight = height / data.length;
      const channelMiddle = (channel + 0.5) * channelHeight;

      ctx.beginPath();
      ctx.moveTo(0, channelMiddle);

      // For each pair of min/max samples
      for (let i = 0; i < channelData.length; i += 2) {
        const x = (i / 2 / (channelData.length / 2)) * width;
        const maxSample = channelData[i];
        const minSample = channelData[i + 1];
        
        // Scale samples to channel height
        const scaledMax = channelMiddle - (maxSample * channelHeight / 2);
        const scaledMin = channelMiddle - (minSample * channelHeight / 2);
        
        ctx.lineTo(x, scaledMax);
        ctx.lineTo(x, scaledMin);
      }

      ctx.stroke();
    }

    if (onDraw) onDraw(canvas);
  }, [data, height, width, offset]);

  if (offscreenDrawing) {
    return (
      <canvas 
        ref={canvasRef} 
        height={height} 
        width={width} 
        style={{ display: "none" }} 
      />
    );
  }

  return (
    <canvas 
      ref={canvasRef} 
      height={height} 
      width={width} 
      style={{ position: "absolute", top: 0, left: offset }} 
    />
  );
}
