import React, { FC, ReactNode } from 'react';

interface SyncScrollProps {
  children: ReactNode;
}

const SyncScroll: FC<SyncScrollProps> = ({ children }) => {
  return <div className="sync-scroll">{children}</div>;
};

export default SyncScroll;
