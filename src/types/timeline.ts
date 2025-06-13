/**
 * Timeline settings and related types
 */
export interface TimelineSettings {
  beatWidth: number;
  timeSignature: {
    beats: number;
    noteValue: number;
  };
  horizontalScale: number;
}
