import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    host: true, //ensures Vite listens to external IPs
    allowedHosts: ['fe819b7542bd.ngrok-free.app'], // allow ngrok URL
  },
})
