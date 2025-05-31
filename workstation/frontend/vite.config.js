import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: parseInt(process.env.PORT || '5174'),
    strictPort: false, // Allow fallback to another port if the specified one is in use
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
