import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        // THIS IS THE KEY: Remove '/api' from the start of the path
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    }
  }
})
