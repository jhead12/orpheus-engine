import React from 'react';
import { WorkstationProvider } from '../../../shared/packages/contexts/src/index';
import SharedWorkstation from '../../../shared/packages/components/src/Workstation';

interface WorkstationProps {
  isDesktopMode?: boolean;
}

const Workstation: React.FC<WorkstationProps> = ({ isDesktopMode = false }) => {
  return (
    <WorkstationProvider>
      <SharedWorkstation 
        isDesktopMode={isDesktopMode}
        className="web-workstation"
      />
    </WorkstationProvider>
  );
};

export default Workstation;
