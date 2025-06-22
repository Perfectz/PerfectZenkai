import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

// Special config for GitHub Pages deployment
// Completely removes AI Chat functionality for security
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,jpg,jpeg}']
      },
      includeAssets: ['icons/*.png'],
      manifest: {
        name: 'Perfect Zenkai - Demo',
        short_name: 'PerfectZenkai',
        description: 'Personal productivity PWA (GitHub Pages Demo)',
        theme_color: '#1a1a1a',
        background_color: '#1a1a1a',
        display: 'standalone',
        icons: [
          {
            src: '/icons/logo192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icons/logo512.png', 
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  define: {
    // Completely disable AI Chat for GitHub Pages
    'import.meta.env.VITE_AI_CHAT_ENABLED': 'false',
    'import.meta.env.VITE_OPENAI_API_KEY': 'undefined'
  },
  build: {
    rollupOptions: {
      external: [
        // Exclude AI-related modules from bundle
        /.*openai.*/,
        /.*langchain.*/
      ]
    }
  }
}) 