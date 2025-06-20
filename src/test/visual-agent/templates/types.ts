export interface VisualTestState {
  name: string;
  props?: Record<string, unknown>;
  interactions?: VisualTestInteraction[];
}

export interface VisualTestInteraction {
  type: string;
  target: string;
  value?: unknown;
}

export interface VisualTestTemplateData {
  ComponentName: string;
  ComponentPath: string;
  componentName: string;
  testNamePattern: string;
  containerStyle: string;
  states: VisualTestState[];
  props?: Record<string, unknown>;
  captureGif?: boolean;
  animationDuration?: number;
}

export interface VisualTestTemplate {
  generate: (data: VisualTestTemplateData) => string;
}
