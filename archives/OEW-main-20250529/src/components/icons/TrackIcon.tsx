import React from 'react';

interface TrackIconProps {
  type: string; 
  color?: string;
}

const TrackIcon: React.FC<TrackIconProps> = ({ type, color = 'currentColor' }) => {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24">
      <rect x="3" y="6" width="18" height="12" rx="2" fill={color} />
    </svg>
  );
};

export default TrackIcon;