/// <reference types="vite-plugin-pwa/client" />
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initializeWeightStore } from './modules/weight'
import { initializeNotesStore } from './modules/notes'
import { BrowserRouter } from 'react-router-dom'

// Initialize stores after auth is ready
// Note: Tasks store will initialize itself after auth check completes
initializeWeightStore()
initializeNotesStore()
// initializeTasksStore() - Removed to prevent loading before auth is ready

// Register service worker in both development and production for PWA testing
/* Legacy manual service worker registration removed – vite-plugin-pwa now handles this automatically */

const basename = import.meta.env.BASE_URL

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter basename={basename}>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
