# Perfect Zenkai

A modern PWA for weight tracking and task management, built with React 18, TypeScript, and Tailwind CSS.

## Features

- 📱 **Progressive Web App** - Install on any device
- 🌙 **Dark Theme** - Easy on the eyes
- 📊 **Weight Tracking** - Log and visualize your progress
- ✅ **Task Management** - Stay organized with todos
- 🔄 **Offline First** - Works without internet connection
- 📈 **Dashboard** - Overview of your progress

## Tech Stack

- **Frontend:** Vite + React 18 + TypeScript
- **Styling:** Tailwind CSS 3 + shadcn/ui
- **State:** Zustand
- **Database:** Dexie (IndexedDB)
- **PWA:** @vite-pwa/react + Workbox
- **Testing:** Vitest + Playwright + Testing Library

## Prerequisites

- **Node.js 18+** - [Download from nodejs.org](https://nodejs.org/)
- **pnpm** (recommended) - `npm install -g pnpm`

## Development

```bash
# Install dependencies
npm install
# or with pnpm
pnpm install

# Start development server
npm run dev
# or with pnpm
pnpm dev

# Run tests
npm test
# or with pnpm
pnpm test

# Run e2e tests
npm run test:e2e
# or with pnpm
pnpm test:e2e

# Build for production
npm run build
# or with pnpm
pnpm build

# Preview production build
npm run preview
# or with pnpm
pnpm preview
```

## Mobile Testing

To test the PWA on your mobile device:

1. **Start dev server with LAN access:**
   ```bash
   pnpm dev -- --host
   ```

2. **Generate QR code for easy access:**
   ```bash
   npx qrencode -t terminal http://YOUR_IP:5173
   ```
   Replace `YOUR_IP` with your computer's local IP address shown in the terminal.

3. **Install on mobile:**
   - Open the URL in Chrome mobile
   - Tap the "Install app" option when prompted
   - The app will be added to your home screen

## Quality Gates

- ✅ **Test Coverage:** ≥80%
- ✅ **PWA Score:** ≥90 (Lighthouse)
- ✅ **TypeScript:** Strict mode, no `any` types
- ✅ **ESLint:** Zero warnings/errors
- ✅ **Mobile-First:** Optimized for 375×667 viewport

## Architecture

```
src/
├── app/           # App shell, navigation, global components
├── modules/       # Feature modules (weight, tasks, dashboard)
├── shared/        # Shared UI components, hooks, utilities
├── types/         # Global TypeScript definitions
└── test/          # Test utilities and setup
```

**Module Isolation Rule:** Modules may import `shared/` but never each other. The app shell imports only module routes.

## License

MIT 