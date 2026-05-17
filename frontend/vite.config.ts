import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const target = env.VITE_MULE_BASE || 'http://localhost:8094'
  return {
    plugins: [react()],
    build: {
      outDir: '../backend/rest-services/web-bff/src/main/resources/public',
      emptyOutDir: true,
    },
    server: {
      proxy: {
        '/api': { target, changeOrigin: true },
      },
    },
  }
})
