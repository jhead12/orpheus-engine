// Style-related type definitions
import { CSSProperties } from "react";

// Theme colors from themes.css
export interface ThemeColors {
  bg1: string;
  bg2: string;
  bg3: string;
  bg4: string;
  bg5: string;
  bg6: string;
  bg7: string;
  bg8: string;
  bg9: string;
  bg10: string;
  bg11: string;
  bg12: string;
  border1: string;
  border2: string;
  border3: string;
  border4: string;
  border5: string;
  border6: string;
  border7: string;
  border8: string;
  border9: string;
  border10: string;
  border11: string;
  border12: string;
  border13: string;
  fg1: string;
  fg2: string;
  fg3: string;
  mixBlendMode: string;
  opacity1: number;
}

// Color scheme types
export type Theme = "light" | "dark" | "system";
export type ColorScheme =
  | "rose"
  | "azure"
  | "aqua"
  | "crimson"
  | "olive"
  | "violet"
  | "citrus"
  | "mono";

export interface ColorSet {
  color1: string;
  color1Muted: string;
}

// Component style interfaces
export interface ComponentStyles {
  container?: CSSProperties;
  content?: CSSProperties;
  header?: CSSProperties;
  footer?: CSSProperties;
  button?: CSSProperties;
  icon?: CSSProperties;
  input?: CSSProperties;
  label?: CSSProperties;
  text?: CSSProperties;
}

// Electron-specific styles
export interface ElectronStyles {
  titleBar?: CSSProperties;
  windowControls?: CSSProperties;
  dragRegion?: CSSProperties;
}

// DAW-specific styles
export interface DAWStyles {
  mainContent?: CSSProperties;
  timeline?: CSSProperties;
  transport?: CSSProperties;
  mixer?: CSSProperties;
  trackList?: CSSProperties;
  trackControls?: CSSProperties;
}

// Common style utilities
export interface StyleClasses {
  [key: string]: string;
}

export interface StyleProps {
  className?: string;
  style?: CSSProperties;
  theme?: Theme;
  color?: ColorScheme;
}

// Font definitions from App.css
export type FontFamily = "Abel" | "Manrope";
export type FontWeight = 200 | 300 | 400 | 500 | 600 | 700;

// Layout and spacing utilities
export interface Spacing {
  top?: number | string;
  right?: number | string;
  bottom?: number | string;
  left?: number | string;
}

export interface Size {
  width?: number | string;
  height?: number | string;
  minWidth?: number | string;
  minHeight?: number | string;
  maxWidth?: number | string;
  maxHeight?: number | string;
}

export interface FlexProps {
  flex?: string | number;
  flexGrow?: number;
  flexShrink?: number;
  flexBasis?: number | string;
  justifyContent?: string;
  alignItems?: string;
  alignSelf?: string;
}

// Theme context type
export interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  color: ColorScheme;
  setColor: (color: ColorScheme) => void;
}
