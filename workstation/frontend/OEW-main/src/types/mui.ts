// MUI-specific type definitions
export interface MUIStyleOverrides {
  root?: React.CSSProperties;
  [key: string]: React.CSSProperties | undefined;
}

export interface MUIComponentProps {
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}
