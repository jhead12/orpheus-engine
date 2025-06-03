import React, { useRef, useEffect } from 'react';
import { Box } from '@mui/material';
import { MIDINote, TimelinePosition } from '../../services/types/types';

interface PianoRollProps {
  notes: MIDINote[];
  width: number;
  height: number;
  onNoteAdd: (note: MIDINote) => void;
  onNoteEdit: (noteId: string, updates: Partial<MIDINote>) => void;
  onNoteDelete: (noteId: string) => void;
}

const PianoRoll: React.FC<PianoRollProps> = ({ notes, width, height, onNoteAdd, onNoteEdit, onNoteDelete }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    drawPianoRoll(ctx, notes);
  }, [notes, width, height]);

  const drawPianoKeys = (ctx: CanvasRenderingContext2D) => {
    const keyHeight = 20;
    const whiteKeyWidth = 80;
    const blackKeyWidth = 50;
    
    // Draw white keys
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 88; i++) {
      const y = height - (i * keyHeight) - keyHeight;
      ctx.fillRect(0, y, whiteKeyWidth, keyHeight);
      ctx.strokeRect(0, y, whiteKeyWidth, keyHeight);
    }
    
    // Draw black keys (simplified pattern)
    ctx.fillStyle = '#000000';
    const blackKeyPattern = [1, 1, 0, 1, 1, 1, 0]; // Sharp pattern in octave
    for (let octave = 0; octave < 12; octave++) {
      for (let i = 0; i < blackKeyPattern.length; i++) {
        if (blackKeyPattern[i]) {
          const noteIndex = octave * 7 + i;
          if (noteIndex < 88) {
            const y = height - (noteIndex * keyHeight) - keyHeight;
            ctx.fillRect(0, y - keyHeight/2, blackKeyWidth, keyHeight);
          }
        }
      }
    }
  };

  const drawGrid = (ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 1;
    
    // Horizontal lines (piano keys)
    const keyHeight = 20;
    for (let i = 0; i <= 88; i++) {
      const y = height - (i * keyHeight);
      ctx.beginPath();
      ctx.moveTo(80, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    
    // Vertical lines (time grid)
    const timeStep = 50; // pixels per beat
    for (let x = 80; x < width; x += timeStep) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
  };

  const drawNotes = (ctx: CanvasRenderingContext2D, notes: MIDINote[]) => {
    ctx.fillStyle = '#646cff';
    
    notes.forEach(note => {
      const keyHeight = 20;
      const y = height - (note.pitch * keyHeight) - keyHeight;
      const x = 80 + (note.start.toSeconds() * 50); // 50 pixels per second
      const noteWidth = note.duration.toSeconds() * 50;
      
      ctx.fillRect(x, y, noteWidth, keyHeight - 2);
      ctx.strokeRect(x, y, noteWidth, keyHeight - 2);
    });
  };

  const drawPianoRoll = (ctx: CanvasRenderingContext2D, notes: MIDINote[]) => {
    ctx.clearRect(0, 0, width, height);
    
    // Draw piano keys
    drawPianoKeys(ctx);
    
    // Draw grid
    drawGrid(ctx);
    
    // Draw notes
    drawNotes(ctx, notes);
  };

  return (
    <Box className="piano-roll">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{ border: '1px solid #333' }}
      />
    </Box>
  );
};

export default PianoRoll;
