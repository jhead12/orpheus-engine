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

// Audio-specific test utilities
export * from './audio-test-utils';

// Timeline-specific test utilities
export * from './timeline-test-utils';

// Visual test utilities
export { 
  runVisualTest,
  runAudioVisualTest,
  runSimpleVisualTest,
  setupVisualTestContainer,
  cleanupVisualTestContainer,
  expectVisualSnapshot,
} from '../helpers/visual-test-utils';

// Screenshot utilities
export { 
  expectScreenshot,
} from '../helpers/screenshot';

/**
 * Common test setup function for all workstation components
 */
export const setupWorkstationTest = () => {
  const { setupWorkstationTestEnvironment, cleanupWorkstationTest } = require('./workstation-test-utils');
  
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
    createMockWorkstationContext 
  } = require('./workstation-test-utils');
  
  beforeEach(() => {
    setupWorkstationTestEnvironment();
  });
  
  return {
    mockMixerContext: createMockMixerContext(),
    mockWorkstationContext: createMockWorkstationContext(),
  };
};

/**
 * Utility to create a complete test environment with all contexts
 */
export const createCompleteTestEnvironment = (customProps = {}) => {
  const { 
    createMockMixerContext, 
    createMockWorkstationContext 
  } = require('./workstation-test-utils');
  
  return {
    mixerContext: createMockMixerContext(customProps.mixer),
    workstationContext: createMockWorkstationContext(customProps.workstation),
    ...customProps,
  };
};
