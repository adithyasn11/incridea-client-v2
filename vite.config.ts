import type { PluginOption } from 'vite'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), (tailwindcss as unknown as () => PluginOption)()],
  server: {
    host: true,
    port: 3000,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL ||  'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
    preview:{
    allowedHosts: ["incridea.in"],
  }
})
