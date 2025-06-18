import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import mkcert from 'vite-plugin-mkcert'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/PerfectZenkai/' : '/',
  build: {
    // Security: Remove source maps in production
    sourcemap: process.env.NODE_ENV !== 'production',
    // Minify for security
    minify: 'terser',
    // Ensure clean build
    emptyOutDir: true,
    // Optimize chunk sizes and splitting
    rollupOptions: {
      output: {
        manualChunks: {
          // React and core UI libraries
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          
          // Date and utility libraries
          'date-utils': ['date-fns'],
          
          // Database and storage
          'storage': ['dexie', 'zustand'],
          
          // Authentication and cloud services
          'auth': ['@supabase/supabase-js', 'jwt-decode'],
          
          // Icons and UI utilities
          'ui-utils': ['lucide-react', 'clsx', 'tailwind-merge', 'class-variance-authority'],
          
          // Markdown and content
          'content': ['react-markdown', 'react-syntax-highlighter', 'remark-gfm', 'rehype-raw'],
          
          // Additional utilities
          'utils': ['uuid', 'react-swipeable'],
        },
      },
    },
    
    // Increase chunk size warning limit to 750KB
    chunkSizeWarningLimit: 750,
    
    // Optimize CSS
    cssCodeSplit: true,
    
    terserOptions: {
      compress: {
        drop_console: true, // Remove console logs in production
        drop_debugger: true,
      },
    },
  },
  esbuild: {
    // More permissive TypeScript handling for Node.js 22 compatibility
    target: 'es2022',
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  },
  plugins: [
    react(),
    mkcert(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'icons/perfect_zenkai_favicon.ico',
        'icons/perfect_zenkai_favicon.svg',
      ],
      workbox: {
        navigateFallback: null, // Disable navigate fallback for GitHub Pages
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
            },
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
          {
            urlPattern: /\.(?:js|css)$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'static-resources-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
              },
            },
          },
        ],
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        maximumFileSizeToCacheInBytes: 3000000, // 3MB
      },
      manifest: {
        name: 'Perfect Zenkai',
        short_name: 'Zenkai',
        description: 'Weight tracking and task management PWA',
        theme_color: '#111827',
        background_color: '#111827',
        display: 'standalone',
        orientation: 'portrait',
        scope: process.env.NODE_ENV === 'production' ? '/PerfectZenkai/' : '/',
        start_url: process.env.NODE_ENV === 'production' ? '/PerfectZenkai/' : '/',
        icons: [
          {
            src: 'icons/logo192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'icons/logo512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'icons/logo192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: 'icons/logo512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      devOptions: {
        enabled: true,
        type: 'module',
      },
      injectRegister: 'auto',
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0', // Broadcast to LAN
    port: parseInt(process.env.PORT || '5173'),
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
  },
  
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'zustand',
      'dexie',
      'lucide-react',
    ],
  },
})
