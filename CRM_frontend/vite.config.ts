import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

import fs from 'node:fs'

const isDocker = fs.existsSync('/.dockerenv')
const backendTarget = process.env.VITE_BACKEND_URL || (isDocker ? 'http://nginx:80' : 'http://127.0.0.1:8000')

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    host: '0.0.0.0',
    port: 5174,
    watch: {
      usePolling: true,
      interval: 1000,
      ignored: ['**/node_modules/**', '**/.git/**'],
    },
    proxy: {
      '/api': {
        target: backendTarget,
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
