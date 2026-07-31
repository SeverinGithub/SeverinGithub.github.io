import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Lokal: http://localhost:5180/  |  GitHub Pages Build: /minitime/
export default defineConfig(({ command }) => ({
  base: command === 'serve' ? '/' : '/minitime/',
  plugins: [react()],
  server: { port: 5180 },
}))
