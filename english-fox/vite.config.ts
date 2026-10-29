import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Lokal: http://localhost:5173/  |  GitHub Pages Build: /english-fox/
export default defineConfig(({ command }) => ({
  base: command === 'serve' ? '/' : '/english-fox/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/*.png', 'icons/*.svg'],
      manifest: {
        name: 'English Fox GT',
        short_name: 'English Fox',
        description: 'Grammar Trainer – Englische Zeitformen mit dem Apple Pencil üben',
        lang: 'de',
        display: 'standalone',
        orientation: 'any',
        background_color: '#fff8ec',
        theme_color: '#ff7a1a',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: { globPatterns: ['**/*.{js,css,html,svg,png,woff2}'] },
    }),
  ],
  test: { include: ['shared/**/*.test.ts', 'src/**/*.test.ts'] },
}))
