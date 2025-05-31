import React, { useEffect, useRef, useState } from 'react';
import { useDAW } from '../../contexts/DAWContext';
import { Box } from '@mui/material';

interface AudioAnalyzerProps {
  width?: number;
  height?: number;
  visualizerType?: 'waveform' | 'frequency';
  style?: React.CSSProperties;
}

const AudioAnalyzer: React.FC<AudioAnalyzerProps> = ({ 
  width = 300, 
  height = 100, 
  visualizerType = 'waveform',
  style
}) => {
  const { audioService } = useDAW();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const [smoothedData, setSmoothedData] = useState<Float32Array>(new Float32Array());

  useEffect(() => {
    let isActive = true;

    const drawVisualizer = async () => {
      if (!canvasRef.current || !isActive) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Clear canvas with gradient background
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, '#1a1a1a');
      gradient.addColorStop(1, '#111');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Get audio data
      const data = visualizerType === 'waveform' 
        ? await audioService.getWaveformData()
        : await audioService.getFrequencyData();

      // Apply smoothing for frequency visualization
      if (visualizerType === 'frequency') {
        if (!smoothedData.length) {
          setSmoothedData(new Float32Array(data));
        } else {
          const smoothing = 0.8;
          for (let i = 0; i < data.length; i++) {
            smoothedData[i] = smoothedData[i] * smoothing + data[i] * (1 - smoothing);
          }
        }
      }

      const visualData = visualizerType === 'frequency' ? smoothedData : data;

      // Draw visualization
      if (visualizerType === 'waveform') {
        // Draw waveform
        ctx.beginPath();
        ctx.lineWidth = 2;
        const gradient = ctx.createLinearGradient(0, 0, width, 0);
        gradient.addColorStop(0, '#00ff00');
        gradient.addColorStop(1, '#00ffff');
        ctx.strokeStyle = gradient;

        const sliceWidth = width / data.length;
        let x = 0;

        for (let i = 0; i < data.length; i++) {
          const v = data[i] / 128.0;
          const y = v * height / 2;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }

          x += sliceWidth;
        }

        ctx.lineTo(width, height / 2);
        ctx.stroke();
      } else {
        // Draw frequency bars
        const barWidth = width / visualData.length;
        const barSpacing = 1;
        const scaledWidth = barWidth - barSpacing;

        for (let i = 0; i < visualData.length; i++) {
          const percent = visualData[i] / 255;
          const barHeight = percent * height;
          
          // Create gradient for each bar
          const barGradient = ctx.createLinearGradient(0, height, 0, height - barHeight);
          barGradient.addColorStop(0, '#00ff00');
          barGradient.addColorStop(1, '#00ffff');
          
          ctx.fillStyle = barGradient;
          ctx.fillRect(
            i * barWidth,
            height - barHeight,
            scaledWidth,
            barHeight
          );
        }
      }

      // Schedule next frame
      animationRef.current = requestAnimationFrame(drawVisualizer);
    };

    // Start animation
    drawVisualizer();

    return () => {
      isActive = false;
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [audioService, width, height, visualizerType]);

  return (
    <Box sx={{ ...style }}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{
          backgroundColor: '#1a1a1a',
          borderRadius: '4px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          transition: 'all 0.3s ease'
        }}
      />
    </Box>
  );
};

export default AudioAnalyzer;
