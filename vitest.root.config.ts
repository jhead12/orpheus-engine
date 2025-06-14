/// <reference types="vitest" />
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import * as path from "path";

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['react', 'react-dom'],
    force: true
  },
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: [
      // Force React to resolve from root node_modules
      { find: 'react', replacement: path.resolve(__dirname, 'node_modules/react') },
      { find: 'react-dom', replacement: path.resolve(__dirname, 'node_modules/react-dom') },
      // Main repository paths
      { find: "@", replacement: path.resolve(__dirname, "./workstation/frontend/src") },
      { find: "@orpheus/utils", replacement: path.resolve(__dirname, "./workstation/frontend/src/services/utils") },
      { find: "@orpheus/components", replacement: path.resolve(__dirname, "./workstation/frontend/src/components") },
      { find: "@orpheus/services", replacement: path.resolve(__dirname, "./workstation/frontend/src/services") },
      { find: "@orpheus/screens", replacement: path.resolve(__dirname, "./workstation/frontend/src/screens") },
      { find: "@orpheus/contexts", replacement: path.resolve(__dirname, "./workstation/frontend/src/contexts") },
      { find: "@orpheus/types", replacement: path.resolve(__dirname, "./workstation/frontend/src/types") },
      { find: "@orpheus/types/core", replacement: path.resolve(__dirname, "./workstation/frontend/src/types/core") },
      { find: "@orpheus/test", replacement: path.resolve(__dirname, "./workstation/frontend/src/test") },
      { find: "@orpheus/widgets", replacement: path.resolve(__dirname, "./workstation/frontend/src/components/widgets") },
      { find: "@orpheus/workstation", replacement: path.resolve(__dirname, "./workstation/frontend/src/screens/workstation") },
      { find: "@orpheus", replacement: path.resolve(__dirname, "./workstation/frontend/src") },
      
      // OEW-main submodule paths
      { find: "@oew-main", replacement: path.resolve(__dirname, "./workstation/frontend/OEW-main/src") },
      { find: "@oew-main/utils", replacement: path.resolve(__dirname, "./workstation/frontend/OEW-main/src/services/utils") },
      { find: "@oew-main/components", replacement: path.resolve(__dirname, "./workstation/frontend/OEW-main/src/components") },
      { find: "@oew-main/services", replacement: path.resolve(__dirname, "./workstation/frontend/OEW-main/src/services") },
      { find: "@oew-main/screens", replacement: path.resolve(__dirname, "./workstation/frontend/OEW-main/src/screens") },
      { find: "@oew-main/contexts", replacement: path.resolve(__dirname, "./workstation/frontend/OEW-main/src/contexts") },
      { find: "@oew-main/types", replacement: path.resolve(__dirname, "./workstation/frontend/OEW-main/src/types") },
      { find: "@oew-main/test", replacement: path.resolve(__dirname, "./workstation/frontend/OEW-main/src/test") },
      { find: "@oew-main/widgets", replacement: path.resolve(__dirname, "./workstation/frontend/OEW-main/src/components/widgets") },
      { find: "@oew-main/workstation", replacement: path.resolve(__dirname, "./workstation/frontend/OEW-main/src/screens/workstation") },
      
      // Cross-module imports (to fix symbolic link issues)
      { find: "@orpheus/oew-main/contexts", replacement: path.resolve(__dirname, "./workstation/frontend/OEW-main/src/contexts") },
      { find: "@orpheus/oew-main/types/core", replacement: path.resolve(__dirname, "./workstation/frontend/OEW-main/src/types/core") }
    ]
  },
  test: {
    environment: "jsdom",
    include: [
      "workstation/frontend/src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}",
      "workstation/frontend/OEW-main/src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"
    ],
    globals: true,
    setupFiles: [
      "./test-preload.js",
      "./workstation/frontend/OEW-main/src/setupTests.ts" 
    ],
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
