import React, { useEffect, useRef } from 'react';
import { AudioAnalysisType, Clip } from '../../../services/types/types';

interface AudioAnalysisPanelProps {
  type: AudioAnalysisType;
  results: any;
  clip: Clip | null;
}

export default function AudioAnalysisPanel({ type, results, clip }: AudioAnalysisPanelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    if (results && canvasRef.current) {
      renderAnalysisResults();
    }
  }, [results, type]);
  
  const renderAnalysisResults = () => {
    if (!canvasRef.current || !results) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Render different visualizations based on analysis type
    switch (type) {
      case AudioAnalysisType.Spectral:
        renderSpectralAnalysis(ctx, canvas, results);
        break;
      case AudioAnalysisType.Waveform:
        renderWaveformAnalysis(ctx, canvas, results);
        break;
      case AudioAnalysisType.Features:
        renderFeatureAnalysis(ctx, canvas, results);
        break;
    }
  };
  
  const renderSpectralAnalysis = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, results: any) => {
    // Draw spectrogram
    ctx.fillStyle = 'var(--color1)';
    ctx.font = '14px Arial';
    ctx.fillText('Spectral Analysis', 10, 20);
    
    // Placeholder for spectral visualization
    ctx.beginPath();
    ctx.moveTo(0, canvas.height/2);
    
    for (let i = 0; i < canvas.width; i++) {
      // Sample visualization - would be replaced by actual spectral data
      const y = (Math.sin(i * 0.05) + 1) * canvas.height/4 + canvas.height/4;
      ctx.lineTo(i, y);
    }
    
    ctx.strokeStyle = 'var(--color1)';
    ctx.stroke();
  };
  
  const renderWaveformAnalysis = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, results: any) => {
    // Draw waveform
    ctx.fillStyle = 'var(--color1)';
    ctx.font = '14px Arial';
    ctx.fillText('Waveform Analysis', 10, 20);
    
    // Placeholder for waveform visualization
    const middle = canvas.height / 2;
    ctx.beginPath();
    ctx.moveTo(0, middle);
    
    for (let i = 0; i < canvas.width; i++) {
      // Sample visualization - would be replaced by actual waveform data
      const y = Math.random() * 50 + middle;
      ctx.lineTo(i, y);
      i++;
      ctx.lineTo(i, middle - (y - middle));
    }
    
    ctx.strokeStyle = 'var(--color1)';
    ctx.stroke();
  };
  
  const renderFeatureAnalysis = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, results: any) => {
    // Draw feature visualization
    ctx.fillStyle = 'var(--color1)';
    ctx.font = '14px Arial';
    ctx.fillText('Audio Feature Analysis', 10, 20);
    
    // Placeholder for feature visualization - bar chart
    const barWidth = 30;
    const spacing = 10;
    const features = ['Energy', 'Tempo', 'Pitch', 'Timbre', 'Rhythm'];
    
    features.forEach((feature, i) => {
      const x = i * (barWidth + spacing) + 50;
      const height = Math.random() * 100 + 20;
      const y = canvas.height - height - 30;
      
      ctx.fillRect(x, y, barWidth, height);
      ctx.fillText(feature, x, canvas.height - 10);
    });
  };
  
  return (
    <div className="analysis-panel">
      <h3>{clip?.name || 'No clip selected'}</h3>
      <div className="d-flex">
        <div className="flex-grow-1">
          <canvas 
            ref={canvasRef} 
            width={800} 
            height={200} 
            style={{ width: '100%', height: '200px', backgroundColor: 'var(--bg3)' }}
          />
        </div>
        <div style={{ width: '200px', padding: '0 10px' }}>
          <h4>Analysis Controls</h4>
          <div className="mb-2">
            <label>Resolution:</label>
            <select className="form-control">
              <option>Low</option>
              <option selected>Medium</option>
              <option>High</option>
            </select>
          </div>
          
          <div className="mb-2">
            <label>Window Size:</label>
            <select className="form-control">
              <option>256</option>
              <option>512</option>
              <option selected>1024</option>
              <option>2048</option>
            </select>
          </div>
          
          <button className="btn btn-primary mt-2">Export Data</button>
        </div>
      </div>
    </div>
  );
}
