import React, { FC, ReactNode, useState, useEffect, useRef, createContext, useContext } from 'react';
import WindowAutoScroll from "../WindowAutoScroll";

export interface SortData {
  sourceIndex: number;
  destIndex: number;
  edgeIndex: number;
}

// Define interface for WindowAutoScroll within this file
interface AutoScrollProps {
  active: boolean;
  eventType: string;
  thresholds?: number[];
  withinBounds?: boolean;
}

interface SortableListProps {
  children?: ReactNode;
  autoScroll?: { thresholds?: number[] };
  cancel?: string;
  onSortUpdate?: (data: SortData) => void;
  onStart?: (e: React.MouseEvent, data: SortData) => void;
  onEnd?: (e: MouseEvent, data: SortData) => void;
}

const SortableListContext = createContext<any>(null);

// Define the component once and export it
const SortableList: FC<SortableListProps> = ({ 
  children, 
  autoScroll, 
  cancel, 
  onSortUpdate, 
  onStart, 
  onEnd 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const items = useRef<HTMLElement[]>([]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Your existing mouse move logic
    };

    const handleMouseUp = (e: MouseEvent) => {
      // Your existing mouse up logic
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    } 

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  // Simple implementation for the component
  return (
    <SortableListContext.Provider value={{}}>
      <div 
        className="sortable-list"
        ref={ref}
        onMouseDown={(e) => {
          if (!cancel || !(e.target as HTMLElement).closest(cancel)) {
            setIsDragging(true);
            const el = e.currentTarget as HTMLElement;
            const sourceIndex = items.current.indexOf(el);
            onStart?.(e, {sourceIndex, edgeIndex: -1, destIndex: -1});
          }
        }}
        style={{ display: "block" }}
      >
        {children}
        {isDragging && autoScroll && (
          <WindowAutoScroll
            active={true}
            eventType="drag"
            thresholds={autoScroll.thresholds}
            withinBounds
          />
        )}
      </div>
    </SortableListContext.Provider>
  );
};

interface SortableListItemProps {
  children: React.ReactNode;
  className?: string;
  index: number;
  style?: React.CSSProperties;
}

export const SortableListItem = ({ children, className, index, style }: SortableListItemProps) => {
  const { onMouseDown, registerItem, unregisterItem, updateIndices } = useContext(SortableListContext)!
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current!;
    registerItem(element, index);
    return () => unregisterItem(element);
  }, [])

  useEffect(() => updateIndices(ref.current!, index), [index])

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.defaultPrevented || e.target instanceof HTMLInputElement || 
        e.target instanceof HTMLButtonElement || e.target instanceof HTMLTextAreaElement || 
        e.target instanceof HTMLSelectElement || e.target instanceof HTMLOptionElement || 
        e.target instanceof HTMLOptGroupElement || e.target instanceof HTMLVideoElement || 
        e.target instanceof HTMLAudioElement || e.button !== 0) return;

    onMouseDown(e);
  }

  return (
    <div className={className} onMouseDown={handleMouseDown} ref={ref} style={style}>
      {children}
    </div>
  )
}

export default SortableList;