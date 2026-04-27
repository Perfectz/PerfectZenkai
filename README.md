# Perfect Zenkai

Perfect Zenkai is an offline-first Progressive Web App for personal health, tasks, notes, journaling, and AI-assisted coaching. It is built with Vite, React, TypeScript, Tailwind CSS, Zustand, Dexie, Supabase, and Azure Functions.

## Features

- Progressive Web App with install and offline support
- Local-first data storage with IndexedDB via Dexie
- Optional Supabase synchronization and user-specific data isolation
- Task, notes, journal, weight, workout, meal, dashboard, and AI chat modules
- Shared module registry for protected app routes and app capabilities
- Vitest, Testing Library, Playwright, ESLint, Prettier, and Lighthouse tooling

## Requirements

- Node.js 22 or newer
- npm 9 or newer

The root app and the Azure Functions API have separate package manifests. Install dependencies in each folder when working on both surfaces.

## Development

```bash
npm install
npm run dev
```

Useful commands:

```bash
npm run type-check
npm run lint
npm run build
npm run test
npm run e2e:smoke
npm run lighthouse
```

For mobile testing on the same network:

```bash
npm run dev -- --host
```

## API

Azure Functions live in `api/`.

```bash
cd api
npm install
npm start
```

The frontend can call local OpenAI directly in development when `VITE_OPENAI_API_KEY` is set. Production AI chat should go through the Azure Function endpoint so API keys stay server-side.

## Architecture

```text
src/
  app/                 App shell, routing, module registry
  components/          Top-level shared pages/components
  lib/                 External service clients
  modules/             Feature modules
  scripts/             Development-only browser utilities
  services/            Cross-cutting app services
  shared/              Shared UI, hooks, utilities, services
  styles/              Design tokens and global styles
  test/                Test setup and utilities
  types/               Global type declarations
```

Module rule: feature modules may import `shared/`, but should not directly import from other feature modules unless the app shell or module registry owns that integration.

## Security Notes

- Do not ship client-side secrets. `VITE_*` variables are visible in the browser bundle.
- Browser-console cleanup/reset helpers are loaded only in development.
- Run `npm audit` at the root and inside `api/` before deployment.
- Production builds disable source maps through the Vite config.

## Deployment

The app is configured for static deployment targets including Netlify, Vercel, and GitHub Pages. Build output is generated in `dist/`.

```bash
npm run build
npm run preview
```

## Documentation

- [Documentation index](docs/README.md)
- [Deployment guide](DEPLOYMENT.md)
- [Security policy](SECURITY.md)
- [Mobile testing](MOBILE_TESTING.md)
