import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Lokal: http://localhost:5173/  |  GitHub Pages Build: /closet/
export default defineConfig(({ command }) => ({
  base: command === 'serve' ? '/' : '/closet/',
  plugins: [react()],
}))
