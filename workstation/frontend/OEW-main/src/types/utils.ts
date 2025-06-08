// Utility type definitions
export interface WindowAutoScrollThresholds {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
}

export interface Region {
  start: number;
  end: number;
}

export interface SortData {
  sourceIndex: number;
  edgeIndex?: number;
  destIndex?: number;
}

export interface Preferences {
  theme: "light" | "dark" | "system";
  color: "rose" | "violet" | "azure" | "aqua" | "olive" | "citrus" | "crimson";
  audioSettings: {
    sampleRate: number;
    bufferSize: number;
    inputDevice: string;
    outputDevice: string;
  };
  midiSettings: {
    inputDevice: string;
    outputDevice: string;
  };
}
