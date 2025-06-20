/**
 * Visual Test Setup
 */

import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import { cleanupVisualTestContainer } from './utils/visual/test-container';
import '@testing-library/jest-dom';

// Clean up after each test
afterEach(() => {
  cleanup();
  cleanupVisualTestContainer();
});
