import { useState, useCallback, useEffect } from 'react';

interface DragState {
  isDragging: boolean;
  startCoords: { x: number; y: number };
  currentCoords: { x: number; y: number };
}

interface UseDragOptions {
  onDragStart?: (e: MouseEvent) => void;
  onDragMove?: (e: MouseEvent, delta: { x: number; y: number }) => void;
  onDragEnd?: (e: MouseEvent, delta: { x: number; y: number }) => void;
}

/**
 * Hook to handle drag operations with mouse events
 * @param options Drag operation callbacks
 */
export function useDrag(options: UseDragOptions = {}) {
  const [dragState, setDragState] = useState<DragState | null>(null);

  const handleMouseDown = useCallback((e: MouseEvent) => {
    if (e.button === 0) { // Only handle left mouse button
      setDragState({
        isDragging: true,
        startCoords: { x: e.clientX, y: e.clientY },
        currentCoords: { x: e.clientX, y: e.clientY }
      });
      options.onDragStart?.(e);
    }
  }, [options.onDragStart]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (dragState?.isDragging) {
      const delta = {
        x: e.clientX - dragState.startCoords.x,
        y: e.clientY - dragState.startCoords.y
      };
      
      setDragState(prev => prev ? {
        ...prev,
        currentCoords: { x: e.clientX, y: e.clientY }
      } : null);
      
      options.onDragMove?.(e, delta);
    }
  }, [dragState, options.onDragMove]);

  const handleMouseUp = useCallback((e: MouseEvent) => {
    if (dragState?.isDragging) {
      const delta = {
        x: e.clientX - dragState.startCoords.x,
        y: e.clientY - dragState.startCoords.y
      };
      
      options.onDragEnd?.(e, delta);
      setDragState(null);
    }
  }, [dragState, options.onDragEnd]);

  // Set up event listeners
  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  return {
    handleMouseDown,
    isDragging: dragState?.isDragging || false,
    dragDelta: dragState ? {
      x: dragState.currentCoords.x - dragState.startCoords.x,
      y: dragState.currentCoords.y - dragState.startCoords.y
    } : { x: 0, y: 0 }
  };
}

export default useDrag;
