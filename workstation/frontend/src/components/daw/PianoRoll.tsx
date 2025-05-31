import React, { useRef, useEffect } from 'react';
import { Box } from '@mui/material';
import { MIDINote, TimelinePosition } from '../../types/types';

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
