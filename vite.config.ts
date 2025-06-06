import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import * as path from "path"
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
    port: parseInt(process.env.VITE_PORT || '5174'),
    strictPort: false,
    host: process.env.VITE_HOST || true,
    proxy: {
      '/api': {
        target: process.env.API_URL || 'http://localhost:5001',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    exclude: [...configDefaults.exclude],
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}']
  }
})
