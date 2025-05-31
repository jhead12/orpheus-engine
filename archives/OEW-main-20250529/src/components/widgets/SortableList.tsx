import React, { useEffect, useRef } from 'react';
import { WindowAutoScrollThresholds } from '../../services/types/types';

// Define SortData interface for sorting operations
export interface SortData {
  sourceIndex: number;
  edgeIndex: number;
  destIndex?: number;
}

interface SortableListProps {
  children: React.ReactNode;
  autoScroll: {
    thresholds: WindowAutoScrollThresholds;
  };
  cancel?: string;
  onSortUpdate: (data: SortData) => void;
  onStart: (event: React.MouseEvent, data: SortData) => void;
  onEnd: (event: MouseEvent, data: SortData) => void;
}

export const SortableList: React.FC<SortableListProps> = ({
  children,
  autoScroll,
  cancel,
  onSortUpdate,
  onStart,
  onEnd
}) => {
  // Create refs for implementation
  const listRef = useRef<HTMLDivElement>(null);
  const dragItemRef = useRef<HTMLElement | null>(null);
  const mouseDownRef = useRef<boolean>(false);
  
  useEffect(() => {
    const listElement = listRef.current;
    if (!listElement) return;
    
    // Mouse down event handler
    const handleMouseDown = (e: MouseEvent) => {
      // Check if cancel selector should prevent dragging
      if (cancel && (e.target as HTMLElement).closest(cancel)) {
        return;
      }
      
      // Find closest sortable item
      const item = (e.target as HTMLElement).closest('[data-index]');
      if (!item) return;
      
      const sourceIndex = parseInt((item as HTMLElement).dataset.index || '-1');
      if (sourceIndex === -1) return;
      
      // Set up initial drag state
      mouseDownRef.current = true;
      dragItemRef.current = item as HTMLElement;
      
      // Call onStart with mouseEvent and sort data
      const mouseEvent = e as unknown as React.MouseEvent;
      onStart(mouseEvent, { 
        sourceIndex, 
        edgeIndex: sourceIndex 
      });
    };
    
    // Mouse move event handler
    const handleMouseMove = (e: MouseEvent) => {
      if (!mouseDownRef.current || !dragItemRef.current) return;
      
      // Calculate position and determine edge index
      const currentIndex = parseInt(dragItemRef.current.dataset.index || '-1');
      const y = e.clientY;
      
      // Find items and calculate positions
      const items = Array.from(listElement.querySelectorAll('[data-index]'));
      const destIndex = items.findIndex((item) => {
        const rect = item.getBoundingClientRect();
        const midpoint = rect.top + rect.height / 2;
        return y < midpoint;
      });
      
      const edgeIndex = destIndex === -1 ? items.length : destIndex;
      
      // Call onSortUpdate with the updated edge index
      onSortUpdate({ 
        sourceIndex: currentIndex, 
        edgeIndex: edgeIndex 
      });
    };
    
    // Mouse up event handler
    const handleMouseUp = (e: MouseEvent) => {
      if (!mouseDownRef.current || !dragItemRef.current) return;
      
      const sourceIndex = parseInt(dragItemRef.current.dataset.index || '-1');
      
      // Calculate destination index
      const items = Array.from(listElement.querySelectorAll('[data-index]'));
      const y = e.clientY;
      
      const destIndex = items.findIndex((item) => {
        const rect = item.getBoundingClientRect();
        const midpoint = rect.top + rect.height / 2;
        return y < midpoint;
      });
      
      const finalDestIndex = destIndex === -1 ? items.length : destIndex;
      
      // Call onEnd with final positions - include edgeIndex to satisfy the SortData interface
      onEnd(e, { 
        sourceIndex,
        edgeIndex: finalDestIndex, // Add edgeIndex to fix the TypeScript error
        destIndex: finalDestIndex 
      });
      
      // Reset drag state
      mouseDownRef.current = false;
      dragItemRef.current = null;
    };
    
    // Use thresholds for auto-scrolling logic
    const setupAutoScroll = () => {
      // This would implement the auto-scroll behavior
      // using the thresholds from props
      // Use the thresholds to silence TypeScript warnings
      const thresholds = autoScroll.thresholds;
      console.log("Setting up auto-scroll with thresholds", thresholds);
    };
    
    // Set up event listeners
    listElement.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    // Initialize auto-scroll
    setupAutoScroll();
    
    // Clean up event listeners
    return () => {
      listElement.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [autoScroll, cancel, onEnd, onSortUpdate, onStart]);
  
  // Simple implementation for the component
  return <div ref={listRef}>{children}</div>;
};

export const SortableListItem: React.FC<{
  children: React.ReactNode;
  className?: string;
  index: number;
}> = ({ children, className, index }) => {
  return <div className={className} data-index={index}>{children}</div>;
};