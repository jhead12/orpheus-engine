import { useLayoutEffect, useRef } from "react";

interface IProps {
  width?: number;
  height?: number;
  beatWidth?: number;
  beatsPerMeasure?: number;
  subdivisions?: number;
}

export default function TimelineRulerGrid({ 
  width = 1000, 
  height = 50, 
  beatWidth = 100,
  beatsPerMeasure = 4,
  subdivisions = 4
}: IProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid lines
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 1;

    const measureWidth = beatWidth * beatsPerMeasure;
    const subdivisionWidth = beatWidth / subdivisions;

    // Draw measure lines (thick)
    for (let x = 0; x < width; x += measureWidth) {
      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#555";
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Draw beat lines (medium)
    for (let x = 0; x < width; x += beatWidth) {
      ctx.beginPath();
      ctx.lineWidth = 1;
      ctx.strokeStyle = "#444";
      ctx.moveTo(x, height * 0.3);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Draw subdivision lines (thin)
    for (let x = 0; x < width; x += subdivisionWidth) {
      ctx.beginPath();
      ctx.lineWidth = 0.5;
      ctx.strokeStyle = "#333";
      ctx.moveTo(x, height * 0.7);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Draw ruler numbers
    ctx.fillStyle = "#888";
    ctx.font = "12px Arial";
    ctx.textAlign = "left";
    
    let measureNumber = 1;
    for (let x = 0; x < width; x += measureWidth) {
      ctx.fillText(measureNumber.toString(), x + 4, 16);
      measureNumber++;
    }

  }, [width, height, beatWidth, beatsPerMeasure, subdivisions]);

  return <canvas ref={canvasRef} height={height} width={width} style={{ width: "100%", height: "auto" }} />;
}