// Export all type definitions
export * from "./core";
// Export components types separately to avoid name clashes
export type { BaseClipComponentProps } from "./components";
export * from "./audio";
export * from "./utils";
export * from "./context";
export * from "./styles";

// Re-export MUI augmentations
export * from "./mui";
