import React from 'react';

interface TrackIconProps {
  type: string;
  color?: string;
}

const TrackIcon: React.FC<TrackIconProps> = ({ type, color = 'currentColor' }) => {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill={color}>
      <rect x="2" y="2" width="12" height="12" rx="2" />
    </svg>
  );
};

export default TrackIcon;
