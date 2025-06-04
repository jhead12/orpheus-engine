// Constants and utilities for the workstation
import { Clip, Track, AutomationLane } from "../types/types";

export const BASE_MAX_MEASURES = 1600; // Maximum number of measures at time signature 4/4
export const BASE_BEAT_WIDTH = 48;
export const BASE_HEIGHT = 64;

export function scrollToAndAlign(
  element: HTMLElement,
  target: { left?: number; top?: number },
  alignment: { left?: number; top?: number }
) {
  // Implementation for scrolling to element
  if (target.left !== undefined && alignment.left !== undefined) {
    element.scrollLeft = target.left - element.clientWidth * alignment.left;
  }
  if (target.top !== undefined && alignment.top !== undefined) {
    element.scrollTop = target.top - element.clientHeight * alignment.top;
  }
}

export function getVolumeGradient(automated: boolean): string {
  return automated ? 'linear-gradient(to right, #ff0000, #00ff00)' : '#0080ff';
}

export function sliceClip(clip: any, maxPos: any): any[] {
  return [clip]; // Mock implementation
}

export function volumeToNormalized(volume: number): number {
  return Math.max(0, Math.min(1, (volume + 60) / 60));
}

export function isValidAudioTrackFileFormat(type: string): boolean {
  return ['audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a'].includes(type);
}

export function isValidTrackFileFormat(type: string): boolean {
  return isValidAudioTrackFileFormat(type) || type === 'audio/midi';
}

export function waitForScrollWheelStop(element: HTMLElement, callback: () => void) {
  let timeout: NodeJS.Timeout;
  
  const handler = () => {
    clearTimeout(timeout);
    timeout = setTimeout(callback, 150);
  };
  
  element.addEventListener('scroll', handler);
  setTimeout(() => {
    element.removeEventListener('scroll', handler);
  }, 1000);
}

export const timelineEditorWindowScrollThresholds = {
  top: 50,
  bottom: 50,
  left: 50,
  right: 50
};

// Fix the automation lane value access
export function getAutomationLaneValue(automationLane: any): number {
  // Try different property names that might exist
  return automationLane?.value || 
         automationLane?.defaultValue || 
         automationLane?.points?.[0]?.value || 
         0;
}

// Fix automation lane access in line 49
export function getTrackAutomationValue(track: any, envelopeId: string): number {
  const lane = track.automationLanes?.find((l: any) => l.id === envelopeId);
  if (lane) {
    return getAutomationLaneValue(lane);
  }
  return 0;
}