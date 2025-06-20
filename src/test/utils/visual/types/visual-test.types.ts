/**
 * Visual Test State Interface
 * Represents a state configuration for a visual test
 */
export interface VisualTestState {
  /** The name of the state being tested */
  name: string;
  /** Optional props to apply to the component for this state */
  props?: Record<string, unknown>;
  /** Optional list of interactions to perform in sequence */
  interactions?: VisualTestInteraction[];
}

/**
 * Visual Test Interaction Interface
 * Represents an interaction to perform during visual testing
 */
export interface VisualTestInteraction {
  /** The type of interaction (click, hover, etc.) */
  type: string;
  /** The test ID of the element to interact with */
  target: string;
  /** Optional value to pass with the interaction */
  value?: unknown;
}

/**
 * Visual Test Template Data Interface
 * Contains all configuration needed to generate a visual test
 */
export interface VisualTestTemplateData {
  /** The name of the component being tested */
  ComponentName: string;
  /** The relative path to import the component from */
  ComponentPath: string;
  /** The lowercase name used for file naming */
  componentName: string;
  /** The pattern to use for test names */
  testNamePattern: string;
  /** CSS style to apply to the test container */
  containerStyle: string;
  /** The states to test */
  states: VisualTestState[];
  /** Default props to apply to all states */
  props?: Record<string, unknown>;
  /** Whether to capture GIFs instead of static screenshots */
  captureGif?: boolean;
  /** Duration for GIF recording in milliseconds */
  animationDuration?: number;
}

/**
 * Visual Test Template Interface
 * Represents a visual test template that can generate test code
 */
export interface VisualTestTemplate {
  /** Generates test code from template data */
  generate: (data: VisualTestTemplateData) => string;
}
