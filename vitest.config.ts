/// <reference types="vitest" />
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import * as path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      { find: "@", replacement: path.resolve(__dirname, "./workstation/frontend/src") },
      { find: "@orpheus/utils", replacement: path.resolve(__dirname, "./workstation/frontend/src/services/utils") },
      { find: "@orpheus/components", replacement: path.resolve(__dirname, "./workstation/frontend/src/components") },
      { find: "@orpheus/services", replacement: path.resolve(__dirname, "./workstation/frontend/src/services") },
      { find: "@orpheus/screens", replacement: path.resolve(__dirname, "./workstation/frontend/src/screens") },
      { find: "@orpheus/contexts", replacement: path.resolve(__dirname, "./workstation/frontend/src/contexts") },
      { find: "@orpheus/types", replacement: path.resolve(__dirname, "./workstation/frontend/src/types") },
      { find: "@orpheus/test", replacement: path.resolve(__dirname, "./workstation/frontend/src/test") },
      { find: "@orpheus/widgets", replacement: path.resolve(__dirname, "./workstation/frontend/src/components/widgets") },
      { find: "@orpheus/workstation", replacement: path.resolve(__dirname, "./workstation/frontend/src/screens/workstation") },
      { find: "@orpheus", replacement: path.resolve(__dirname, "./workstation/frontend/src") }
    ]
  },
  test: {
    environment: "jsdom",
    include: ["workstation/frontend/src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    globals: true,
    setupFiles: ["workstation/frontend/src/setupTests.ts"],
    coverage: {
      reporter: ["text", "json", "html"],
      reportsDirectory: "./test-results/coverage",
    },
    outputFile: {
      html: "./test-results/html/index.html",
    },
    reporters: ["default", "html"],
    deps: {
      inline: ["jest-image-snapshot"],
    },
    exclude: ["**/node_modules/**", "**/__snapshots__/**"],
    testTimeout: 10000, // Increased timeout for visual tests
    snapshotFormat: {
      printBasicPrototype: true,
    },
  },
});
