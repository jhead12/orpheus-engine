import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"
// Make sure to import the vitest config
import { configDefaults } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'automatic',
    }),
  ],
  base: "./",
  build: {
    outDir: "build/src",
    sourcemap: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@orpheus": path.resolve(__dirname, "./src"),
      "@orpheus-engine": path.resolve(__dirname, "..")
    }
  },
  server: {
    port: 5174, // Changed from 5173 to avoid conflicts
    strictPort: false, // Allow fallback to another port if needed
    host: true
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    // other test options
    // You can use configDefaults here if needed, e.g.:
    // exclude: [...configDefaults.exclude, 'custom-exclude-pattern']
  }
})
