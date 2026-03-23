/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setupTests.ts'],
    include: [
      '**/modules/weight/store.test.{ts,tsx}',
      '**/modules/tasks/store.test.{ts,tsx}',
      '**/shared/utils/dataExport.test.{ts,tsx}',
    ],
    exclude: ['**/node_modules/**', '**/e2e/**', '**/dist/**'],
    passWithNoTests: false,
    retry: 1,
    env: {
      VITE_SUPABASE_URL: 'https://test.supabase.co',
      VITE_SUPABASE_ANON_KEY: 'test_anon_key_1234567890abcdef',
      CI: 'true',
    },
    testTimeout: 8000,
    hookTimeout: 5000,
    coverage: {
      provider: 'v8',
      reporter: ['text-summary'],
      thresholds: {
        global: {
          branches: 55,
          functions: 55,
          lines: 55,
          statements: 55,
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
