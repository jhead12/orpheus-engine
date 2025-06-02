// Test setup for vitest
import { vi } from 'vitest'

// Mock vitest functions for backward compatibility
if (typeof global !== 'undefined') {
  (global as any).vi = vi;
}

export { vi };
