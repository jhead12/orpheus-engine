import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"
// Make sure to import the vitest config
import { configDefaults } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "./",
  build: {
    outDir: "build/src"
  },
  resolve: {
    alias: {
<<<<<<< HEAD
      "@": path.resolve(__dirname, "./src")
=======
      "@": path.resolve(__dirname, "./src"),
      "@orpheus": path.resolve(__dirname, "./src"),
      "@orpheus-engine": path.resolve(__dirname, "..")
>>>>>>> 378d52c (update)
    }
  },
  server: {
    port: 3000,
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
