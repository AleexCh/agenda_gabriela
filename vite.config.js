import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // Left empty so it doesn't fail looking for public/ files
      includeAssets: [],
      manifest: {
        name: 'Gabriela Nail Studio',
        short_name: 'Gabriela',
        description: 'Agenda digital 2026 para Gabriela Nail Studio',
        theme_color: '#F5F3FF',
        background_color: '#F5F3FF',
        display: 'standalone',
        orientation: 'portrait',
        icons: [] // Relying on the index.html inline SVG icon
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      }
    })
  ]
});