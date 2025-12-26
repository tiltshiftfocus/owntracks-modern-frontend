import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    server: {
      host: '0.0.0.0',
      port: 3000,
      proxy: {
        '/api': {
          target: env.VITE_PROXY_TARGET || 'http://localhost:8083',
          changeOrigin: true,
          rewrite: (path) => path, // Keep the /api path
        }
      }
    }
  }
})
