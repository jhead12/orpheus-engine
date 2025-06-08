/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    name: 'Visual Regression Tests',
    environment: 'jsdom',
    setupFiles: ['./workstation/frontend/src/test/setup.ts', './workstation/frontend/src/test/visual-setup.ts'],
    include: [
      '**/__tests__/**/*.visual.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      '**/visual/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      '**/*.visual.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'
    ],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/cypress/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/build/**'
    ],
    globals: true,
    timeout: 60000,
    testTimeout: 60000,
    hookTimeout: 30000,
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true
      }
    },
    coverage: {
      enabled: false // Disable coverage for visual tests
    },
    ui: true,
    open: false,
    reporter: ['verbose', 'html'],
    outputFile: {
      html: './test-results/visual-report.html'
    }
  },
  resolve: {
    alias: {
      '@orpheus': path.resolve(__dirname, './src'),
      '@': path.resolve(__dirname, './src')
    }
  },
  define: {
    global: 'globalThis'
  }
})
