import React, { useRef, useEffect } from 'react';
import { AudioAnalysisResults } from '../types/audio';

interface AudioVisualizationProps {
  audioBlob?: Blob | null;
  analysisResults?: AudioAnalysisResults | null;
  isRecording?: boolean;
  audioLevel?: number;
}

const AudioVisualization: React.FC<AudioVisualizationProps> = ({
  audioBlob,
  analysisResults,
  isRecording = false,
  audioLevel = 0,
}) => {
  const waveformCanvasRef = useRef<HTMLCanvasElement>(null);
  const spectrumCanvasRef = useRef<HTMLCanvasElement>(null);
  const spectrogramCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (analysisResults) {
      drawWaveform();
      drawSpectrum();
      drawSpectrogram();
    } else if (isRecording) {
      drawLiveVisualization();
    }
  }, [analysisResults, isRecording, audioLevel]);

  const drawWaveform = () => {
    const canvas = waveformCanvasRef.current;
    if (!canvas || !analysisResults) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;
    const waveform = analysisResults.waveform;

    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);

    // Draw waveform
    ctx.strokeStyle = '#4ecdc4';
    ctx.lineWidth = 2;
    ctx.beginPath();

    const step = width / waveform.length;
    const amplitude = height / 2;

    for (let i = 0; i < waveform.length; i++) {
      const x = i * step;
      const y = amplitude + (waveform[i] * amplitude * 0.8);
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    ctx.stroke();

    // Draw center line
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, amplitude);
    ctx.lineTo(width, amplitude);
    ctx.stroke();

    // Add labels
    ctx.fillStyle = '#b0b0b0';
    ctx.font = '12px Arial';
    ctx.fillText('Waveform', 10, 20);
    ctx.fillText('Time →', width - 60, height - 10);
  };

  const drawSpectrum = () => {
    const canvas = spectrumCanvasRef.current;
    if (!canvas || !analysisResults) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;
    const spectrum = analysisResults.spectrum;

    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);

    // Draw spectrum
    const barWidth = width / spectrum.frequencies.length;
    
    for (let i = 0; i < spectrum.magnitudes.length; i++) {
      const magnitude = spectrum.magnitudes[i];
      const normalizedMagnitude = Math.max(0, (magnitude + 100) / 100); // Normalize dB values
      const barHeight = normalizedMagnitude * height * 0.8;
      
      const x = i * barWidth;
      const y = height - barHeight;
      
      // Color based on frequency
      const hue = (i / spectrum.magnitudes.length) * 240; // Blue to red
      ctx.fillStyle = `hsl(${hue}, 70%, 60%)`;
      ctx.fillRect(x, y, barWidth - 1, barHeight);
    }

    // Add labels
    ctx.fillStyle = '#b0b0b0';
    ctx.font = '12px Arial';
    ctx.fillText('Frequency Spectrum', 10, 20);
    ctx.fillText('Frequency →', width - 100, height - 10);
    ctx.fillText('Magnitude ↑', 10, height - 10);
  };

  const drawSpectrogram = () => {
    const canvas = spectrogramCanvasRef.current;
    if (!canvas || !analysisResults) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;
    const spectrogram = analysisResults.spectrogram;

    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);

    if (spectrogram.data.length === 0) return;

    const timeStep = width / spectrogram.data.length;
    const freqStep = height / spectrogram.data[0].length;

    // Draw spectrogram
    for (let t = 0; t < spectrogram.data.length; t++) {
      for (let f = 0; f < spectrogram.data[t].length; f++) {
        const magnitude = spectrogram.data[t][f];
        const normalizedMagnitude = Math.max(0, (magnitude + 100) / 100);
        
        const x = t * timeStep;
        const y = height - (f * freqStep);
        
        // Create color map
        const intensity = Math.floor(normalizedMagnitude * 255);
        ctx.fillStyle = `rgb(${intensity}, ${intensity * 0.7}, ${intensity * 0.3})`;
        ctx.fillRect(x, y - freqStep, timeStep, freqStep);
      }
    }

    // Add labels
    ctx.fillStyle = '#b0b0b0';
    ctx.font = '12px Arial';
    ctx.fillText('Spectrogram', 10, 20);
    ctx.fillText('Time →', width - 60, height - 10);
    ctx.fillText('Freq ↑', 10, height - 10);
  };

  const drawLiveVisualization = () => {
    const canvas = waveformCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;

    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);

    // Draw live level meter
    const amplitude = height / 2;
    const levelHeight = audioLevel * amplitude * 0.8;
    
    // Background
    ctx.fillStyle = '#333';
    ctx.fillRect(width / 2 - 20, amplitude - amplitude * 0.8, 40, amplitude * 1.6);
    
    // Level bar
    const gradient = ctx.createLinearGradient(0, amplitude + amplitude * 0.8, 0, amplitude - amplitude * 0.8);
    gradient.addColorStop(0, '#4ecdc4');
    gradient.addColorStop(0.7, '#feca57');
    gradient.addColorStop(1, '#ff6b6b');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(
      width / 2 - 15, 
      amplitude + amplitude * 0.8 - levelHeight, 
      30, 
      levelHeight
    );

    // Recording indicator
    ctx.fillStyle = '#ff6b6b';
    ctx.beginPath();
    ctx.arc(width / 2, 30, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#b0b0b0';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('● RECORDING', width / 2, 55);
    ctx.fillText(`Level: ${(audioLevel * 100).toFixed(0)}%`, width / 2, height - 20);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
      <div>
        <canvas
          ref={waveformCanvasRef}
          width={300}
          height={150}
          className="canvas"
          style={{ width: '100%', height: '150px' }}
        />
      </div>
      
      {analysisResults && (
        <>
          <div>
            <canvas
              ref={spectrumCanvasRef}
              width={300}
              height={150}
              className="canvas"
              style={{ width: '100%', height: '150px' }}
            />
          </div>
          
          <div style={{ gridColumn: '1 / -1' }}>
            <canvas
              ref={spectrogramCanvasRef}
              width={600}
              height={200}
              className="canvas"
              style={{ width: '100%', height: '200px' }}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default AudioVisualization;
