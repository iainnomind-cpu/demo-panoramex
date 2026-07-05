import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  // Vite 8 / Rolldown fails to resolve `tslib` hoisted inside @supabase ESM
  // packages because it isn't a top-level dependency in this project.
  // Marking it as external (never bundled) and pre-bundling via optimizeDeps
  // prevents the build crash without affecting runtime behaviour.
  build: {
    rolldownOptions: {
      external: ['tslib'],
    },
  },
  optimizeDeps: {
    exclude: ['tslib'],
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Panoramex CRM',
        short_name: 'Panoramex',
        theme_color: '#ffffff',
        icons: [
          {
            src: '/icon-192.svg',
            sizes: '192x192',
            type: 'image/svg+xml'
          },
          {
            src: '/icon-512.svg',
            sizes: '512x512',
            type: 'image/svg+xml'
          }
        ]
      }
    })
  ],
})

