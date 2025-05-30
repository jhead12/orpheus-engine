import React, { forwardRef, type HTMLAttributes, type PropsWithChildren } from 'react';

interface SyncScrollPaneProps extends HTMLAttributes<HTMLDivElement> {
  id?: string;
  onWheel?: (e: React.WheelEvent) => void;
}

const SyncScrollPane = forwardRef<HTMLDivElement, SyncScrollPaneProps>((props, ref) => {
  return React.createElement('div', { 
    ...props,
    ref
  });
});

SyncScrollPane.displayName = 'SyncScrollPane';

export default SyncScrollPane;
