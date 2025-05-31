import React from 'react';

interface ScrollbarProps {
  axis: 'x' | 'y';
  style?: React.CSSProperties;
  targetEl: HTMLElement | null;
  thumbStyle?: React.CSSProperties;
}

// Simplified implementation
const Scrollbar: React.FC<ScrollbarProps> = ({ axis, style, thumbStyle }) => {
  return (
    <div className={`scrollbar ${axis}`} style={style}>
      <div className="scrollbar-thumb" style={thumbStyle}></div>
    </div>
  );
};

export default Scrollbar;