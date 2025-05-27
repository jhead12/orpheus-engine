import React, { forwardRef, ReactNode } from 'react';

interface SyncScrollPaneProps {
  id?: string;
  children?: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onWheel?: (e: React.WheelEvent) => void;
}

const SyncScrollPane = forwardRef<HTMLDivElement, SyncScrollPaneProps>((props, ref) => {
  return <div ref={ref} {...props} />;
});

export default SyncScrollPane;
