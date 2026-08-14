import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

const currentYear = new Date().getFullYear();

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [],
      manifest: {
        name: 'Gabriela Nail Studio',
        short_name: 'Gabriela',
        description: `Agenda digital ${currentYear} para Gabriela Nail Studio`,
        theme_color: '#F5F3FF',
        background_color: '#F5F3FF',
        display: 'standalone',
        orientation: 'portrait',
        icons: []
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      }
    })
  ]
});