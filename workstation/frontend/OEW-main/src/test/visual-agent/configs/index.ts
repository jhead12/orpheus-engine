import { VisualTestConfig } from "../types";
import { DNRConfig } from "./DNRConfig";
import { ScrollbarConfig } from "./ScrollbarConfig";

/**
 * Map of all component test configurations
 */
export const ComponentConfigs: Record<string, VisualTestConfig> = {
  DNR: DNRConfig,
  Scrollbar: ScrollbarConfig,
  // Add more component configs here
};

/**
 * Get all component test configurations
 */
export function getAllConfigs(): VisualTestConfig[] {
  return Object.values(ComponentConfigs);
}

/**
 * Get a specific component configuration by name
 */
export function getConfig(componentName: string): VisualTestConfig | undefined {
  // Case-insensitive matching
  const key = Object.keys(ComponentConfigs).find(
    (key) => key.toLowerCase() === componentName.toLowerCase()
  );

  return key ? ComponentConfigs[key] : undefined;
}

/**
 * Get a component test configuration by name
 */
export function getConfigByName(name: string): VisualTestConfig | undefined {
  return ComponentConfigs[name];
}

/**
 * Priority order for generating tests
 */
export const GenerationPriority: string[] = [
  "DNR",
  "Scrollbar",
  "Lane",
  "PaneResize",
  "SyncScrollPane",
  "WindowAutoScroll",
];
