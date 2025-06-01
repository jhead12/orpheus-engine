import React, { FC, ReactNode } from 'react';

export interface SortData {
  sourceIndex: number;
  destIndex: number;
  edgeIndex: number;
}

interface SortableListProps {
  children?: ReactNode;
  autoScroll?: { thresholds?: number[] };
  cancel?: string;
  onSortUpdate?: (data: SortData) => void;
  onStart?: (e: React.MouseEvent, data: SortData) => void;
  onEnd?: (e: MouseEvent, data: SortData) => void;
}

const SortableList: FC<SortableListProps> = ({ children, autoScroll, cancel, onSortUpdate, onStart, onEnd }) => {
  return <div className="sortable-list">{children}</div>;
};

export default SortableList;
