import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import * as path from "path"

// Browser-specific Vite configuration for pure web deployment
export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'automatic',
    }),
  ],
  base: "./",
  build: {
    outDir: "dist/browser",
    sourcemap: true,
    rollupOptions: {
      external: ['electron'],
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          mui: ['@mui/material', '@mui/icons-material'],
          router: ['react-router-dom']
        }
      }
    },
    // Optimize for browser deployment
    target: 'es2020',
    minify: 'esbuild',
    chunkSizeWarningLimit: 1000
  },
  resolve: {
    alias: [
      { find: "@", replacement: path.resolve(__dirname, "./src") },
      { find: "@orpheus/utils", replacement: path.resolve(__dirname, "./src/services/utils") },
      { find: "@orpheus/components", replacement: path.resolve(__dirname, "./src/components") },
      { find: "@orpheus/services", replacement: path.resolve(__dirname, "./src/services") },
      { find: "@orpheus/screens", replacement: path.resolve(__dirname, "./src/screens") },
      { find: "@orpheus/contexts", replacement: path.resolve(__dirname, "./src/contexts") },
      { find: "@orpheus/types", replacement: path.resolve(__dirname, "./src/types") },
      { find: "@orpheus/test", replacement: path.resolve(__dirname, "./src/test") },
      { find: "@orpheus/widgets", replacement: path.resolve(__dirname, "./src/components/widgets") },
      { find: "@orpheus/workstation", replacement: path.resolve(__dirname, "./src/screens/workstation") },
      { find: "@orpheus", replacement: path.resolve(__dirname, "./src") }
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
  define: {
    // Browser-specific feature flags
    'process.env.BROWSER_MODE': JSON.stringify(true),
    'process.env.ELECTRON_MODE': JSON.stringify(false),
    // Ensure Node.js globals are not used in browser
    'global': 'globalThis',
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
    exclude: ['electron']
  }
})
