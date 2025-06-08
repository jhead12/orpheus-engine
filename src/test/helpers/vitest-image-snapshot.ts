import { expect } from "vitest";
import { toMatchImageSnapshot } from "jest-image-snapshot";

// Extend Vitest's expect with the jest-image-snapshot matcher
expect.extend({ toMatchImageSnapshot });

// Export the extended expect for use in tests
export { expect as imageSnapshotExpect };
