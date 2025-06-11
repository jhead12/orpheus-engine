import { vi, expect } from 'vitest';
import { screen } from '@testing-library/react';

// Re-export shared utilities from workstation-test-utils
export {
  setupWorkstationTestEnvironment as setupGlobalMocks,
  createMockTrack,
  createWorkstationTracks as createMockTracks,
  createMockWorkstationContext,
  createMockMixerContext,
  createMockWidgets,
  createMockSortableComponents as createMockComponents,
  createMockFXComponents,
  createMockWorkstationUtils as createMockUtils,
  createManyTracks,
  assertVolumeControl,
  assertPanControl,
  assertButtonState,
  createBasicRenderingTests,
  cleanupWorkstationTest,
} from './workstation-test-utils';

/**
 * Mixer-specific test utilities
 * This file provides specialized mixer mocks and utilities that extend
 * the base workstation test utilities.
 */

// Mixer-specific helpers
export const waitForMixerToRender = async () => {
  // Wait for any async operations in mixer
  await new Promise(resolve => setTimeout(resolve, 50));
};

export const simulateVolumeChange = async (volumeFader: HTMLElement, value: string) => {
  const event = new Event('change', { bubbles: true });
  Object.defineProperty(event, 'target', {
    writable: false,
    value: { value },
  });
  volumeFader.dispatchEvent(event);
  await waitForMixerToRender();
};

export const simulatePanChange = async (panKnob: HTMLElement, value: string) => {
  const event = new Event('change', { bubbles: true });
  Object.defineProperty(event, 'target', {
    writable: false,
    value: { value },
  });
  panKnob.dispatchEvent(event);
  await waitForMixerToRender();
};

// Mixer-specific test suite generators
export const createMixerTestSuite = (renderFunction: () => void) => ({
  ...createBasicRenderingTests(renderFunction),
  
  'should display volume controls': () => {
    renderFunction();
    
    expect(screen.getByTestId('mixer-volume-track-1')).toBeInTheDocument();
    expect(screen.getByTestId('mixer-volume-track-2')).toBeInTheDocument();
  },
  
  'should display pan controls': () => {
    renderFunction();
    
    expect(screen.getByTestId('mixer-pan-track-1')).toBeInTheDocument();
    expect(screen.getByTestId('mixer-pan-track-2')).toBeInTheDocument();
  },
  
  'should display mute/solo/arm buttons': () => {
    renderFunction();
    
    expect(screen.getByTestId('mixer-mute-track-1')).toBeInTheDocument();
    expect(screen.getByTestId('mixer-solo-track-1')).toBeInTheDocument();
    expect(screen.getByTestId('mixer-arm-track-1')).toBeInTheDocument();
  },
});

// Mixer-specific assertion helpers
export const assertMixerChannelRenders = (trackId: string) => {
  expect(screen.getByTestId(`mixer-channel-${trackId}`)).toBeInTheDocument();
  expect(screen.getByTestId(`mixer-volume-${trackId}`)).toBeInTheDocument();
  expect(screen.getByTestId(`mixer-pan-${trackId}`)).toBeInTheDocument();
  expect(screen.getByTestId(`mixer-mute-${trackId}`)).toBeInTheDocument();
  expect(screen.getByTestId(`mixer-solo-${trackId}`)).toBeInTheDocument();
  expect(screen.getByTestId(`mixer-arm-${trackId}`)).toBeInTheDocument();
};

export const assertMasterChannelRenders = () => {
  expect(screen.getByTestId('mixer-master-channel')).toBeInTheDocument();
  expect(screen.getByTestId('mixer-master-volume')).toBeInTheDocument();
  expect(screen.getByTestId('mixer-master-mute')).toBeInTheDocument();
};

export const assertMixerState = (trackId: string, state: { 
  muted?: boolean; 
  solo?: boolean; 
  armed?: boolean; 
}) => {
  if (state.muted !== undefined) {
    assertButtonState(`mixer-mute-${trackId}`, state.muted);
  }
  if (state.solo !== undefined) {
    assertButtonState(`mixer-solo-${trackId}`, state.solo);
  }
  if (state.armed !== undefined) {
    assertButtonState(`mixer-arm-${trackId}`, state.armed);
  }
};
