import { VisualTestConfig } from "../types";
import { DNRConfig } from "./DNRConfig";
import { ScrollbarConfig } from "./ScrollbarConfig";
import { TimelineConfig } from "./TimelineConfig";
import { MixerConfig } from "./MixerConfig";
import { ClipComponentConfig } from "./ClipComponentConfig";
import { TrackComponentConfig } from "./TrackComponentConfig";
import { KnobConfig } from "./KnobConfig";
import { MeterConfig } from "./MeterConfig";
import { SidePanelConfig } from "./SidePanelConfig";

/**
 * Map of all component test configurations
 */
export const ComponentConfigs: Record<string, VisualTestConfig> = {
  DNR: DNRConfig,
  Scrollbar: ScrollbarConfig,
  Timeline: TimelineConfig,
  Mixer: MixerConfig,
  ClipComponent: ClipComponentConfig,
  TrackComponent: TrackComponentConfig,
  Knob: KnobConfig,
  Meter: MeterConfig,
  SidePanel: SidePanelConfig,
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
  "Timeline",
  "Mixer", 
  "TrackComponent",
  "ClipComponent",
  "Knob",
  "Meter",
  "SidePanel",
  "DNR",
  "Scrollbar",
  "Lane",
  "PaneResize",
  "SyncScrollPane",
  "WindowAutoScroll",
];
