/**
 * Test Utilities Index
 * Centralized export for all test utilities across the Orpheus Engine project
 */

// Global test mocks and setup
export * from './global-test-mocks';

// Base workstation test utilities
export * from './workstation-test-utils';

// Mixer-specific test utilities (selective exports to avoid conflicts)
export {
  waitForMixerToRender,
  simulateVolumeChange,
  simulatePanChange,
  createMixerTestSuite,
} from './mixer-test-utils';

// Mixer helper utilities
export * from './mixer-helper';

// Service mocks
export * from './mocks/PythonBackendServiceMock';
export * from './mocks/AudioServiceMock';
export * from './mocks/CoreTypesMock';
export * from './mocks/ReactRouterMock';

// Test type definitions
export * from './mixerTestTypes';

// Setup utilities for specific components - import selectively to avoid conflicts
export {
  setupWorkstationMixerTest,
  // Re-exporting only functions, as types are already exported from CoreTypesMock
} from './workstation-mixer-setup';

// Audio-specific test utilities
export * from './audio-test-utils';

// Timeline-specific test utilities - import selectively to avoid conflicts
export {
  createMockTimelinePosition,
  createMockTimeSignature,
  createMockTempoMap,
  createMockClip,
  // Avoid re-exporting createMockTimelineContext as it's already exported from workstation-test-utils
} from './timeline-test-utils';

// Visual test utilities
export * from './visual/screenshot';
export * from './visual/gif-recorder';
export * from './visual/visual-test-generator';
export * from './visual/test-container';

// Visual test helpers
export {
  setupVisualTestContainer,
  cleanupVisualTestContainer,
  expectVisualSnapshot,
} from '../helpers/visual-test-utils';

// Screenshot utilities
export { expectScreenshot } from '../helpers/screenshot';

/**
 * Common test setup function for all workstation components
 */
export const setupWorkstationTest = () => {
  const {
    setupWorkstationTestEnvironment,
    cleanupWorkstationTest,
  } = require('./workstation-test-utils');

  beforeEach(() => {
    setupWorkstationTestEnvironment();
  });

  afterEach(() => {
    cleanupWorkstationTest();
  });
};

/**
 * Quick setup for mixer-specific tests
 */
export const setupMixerTest = () => {
  const {
    setupWorkstationTestEnvironment,
    createMockMixerContext,
    createMockWorkstationContext,
  } = require('./workstation-test-utils');

  beforeEach(() => {
    setupWorkstationTestEnvironment();
  });

  return {
    getMixerContext: createMockMixerContext,
    getWorkstationContext: createMockWorkstationContext,
  };
};

/**
 * Type definitions for test environment props
 */
export interface TestEnvironmentProps {
  mixer?: Record<string, any>;
  workstation?: Record<string, any>;
  [key: string]: any;
}

/**
 * Utility to create a complete test environment with all contexts
 */
export const createCompleteTestEnvironment = (
  customProps: TestEnvironmentProps = {},
) => {
  const {
    createMockMixerContext,
    createMockWorkstationContext,
  } = require('./workstation-test-utils');

  return {
    mixerContext: createMockMixerContext(customProps.mixer || {}),
    workstationContext: createMockWorkstationContext(
      customProps.workstation || {},
    ),
    ...customProps,
  };
};
