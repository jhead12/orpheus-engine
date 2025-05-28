import React from 'react';
import { useMixer } from '../context/MixerContext'; // Make sure path is correct

const Workstation: React.FC = () => {
  const { mixerHeight } = useMixer();
  
  return (
    <div style={{ height: `calc(100% - ${mixerHeight}px)` }}>
      {/* Rest of your workstation content */}
    </div>
  );
};

export default Workstation;
