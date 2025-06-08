import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import * as path from "path";
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
            { find: "@orpheus-engine", replacement: path.resolve(__dirname, "..") },
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
                rewrite: function (path) { return path.replace(/^\/api/, ''); }
            }
        }
    },
    // Test configuration moved to vitest.config.ts
});
