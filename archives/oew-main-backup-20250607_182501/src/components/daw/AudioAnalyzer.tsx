import React, { useEffect, useRef, useState } from 'react';
import { useDAW } from '../../contexts/DAWContext';

interface AudioAnalyzerProps {
  width: number;
  height: number;
  visualizerType?: 'waveform' | 'frequency';
}

const AudioAnalyzer: React.FC<AudioAnalyzerProps> = ({ 
  width, 
  height, 
  visualizerType = 'waveform' 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { audioService, isPlaying } = useDAW();
  const animationRef = useRef<number>(0);
  const [smoothedData, setSmoothedData] = useState<Float32Array>(new Float32Array());

  useEffect(() => {
    const draw = async () => {
      if (!canvasRef.current) return;
      
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      // Clear canvas
      ctx.fillStyle = '#1e1e1e';
      ctx.fillRect(0, 0, width, height);
      
      try {
        // Get audio data
        const data = visualizerType === 'waveform' 
          ? await audioService.getWaveformData()
          : await audioService.getFrequencyData();
          
        if (visualizerType === 'waveform') {
          // Draw waveform
          ctx.beginPath();
          ctx.lineWidth = 2;
          ctx.strokeStyle = '#00af5b';
          
          const sliceWidth = width / data.length;
          let x = 0;
          
          for (let i = 0; i < data.length; i++) {
            const v = data[i];
            const y = (v + 1) * height / 2;
            
            if (i === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
            
            x += sliceWidth;
          }
          
          ctx.stroke();
        } else {
          // Apply smoothing for frequency visualization
          if (smoothedData.length !== data.length) {
            setSmoothedData(new Float32Array(data));
          } else {
            const smoothingFactor = 0.8;
            for (let i = 0; i < data.length; i++) {
              smoothedData[i] = smoothingFactor * smoothedData[i] + (1 - smoothingFactor) * data[i];
            }
          }
          
          // Draw frequency bars
          const barWidth = width / smoothedData.length;
          const barCount = Math.min(128, smoothedData.length);
          const frequencyStep = Math.floor(smoothedData.length / barCount);
          
          for (let i = 0; i < barCount; i++) {
            const value = smoothedData[i * frequencyStep];
            const percent = (value + 100) / 100; // Normalize from dB to 0-1
            const barHeight = Math.max(2, percent * height);
            
            // Use gradient color based on frequency
            const hue = (i / barCount) * 120;
            ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
            
            ctx.fillRect(i * barWidth, height - barHeight, barWidth - 1, barHeight);
          }
        }
      } catch (err) {
        console.error('Error getting audio data:', err);
      }
      
      // Schedule next frame
      animationRef.current = requestAnimationFrame(draw);
    };
    
    // Start animation
    animationRef.current = requestAnimationFrame(draw);
    
    // Cleanup
    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [width, height, visualizerType, audioService]);

  return (
    <div className="audio-analyzer-container">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="audio-analyzer"
      />
    </div>
  );
};

export default AudioAnalyzer;
