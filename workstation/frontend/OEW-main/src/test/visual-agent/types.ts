/**
 * Types for the visual test agent
 */

/**
 * Configuration for a visual component test
 */
export interface VisualTestConfig {
  /** Name of the component to test */
  componentName: string;

  /** Import path for the component */
  importPath: string;

  /** Default props to pass to the component */
  props: Record<string, any>;

  /** Different states to test */
  states: Array<{
    /** Name of this state */
    name: string;

    /** Component props for this state (overrides default props) */
    props?: Record<string, any>;

    /** User interactions to simulate */
    interactions?: Array<{
      /** Type of interaction */
      type:
        | "click"
        | "hover"
        | "drag"
        | "input"
        | "mousedown"
        | "mouseup"
        | "mousemove";

      /** CSS selector or data-testid to target */
      target: string;

      /** Optional value for the interaction (e.g. text for input) */
      value?: any;

      /** Delay in milliseconds before this interaction */
      delay?: number;
    }>;
  }>;

  /** CSS styles for the test container */
  containerStyle?: string;

  /** Duration in ms for GIF recording */
  animationDuration?: number;

  /** Whether to capture a GIF */
  captureGif?: boolean;

  /** Additional imports needed for the test */
  additionalImports?: string[];

  /** Additional context providers to wrap the component in */
  contextProviders?: Array<{
    import: string;
    props?: Record<string, any>;
  }>;
}

/**
 * Configuration for the visual test agent
 */
export interface AgentConfig {
  /** Base output directory for test files */
  testOutputDir: string;

  /** Base output directory for GIFs */
  gifOutputDir: string;

  /** Default container style */
  defaultContainerStyle: string;

  /** Default animation duration in ms */
  defaultAnimationDuration: number;
}
