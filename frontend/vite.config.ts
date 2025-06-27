import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api/football': {
        target: 'https://api.football-data.org/v4',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/football/, ''),
        headers: {
          'X-Auth-Token': '021e2a4d3c5d44e2a7451c637a951009'
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
