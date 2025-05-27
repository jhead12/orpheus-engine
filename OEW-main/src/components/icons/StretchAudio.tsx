import React from 'react';

interface StretchAudioProps {
  size?: number;
  style?: React.CSSProperties;
}

/**
 * StretchAudio icon component
 * Used to indicate audio stretching functionality
 */
const StretchAudio: React.FC<StretchAudioProps> = ({ size = 24, style }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
    >
      <path d="M4 10l3 3 3-3" />
      <path d="M14 10l3 3 3-3" />
      <line x1="7" y1="13" x2="7" y2="20" />
      <line x1="17" y1="13" x2="17" y2="20" />
      <line x1="7" y1="4" x2="7" y2="7" />
      <line x1="17" y1="4" x2="17" y2="7" />
    </svg>
  );
};

export default StretchAudio;