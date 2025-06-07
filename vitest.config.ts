/// <reference types="vitest" />
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import * as path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@orpheus": path.resolve(__dirname, "./src"),
      "@orpheus/components": path.resolve(__dirname, "./src/components"),
      "@orpheus/services": path.resolve(__dirname, "./src/services"),
      "@orpheus/screens": path.resolve(__dirname, "./src/screens"),
      "@orpheus/contexts": path.resolve(__dirname, "./src/contexts"),
      "@orpheus/types": path.resolve(__dirname, "./src/services/types"),
      "@orpheus/test": path.resolve(__dirname, "./src/test"),
      "@orpheus/utils": path.resolve(__dirname, "./src/services/utils"),
      "@orpheus/widgets": path.resolve(__dirname, "./src/components/widgets"),
      "@orpheus/workstation": path.resolve(__dirname, "./src/screens/workstation")
    }
  },
  test: {
    environment: "jsdom",
    include: ["src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    globals: true,
    setupFiles: ["src/setupTests.ts"],
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
