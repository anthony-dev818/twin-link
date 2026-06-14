import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  // IMPORTANT: safe for Vercel SPA hosting
  base: '/',

  server: {
    port: 3001,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      }
    }
  },

  build: {
    outDir: 'dist',
    sourcemap: false, // IMPORTANT: disable for production (faster + safer)
  }
})