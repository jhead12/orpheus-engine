import React, { useRef, useState, useEffect } from 'react';

export interface InputPane {
  key: string;
  children: React.ReactNode;
  fixed?: boolean;
  handle?: {
    style?: React.CSSProperties;
  };
  max?: number;
  min?: number;
  size?: number;
}

export interface PaneResizeData {
  activePrev?: {
    size: number;
  };
  activeNext?: {
    size: number;
  };
  index?: number;
}

interface PaneResizeProps {
  direction: 'horizontal' | 'vertical';
  panes: InputPane[];
  onPaneResize?: () => void;
  onPaneResizeStop?: (data: PaneResizeData) => void;
  style?: React.CSSProperties;
  className?: string;
}

const PaneResize: React.FC<PaneResizeProps> = ({
  direction,
  panes,
  onPaneResize,
  onPaneResizeStop,
  style,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [sizes, setSizes] = useState<number[]>([]);
  const [resizing, setResizing] = useState<number | null>(null);
  const [startPosition, setStartPosition] = useState(0);
  const [startSizes, setStartSizes] = useState<number[]>([]);

  // Initialize pane sizes
  useEffect(() => {
    if (containerRef.current && panes.length) {
      const containerSize = direction === 'horizontal' ? 
        containerRef.current.clientWidth : 
        containerRef.current.clientHeight;
      
      const initialSizes = panes.map(pane => {
        if (pane.fixed && pane.size) return pane.size;
        return (containerSize - getTotalFixedSize()) / getNonFixedCount();
      });
      
      setSizes(initialSizes);
    }
  }, [panes, direction]);
  
  // Get total size of fixed panes
  const getTotalFixedSize = () => {
    return panes.reduce((total, pane) => {
      if (pane.fixed && typeof pane.size === 'number') {
        return total + pane.size;
      }
      return total;
    }, 0);
  };
  
  // Get count of non-fixed panes
  const getNonFixedCount = () => {
    return panes.filter(pane => !pane.fixed).length || 1;
  };
  
  // Start resize
  const handleMouseDown = (index: number, e: React.MouseEvent) => {
    e.preventDefault();
    setResizing(index);
    setStartPosition(direction === 'horizontal' ? e.clientX : e.clientY);
    setStartSizes([...sizes]);
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    if (onPaneResize) onPaneResize();
  };
  
  // Handle resize movement
  const handleMouseMove = (e: MouseEvent) => {
    if (resizing === null) return;
    
    const currentPosition = direction === 'horizontal' ? e.clientX : e.clientY;
    const difference = currentPosition - startPosition;
    
    const newSizes = [...startSizes];
    
    // Don't resize fixed panes
    if (!panes[resizing].fixed) {
      newSizes[resizing] = Math.max(
        panes[resizing].min || 50, 
        startSizes[resizing] + difference
      );
      
      // Use a definite number for Math.min
      if (typeof panes[resizing].max === 'number') {
        const maxValue: number = panes[resizing].max as number;
        newSizes[resizing] = Math.min(maxValue, newSizes[resizing]);
      }
    }
    
    if (resizing + 1 < panes.length && !panes[resizing + 1].fixed) {
      newSizes[resizing + 1] = Math.max(
        panes[resizing + 1].min || 50,
        startSizes[resizing + 1] - difference
      );
      
      // Use a definite number for Math.min
      if (typeof panes[resizing + 1].max === 'number') {
        const maxValue: number = panes[resizing + 1].max as number;
        newSizes[resizing + 1] = Math.min(maxValue, newSizes[resizing + 1]);
      }
    }
    
    setSizes(newSizes);
  };
  
  // End resize
  const handleMouseUp = () => {
    if (resizing !== null && onPaneResizeStop) {
      onPaneResizeStop({
        activePrev: { size: sizes[resizing] },
        activeNext: resizing + 1 < sizes.length ? { size: sizes[resizing + 1] } : undefined,
        index: resizing
      });
    }
    
    setResizing(null);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  return (
    <div
      ref={containerRef}
      className={`pane-resize ${direction} ${className}`}
      style={{
        display: 'flex',
        flexDirection: direction === 'horizontal' ? 'row' : 'column',
        width: '100%',
        height: '100%',
        ...style
      }}
    >
      {panes.map((pane, index) => {
        const isLastPane = index === panes.length - 1;
        
        return (
          <React.Fragment key={pane.key}>
            <div
              style={{
                [direction === 'horizontal' ? 'width' : 'height']: 
                  pane.fixed ? `${pane.size}px` : `${sizes[index] || 0}px`,
                [direction === 'horizontal' ? 'height' : 'width']: '100%',
                position: 'relative',
                overflow: 'auto'
              }}
            >
              {pane.children}
              
              {!isLastPane && pane.handle && (
                <div
                  className={`resize-handle ${direction}`}
                  onMouseDown={(e) => handleMouseDown(index, e)}
                  style={{
                    position: 'absolute',
                    cursor: direction === 'horizontal' ? 'col-resize' : 'row-resize',
                    zIndex: 10,
                    ...(direction === 'horizontal' 
                      ? { width: '6px', right: '-3px', top: 0, bottom: 0 }
                      : { height: '6px', bottom: '-3px', left: 0, right: 0 }),
                    ...pane.handle.style
                  }}
                />
              )}
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default PaneResize;
