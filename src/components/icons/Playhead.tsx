import React from 'react';

interface PlayheadProps {
  size?: number;
  style?: React.CSSProperties;
}

const Playhead: React.FC<PlayheadProps> = ({ size = 24, style }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={style}>
      <path d="M10 6v12l8.5-6z" fill="currentColor" />
    </svg>
  );
};

export default Playhead;