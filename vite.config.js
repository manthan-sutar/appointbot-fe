import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  base: '/',
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3000',
      '/chat': 'http://localhost:3000',
    },
  },
  build: {
    outDir: 'dist',
  },
})
