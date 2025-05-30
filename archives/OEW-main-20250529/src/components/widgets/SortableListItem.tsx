import React, { FC, ReactNode } from 'react';

interface SortableListItemProps {
  children?: ReactNode;
  className?: string;
  index: number;
  key?: string | number;
}

const SortableListItem: FC<SortableListItemProps> = ({ children, className, index }) => {
  return <div className={`sortable-item ${className || ''}`} data-index={index}>{children}</div>;
};

export default SortableListItem;
