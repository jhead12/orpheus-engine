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
  root: "./workstation/frontend",
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
      { find: "@orpheus-engine", replacement: path.resolve(__dirname, "..") },
      { find: "@orpheus", replacement: path.resolve(__dirname, "./workstation/frontend/src") }
    ]
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
  // Test configuration moved to vitest.config.ts
})
