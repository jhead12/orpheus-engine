import React from 'react';

export interface BaseClipComponentProps {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const BaseClipComponent: React.FC<BaseClipComponentProps> = ({ 
  children, 
  className = '', 
  style = {} 
}) => {
  return (
    <div className={`base-clip-component ${className}`} style={style}>
      {children}
    </div>
  );
};

export default BaseClipComponent;
