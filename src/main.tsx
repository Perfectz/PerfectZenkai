/// <reference types="vite-plugin-pwa/client" />
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initializeWeightStore } from './modules/weight'
import { initializeNotesStore } from './modules/notes'
import { BrowserRouter } from 'react-router-dom'
import { killRootServiceWorker } from './shared/utils/killRootServiceWorker'
import { getSupabaseClient } from './lib/supabase-client'

// Initialize Supabase client early
getSupabaseClient().catch(error => {
  console.warn('Supabase initialization failed, running in offline mode:', error)
})



// Register service worker in both development and production for PWA testing
/* Legacy manual service worker registration removed – vite-plugin-pwa now handles this automatically */

// Remove any legacy root-scoped service worker that could hijack the PWA scope
if (import.meta.env.PROD) {
  // Fire and forget – we don't block the render.
  killRootServiceWorker()
}

const basename = import.meta.env.BASE_URL

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter basename={basename}>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
