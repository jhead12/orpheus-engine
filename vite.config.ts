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
      "@orpheus-engine": path.resolve(__dirname, ".."),
      "@orpheus/components": path.resolve(__dirname, "./src/components"),
      "@orpheus/services": path.resolve(__dirname, "./src/services"),
      "@orpheus/screens": path.resolve(__dirname, "./src/screens"),
      "@orpheus/contexts": path.resolve(__dirname, "./src/contexts"),
      "@orpheus/types": path.resolve(__dirname, "./src/types"),
      "@orpheus/test": path.resolve(__dirname, "./src/test"),
      "@orpheus/utils": path.resolve(__dirname, "./src/services/utils"),
      "@orpheus/widgets": path.resolve(__dirname, "./src/components/widgets"),
      "@orpheus/workstation": path.resolve(__dirname, "./src/screens/workstation"),
      "@orpheus": path.resolve(__dirname, "./src")
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
  // Test configuration moved to vitest.config.ts
})
