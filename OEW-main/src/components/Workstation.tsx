import React from 'react';
import { useMixer } from '../context/MixerContext'; 

const Workstation: React.FC = () => {
  const { mixerHeight } = useMixer();
  
  return (
    <div style={{ height: `calc(100% - ${mixerHeight}px)` }}>
      {/* Rest of your workstation content */}
      <div className="workstation-content">
        {/* Content will go here */}
      </div>
    </div>
  );
};

// Export with a wrapper that ensures the provider hierarchy is correct
export default Workstation;
