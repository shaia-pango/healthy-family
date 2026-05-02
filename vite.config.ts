import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/icon.svg'],
      workbox: {
        skipWaiting: true,                  // SW חדש משתלט מיד בלי להמתין
        clientsClaim: true,                 // לוקח שליטה על טאבים פתוחים
        cleanupOutdatedCaches: true,
      },
      manifest: {
        name: 'המשפחה הבריאה',
        short_name: 'בריאים',
        description: 'משחק תזונה משפחתי כייפי לבית אבירם',
        lang: 'he',
        dir: 'rtl',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#fef3e7',
        theme_color: '#f97316',
        start_url: '/',
        icons: [
          { src: '/icons/icon.svg', sizes: '192x192', type: 'image/svg+xml', purpose: 'any' },
          { src: '/icons/icon.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'any maskable' },
        ],
      },
    }),
  ],
});
