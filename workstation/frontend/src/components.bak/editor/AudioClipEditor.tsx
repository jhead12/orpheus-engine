import React, { useEffect, useRef, useState } from 'react';
import { useDAW } from '../../contexts/DAWContext';
import { Clip } from '../../types/types';

interface AudioClipEditorProps {
  clip?: Clip;
  onSave?: (clip: Clip) => void;
}

const AudioClipEditor: React.FC<AudioClipEditorProps> = ({ clip, onSave }) => {
  const { audioService } = useDAW();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    if (clip?.data?.buffer && canvasRef.current) {
      drawWaveform(clip.data.buffer);
    }
  }, [clip]);

  const drawWaveform = (buffer: AudioBuffer) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const data = buffer.getChannelData(0);
    const step = Math.ceil(data.length / canvas.width);
    const amp = canvas.height / 2;

    ctx.fillStyle = '#2d2d2d';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.strokeStyle = '#646cff';
    ctx.lineWidth = 1;

    for (let i = 0; i < canvas.width; i++) {
      let min = 1.0;
      let max = -1.0;
      for (let j = 0; j < step; j++) {
        const datum = data[(i * step) + j];
        if (datum < min) min = datum;
        if (datum > max) max = datum;
      }
      ctx.moveTo(i, (1 + min) * amp);
      ctx.lineTo(i, (1 + max) * amp);
    }
    ctx.stroke();
  };

  const handlePlay = () => {
    if (!clip?.data?.buffer) return;
    setIsPlaying(true);
    audioService.play(clip.data.buffer, { onEnded: () => setIsPlaying(false) });
  };

  const handleStop = () => {
    setIsPlaying(false);
    audioService.stop();
  };

  return (
    <div className="audio-clip-editor">
      <div className="editor-toolbar">
        <button onClick={handlePlay} disabled={isPlaying}>
          Play
        </button>
        <button onClick={handleStop} disabled={!isPlaying}>
          Stop
        </button>
      </div>
      
      <div className="waveform-container">
        <canvas 
          ref={canvasRef}
          width={800}
          height={200}
          className="waveform-canvas"
        />
        <div 
          className="playhead"
          style={{ left: `${(currentTime / (clip?.data?.buffer?.duration || 1)) * 100}%` }}
        />
      </div>

      <div className="editor-controls">
        <button onClick={() => clip && onSave?.(clip)}>
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default AudioClipEditor;
