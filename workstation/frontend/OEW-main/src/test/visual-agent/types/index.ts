/**
 * Types for the Visual Testing Agent
 */

export interface InteractionStep {
  type:
    | "click"
    | "hover"
    | "drag"
    | "input"
    | "mouseDown"
    | "mouseMove"
    | "mouseUp";
  target: string;
  value?: any;
}

export interface ComponentState {
  name: string;
  props?: Record<string, any>;
  interactions?: InteractionStep[];
}

export interface VisualTestConfig {
  componentName: string; // Name of the component to test
  componentPath?: string; // Path to the component relative to src/
  props: Record<string, any>; // Default props for the component
  states: ComponentState[]; // Different states to test
  containerStyle?: string; // CSS styles for the test container
  animationDuration?: number; // Duration for GIF recording in ms
  captureGif?: boolean; // Whether to capture a GIF for animated interactions
  testNamePattern?: string; // Test name pattern, defaults to @visual or @visual-gif
}

export interface GenerateOptions {
  component?: string; // Component name to generate tests for, if undefined generate all
  force?: boolean; // Whether to overwrite existing tests
}
