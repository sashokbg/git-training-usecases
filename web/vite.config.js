import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
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
