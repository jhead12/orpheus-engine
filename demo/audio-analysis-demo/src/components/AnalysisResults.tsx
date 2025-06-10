import React from 'react';
import { AudioAnalysisResults } from '../types/audio';
import { Music, Zap, Heart, Star, Volume2, BarChart } from 'lucide-react';

interface AnalysisResultsProps {
  results: AudioAnalysisResults;
}

const AnalysisResults: React.FC<AnalysisResultsProps> = ({ results }) => {
  const { characteristics, features, quality } = results;

  const getQualityColor = (score: number) => {
    if (score >= 90) return 'score-excellent';
    if (score >= 75) return 'score-good';
    if (score >= 60) return 'score-fair';
    return 'score-poor';
  };

  const getQualityLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 75) return 'Good';
    if (score >= 60) return 'Fair';
    return 'Poor';
  };

  const formatValue = (value: number | undefined, decimals: number = 1, suffix: string = '') => {
    if (value === undefined || value === null) return 'N/A';
    return `${value.toFixed(decimals)}${suffix}`;
  };

  return (
    <div className="analysis-results">
      <h3>Audio Characteristics</h3>
      <div className="analysis-grid">
        <div className="metric">
          <div className="metric-value">{formatValue(characteristics.duration, 1, 's')}</div>
          <div className="metric-label">Duration</div>
        </div>
        <div className="metric">
          <div className="metric-value">{characteristics.sampleRate / 1000}kHz</div>
          <div className="metric-label">Sample Rate</div>
        </div>
        <div className="metric">
          <div className="metric-value">{characteristics.channels}</div>
          <div className="metric-label">Channels</div>
        </div>
        <div className="metric">
          <div className="metric-value">{formatValue(features.tempo, 0, ' BPM')}</div>
          <div className="metric-label">Tempo</div>
        </div>
      </div>

      <h3 style={{ marginTop: '30px' }}>
        <Music size={20} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
        AI Analysis Features
      </h3>
      
      <div style={{ marginBottom: '20px' }}>
        {features.genre && (
          <span className="genre-tag">{features.genre}</span>
        )}
      </div>

      <div className="analysis-grid">
        <div className="metric">
          <Zap size={16} style={{ marginBottom: '5px', color: '#feca57' }} />
          <div className="metric-value">{formatValue(features.energy ? features.energy * 100 : undefined, 0, '%')}</div>
          <div className="metric-label">Energy</div>
        </div>
        <div className="metric">
          <Heart size={16} style={{ marginBottom: '5px', color: '#ff6b6b' }} />
          <div className="metric-value">{formatValue(features.danceability ? features.danceability * 100 : undefined, 0, '%')}</div>
          <div className="metric-label">Danceability</div>
        </div>
        <div className="metric">
          <Star size={16} style={{ marginBottom: '5px', color: '#45b7d1' }} />
          <div className="metric-value">{formatValue(features.valence ? features.valence * 100 : undefined, 0, '%')}</div>
          <div className="metric-label">Valence</div>
        </div>
        <div className="metric">
          <Volume2 size={16} style={{ marginBottom: '5px', color: '#4ecdc4' }} />
          <div className="metric-value">{formatValue(features.loudness, 1, ' dB')}</div>
          <div className="metric-label">Loudness</div>
        </div>
      </div>

      <h3 style={{ marginTop: '30px' }}>
        <BarChart size={20} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
        Spectral Features
      </h3>
      
      <div className="analysis-grid">
        <div className="metric">
          <div className="metric-value">{formatValue(features.spectralCentroid, 0, ' Hz')}</div>
          <div className="metric-label">Spectral Centroid</div>
        </div>
        <div className="metric">
          <div className="metric-value">{formatValue(features.rms, 3)}</div>
          <div className="metric-label">RMS Energy</div>
        </div>
        <div className="metric">
          <div className="metric-value">{formatValue(features.zcr, 3)}</div>
          <div className="metric-label">Zero Crossing Rate</div>
        </div>
        <div className="metric">
          <div className="metric-value">{formatValue(quality.dynamicRange, 1, ' dB')}</div>
          <div className="metric-label">Dynamic Range</div>
        </div>
      </div>

      <h3 style={{ marginTop: '30px' }}>Audio Quality Assessment</h3>
      
      <div className="quality-score">
        <span style={{ minWidth: '80px' }}>Overall Score:</span>
        <div className="score-bar">
          <div 
            className={`score-fill ${getQualityColor(quality.score)}`}
            style={{ width: `${quality.score}%` }}
          />
        </div>
        <span style={{ marginLeft: '10px', fontWeight: 'bold' }}>
          {quality.score}/100 ({getQualityLabel(quality.score)})
        </span>
      </div>

      <div className="analysis-grid" style={{ marginTop: '15px' }}>
        <div className="metric">
          <div className="metric-value">{formatValue(quality.peakLevel, 1, ' dB')}</div>
          <div className="metric-label">Peak Level</div>
        </div>
        <div className="metric">
          <div className="metric-value" style={{ color: quality.clipping ? '#ff6b6b' : '#4ecdc4' }}>
            {quality.clipping ? 'Yes' : 'No'}
          </div>
          <div className="metric-label">Clipping Detected</div>
        </div>
        <div className="metric">
          <div className="metric-value">{formatValue(quality.loudnessRange, 1, ' LU')}</div>
          <div className="metric-label">Loudness Range</div>
        </div>
        <div className="metric">
          <div className="metric-value">
            {quality.score >= 90 ? '🟢' : quality.score >= 75 ? '🟡' : quality.score >= 60 ? '🟠' : '🔴'}
          </div>
          <div className="metric-label">Quality Rating</div>
        </div>
      </div>

      {quality.clipping && (
        <div style={{ 
          marginTop: '15px', 
          padding: '10px', 
          background: 'rgba(255, 107, 107, 0.1)', 
          border: '1px solid rgba(255, 107, 107, 0.3)',
          borderRadius: '8px',
          fontSize: '0.9rem'
        }}>
          ⚠️ <strong>Warning:</strong> Clipping detected in the audio signal. This may indicate overdriven input levels or digital distortion.
        </div>
      )}

      <div style={{ 
        marginTop: '20px', 
        padding: '10px', 
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '8px',
        fontSize: '0.85rem',
        color: '#b0b0b0'
      }}>
        <strong>Analysis powered by:</strong> FFT Spectral Analysis • Machine Learning Classification • Professional Audio Standards (EBU R128)
      </div>
    </div>
  );
};

export default AnalysisResults;
