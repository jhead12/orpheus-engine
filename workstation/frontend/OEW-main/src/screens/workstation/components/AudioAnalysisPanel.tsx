import { useEffect, useRef, useState } from 'react';
import { AudioAnalysisType, Clip } from '../../../services/types/consolidated-types';
import { useMCPAnalysis } from '../../../hooks/useMCPAnalysis';
import { useAI } from '../../../contexts/AIContext';
import { invokePythonAnalysis } from '../../../services/pythonBridge';

interface AudioAnalysisPanelProps {
  type: AudioAnalysisType;
  clip: Clip | null;
}

interface AnalysisResults {
  spectral?: {
    spectralData?: number[][];
  };
  waveform?: {
    data?: number[];
  };
  features?: {
    mfcc?: number[][];
    spectralContrast?: number[];
    chromagram?: number[][];
  };
}

export default function AudioAnalysisPanel({ type, clip }: AudioAnalysisPanelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [resolution, setResolution] = useState(1024);
  const [windowSize, setWindowSize] = useState(2048);
  const [pythonResults, setPythonResults] = useState<any>(null);
  
  const { results, error, isLoading } = useMCPAnalysis(
    clip?.audio?.buffer || null, 
    { type, resolution, windowSize }
  );

  const ai = useAI();

  useEffect(() => {
    if (results && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) return;
      
      // Clear previous error state
      // setAnalysisError(null);
      
      try {
        // Render based on MCP results
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
      } catch (err) {
        // setAnalysisError(err instanceof Error ? err.message : 'Analysis failed');
      }
    }
  }, [results, type, clip]);
  
  useEffect(() => {
    if (clip?.audio) {
      ai.analyzeAudioFeatures(clip)
        .then((analysisResults: AnalysisResults) => {
          if (canvasRef.current) {
            // Render analysis results
            renderAnalysis(analysisResults);
          }
        })
        .catch((err: Error) => {
          console.error('AI Analysis failed:', err);
        });
    }
  }, [clip, type]);

  useEffect(() => {
    if (clip?.audio?.buffer) {
      // Use npm script to run Python analysis
      const command = `npm run analyze:python -- --input="${clip.id}" --type="${type}" --resolution=${resolution} --window-size=${windowSize}`;
      
      invokePythonAnalysis({
        command,
        audioData: new Float32Array(clip.audio.buffer),
        parameters: {
          resolution,
          windowSize,
          melBands: 128,
          hopLength: windowSize / 4,
          fmin: 20,
          fmax: 20000
        }
      }).then((pythonResults: any) => {
        setPythonResults(pythonResults);
      });
    }
  }, [clip, type, resolution, windowSize]);

  const downloadResults = (format: 'txt' | 'pdf' | 'csv' | 'numpy') => {
    if (!results && !pythonResults) return;
    
    if (format === 'numpy') {
      // Download NumPy array format for further scientific analysis
      const blob = new Blob([pythonResults.rawData], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analysis-numpy-${Date.now()}.npy`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const content = format === 'csv' 
        ? convertToCSV(results)
        : JSON.stringify(results, null, 2);
      
      if (format === 'txt') {
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analysis-results-${Date.now()}.txt`;
        a.click();
        URL.revokeObjectURL(url);
      } else if (format === 'pdf') {
        // For PDF, we'll need to format it nicely
        import('jspdf').then(({ default: JsPDF }) => {
          const doc = new JsPDF();
          const lines = content.split('\n');
          lines.forEach((line, i) => {
            doc.text(line, 10, 10 + (i * 10));
          });
          doc.save(`analysis-results-${Date.now()}.pdf`);
        });
      }
    }
  };

  const renderAnalysis = (analysisResults: any) => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw analysis results based on current analysis type
    switch (type) {
      case AudioAnalysisType.Spectral:
        renderSpectralAnalysis(ctx, canvas, analysisResults.spectral);
        break;
      case AudioAnalysisType.Waveform:
        renderWaveformAnalysis(ctx, canvas, analysisResults.waveform);
        break;
      case AudioAnalysisType.Features:
        renderFeatureAnalysis(ctx, canvas, analysisResults.features);
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
    
    // Use actual spectral data if available
    if (results?.spectralData) {
      // Update visualization with results.spectralData directly
    }
  };
  
  const renderWaveformAnalysis = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, _results: any) => {
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
    if (pythonResults?.features) {
      // Use Python-computed features instead of basic analysis
      const { mfcc, spectralContrast, chromagram } = pythonResults.features;
      
      // Draw advanced feature visualizations
      drawMFCC(ctx, mfcc, canvas);
      drawSpectralFeatures(ctx, spectralContrast, canvas);
      drawChromagram(ctx, chromagram, canvas);
      
      // Add statistical measures computed by Python
      if (pythonResults.statistics) {
        drawStatistics(ctx, pythonResults.statistics, canvas);
      }
    } else {
      // Fallback to basic analysis
      ctx.fillStyle = 'var(--color1)';
      ctx.font = '14px Arial';
      ctx.fillText('Audio Feature Analysis - Research View', 10, 20);
      
      const features = [
        { name: 'RMS Energy', unit: 'dB' },
        { name: 'Spectral Centroid', unit: 'Hz' },
        { name: 'Spectral Rolloff', unit: 'Hz' },
        { name: 'Zero Crossing Rate', unit: 'crossings/s' },
        { name: 'Tempo', unit: 'BPM' },
        { name: 'Harmonic Ratio', unit: '' },
        { name: 'Pitch', unit: 'Hz' },
        { name: 'Onset Strength', unit: '' }
      ];
      
      const padding = { left: 120, right: 20, top: 40, bottom: 30 };
      const chartWidth = canvas.width - padding.left - padding.right;
      const chartHeight = canvas.height - padding.top - padding.bottom;
      
      // Draw axes
      ctx.beginPath();
      ctx.moveTo(padding.left, padding.top);
      ctx.lineTo(padding.left, canvas.height - padding.bottom);
      ctx.lineTo(canvas.width - padding.right, canvas.height - padding.bottom);
      ctx.stroke();
      
      // Draw features
      features.forEach((feature, i) => {
        const x = padding.left;
        const y = padding.top + (i * (chartHeight / features.length));
        
        // Get actual value from results or use placeholder
        const value = results?.[feature.name.toLowerCase()] || Math.random();
        const normalizedValue = Math.min(value, 1); // Normalize between 0-1
        
        // Draw bar
        const barWidth = normalizedValue * chartWidth;
        ctx.fillStyle = 'var(--color1)';
        ctx.fillRect(x, y, barWidth, 20);
        
        // Draw label
        ctx.fillStyle = 'var(--color1)';
        ctx.textAlign = 'right';
        ctx.fillText(`${feature.name} (${feature.unit})`, x - 5, y + 15);
        
        // Draw value
        ctx.textAlign = 'left';
        ctx.fillText(value.toFixed(2), x + barWidth + 5, y + 15);
      });
      
      // Add statistical annotations
      if (results?.statistics) {
        const stats = [
          `Mean RMS: ${results.statistics.rmsEnergy?.mean?.toFixed(2) || 'N/A'}`,
          `Std Dev: ${results.statistics.rmsEnergy?.stdDev?.toFixed(2) || 'N/A'}`,
          `Sample Rate: ${results.sampleRate || 'N/A'} Hz`
        ];
        
        stats.forEach((stat, i) => {
          ctx.fillText(stat, canvas.width - padding.right - 150, padding.top + (i * 20));
        });
      }
    }
  };

  const drawMFCC = (ctx: CanvasRenderingContext2D, mfcc: number[][], canvas: HTMLCanvasElement) => {
    const height = canvas.height / 3;
    const width = canvas.width;
    const yScale = height / mfcc.length;
    const xScale = width / mfcc[0].length;

    mfcc.forEach((row, i) => {
      row.forEach((value, j) => {
        const intensity = Math.min(Math.max(value, -1), 1);
        const color = intensity < 0 
          ? `rgb(0, 0, ${Math.abs(intensity) * 255})`
          : `rgb(${intensity * 255}, 0, 0)`;
        
        ctx.fillStyle = color;
        ctx.fillRect(j * xScale, i * yScale, xScale, yScale);
      });
    });
  };

  const drawSpectralFeatures = (ctx: CanvasRenderingContext2D, features: number[], canvas: HTMLCanvasElement) => {
    const height = canvas.height / 3;
    const width = canvas.width;

    ctx.beginPath();
    ctx.moveTo(0, height + features[0] * height);
    
    features.forEach((value, i) => {
      ctx.lineTo(i * (width / features.length), height + value * height);
    });
    
    ctx.strokeStyle = 'var(--color1)';
    ctx.stroke();
  };

  const drawChromagram = (ctx: CanvasRenderingContext2D, chroma: number[][], canvas: HTMLCanvasElement) => {
    const height = canvas.height / 3;
    const width = canvas.width;
    const noteHeight = height / 12;
    
    chroma.forEach((frame, i) => {
      frame.forEach((value, j) => {
        ctx.fillStyle = `rgba(255, 165, 0, ${value})`;
        ctx.fillRect(
          i * (width / chroma.length),
          height * 2 + j * noteHeight,
          width / chroma.length,
          noteHeight
        );
      });
    });
  };

  const drawStatistics = (ctx: CanvasRenderingContext2D, stats: any, canvas: HTMLCanvasElement) => {
    ctx.fillStyle = 'var(--color1)';
    ctx.font = '12px Arial';
    Object.entries(stats).forEach(([key, value], i) => {
      ctx.fillText(`${key}: ${value}`, 10, canvas.height - 20 - (i * 15));
    });
  };

  const convertToCSV = (results: any) => {
    const headers = ['Timestamp', 'Feature', 'Value', 'Unit'];
    const rows: string[][] = [];
    
    Object.entries(results).forEach(([feature, value]) => {
      if (typeof value === 'number') {
        rows.push([
          new Date().toISOString(),
          feature,
          value.toString(),
          getFeatureUnit(feature)
        ]);
      }
    });
    
    return [headers, ...rows]
      .map(row => row.join(','))
      .join('\n');
  };

  const getFeatureUnit = (feature: string): string => {
    const units: Record<string, string> = {
      rmsEnergy: 'dB',
      spectralCentroid: 'Hz',
      tempo: 'BPM',
      pitch: 'Hz',
      // Add more feature units as needed
    };
    return units[feature] || '';
  };

  return (
    <div className="analysis-panel">
      <h3>{clip?.name || 'No clip selected'}</h3>
      {error && (
        <div className="alert alert-danger">
          Analysis Error: {error}
        </div>
      )}
      {isLoading && (
        <div className="alert alert-info">
          Analyzing audio...
        </div>
      )}
      <div className="d-flex">
        <div className="flex-grow-1">
          <canvas 
            ref={canvasRef} 
            width={800} 
            height={200} 
            style={{ width: '100%', height: '200px', backgroundColor: 'var(--bg3)' }}
          />
          {results && (
            <div className="mt-2">
              <button 
                className="btn btn-sm btn-secondary me-2"
                onClick={() => downloadResults('txt')}
              >
                Download as TXT
              </button>
              <button 
                className="btn btn-sm btn-secondary"
                onClick={() => downloadResults('pdf')}
              >
                Download as PDF
              </button>
              <button 
                className="btn btn-sm btn-secondary"
                onClick={() => downloadResults('csv')}
              >
                Download as CSV
              </button>
              <button 
                className="btn btn-sm btn-secondary"
                onClick={() => downloadResults('numpy')}
                disabled={!pythonResults}
              >
                Download NumPy Data
              </button>
            </div>
          )}
        </div>
        <div style={{ width: '200px', padding: '0 10px' }}>
          <h4>AI Analysis Controls</h4>
          <div className="mb-2">
            <label>Resolution:</label>
            <select 
              className="form-control"
              value={resolution}
              onChange={e => setResolution(Number(e.target.value))}
            >
              <option value={512}>Low (512)</option>
              <option value={1024}>Medium (1024)</option>
              <option value={2048}>High (2048)</option>
            </select>
          </div>
          
          <div className="mb-2">
            <label>Window Size:</label>
            <select 
              className="form-control"
              value={windowSize}
              onChange={e => setWindowSize(Number(e.target.value))}
            >
              <option value={256}>256</option>
              <option value={512}>512</option>
              <option value={1024}>1024</option>
              <option value={2048}>2048</option>
            </select>
          </div>
          
          <button 
            className="btn btn-primary mt-2"
            onClick={() => ai.suggestArrangement(clip ? [clip.id] : [])}
          >
            Get AI Suggestions
          </button>
        </div>
      </div>
    </div>
  );
}
