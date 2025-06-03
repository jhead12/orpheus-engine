import React from 'react';
import { WorkstationProvider } from '../../../../shared/packages/contexts/src/WorkstationContext';
import SharedWorkstation from '../../../../shared/packages/components/src/Workstation';

const Workstation: React.FC = () => {
  return (
    <WorkstationProvider>
      <SharedWorkstation 
        isDesktopMode={true}
        className="electron-workstation"
        style={{
          borderRadius: '8px',
          overflow: 'hidden',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)'
        }}
      />
    </WorkstationProvider>
  );
};

export default Workstation;
