import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "node:path";

export default defineConfig({
    plugins: [react()],
    root: "./src",
    resolve: {
    },
    build: {
        outDir: "../dist",
        emptyOutDir: true,
    },
    server: {
        proxy: {
            '/shell': {
                target: 'http://localhost:4200',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/shell/, ''),
            },
            '/ShellInABox.js': {
                target: 'http://localhost:4200',
                changeOrigin: true,
            },
        }
    }
})
