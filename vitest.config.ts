/// <reference types="vitest" />
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    include: ["src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    globals: true,
    setupFiles: ["src/setupTests.ts"],
    reporters: ["verbose"],
    coverage: {
      reporter: ["text", "json", "html"],
      reportsDirectory: "./test-results/coverage",
    },
    outputFile: {
      html: "./test-results/html/index.html",
    },
    deps: {
      inline: ["jest-image-snapshot"],
    },
    snapshotDir: "__snapshots__",
  },
});
