import React from 'react';
import { WorkstationProvider } from '../../../../shared/packages/contexts/src/WorkstationContext';
import SharedWorkstation from '../../../../shared/packages/components/src/Workstation';

const Workstation: React.FC = () => {
  return (
    <WorkstationProvider>
      <SharedWorkstation 
        isDesktopMode={false}
        className="oew-workstation"
      />
    </WorkstationProvider>
  );
};

export default Workstation;
