import React, { FC } from 'react';

interface ScrollbarProps {
  axis: "x" | "y";
  targetEl?: HTMLElement | null;
  thumbStyle?: React.CSSProperties;
  style?: React.CSSProperties;
}

const Scrollbar: FC<ScrollbarProps> = ({ axis, targetEl, thumbStyle, style }) => {
  return (
    <div className={`scrollbar ${axis}-axis`} style={style}>
      <div className="scrollbar-thumb" style={thumbStyle}></div>
    </div>
  );
};

export default Scrollbar;
