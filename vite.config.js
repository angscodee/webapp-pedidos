import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon-192.png'],
      manifest: {
        name: 'PedidosUCA - Uno con Aroma',
        short_name: 'PedidosUCA',
        description: 'Sistema de Gestión de Pedidos Centralizado - Uno con Aroma',
        theme_color: '#E2A123',
        background_color: '#FCFBF7',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,jpg,ico}'],
        skipWaiting: true,
        clientsClaim: true
      }
    })
  ],
})

