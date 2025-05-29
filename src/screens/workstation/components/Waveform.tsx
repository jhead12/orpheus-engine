import { useRef, useState, useLayoutEffect } from "react";

interface IProps {
  data: number[];
  height?: number;
  width?: number;
}

export default function Waveform({ data, height = 100, width = 500 }: IProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [scaling, setScaling] = useState({ min: 0, max: 255 });

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const step = Math.ceil(data.length / width);
    const amp = height / 2;

    ctx.beginPath();
    ctx.moveTo(0, amp);

    for (let i = 0; i < data.length; i += step) {
      const x = (i / data.length) * width;
      const y = amp - (data[i] / 255) * amp;

      ctx.lineTo(x, y);
    }

    ctx.lineTo(width, amp);
    ctx.strokeStyle = "var(--accent)";
    ctx.stroke();
  }, [data, height, width]);

  return <canvas ref={canvasRef} height={height} width={width} style={{ width: "100%", height: "auto" }} />;
}