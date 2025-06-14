# Perfect Zenkai

A modern Progressive Web App (PWA) for weight tracking and task management, built with React 18, TypeScript, and Tailwind CSS. Features a clean, modern UI with offline-first capabilities and user-specific data isolation.

## 🌟 Features

- 📱 **Progressive Web App** - Install on any device, works offline
- 🔐 **Simple Authentication** - Username/password login with secure local storage
- 🌙 **Dark Theme** - Modern dark interface that's easy on the eyes
- 📊 **Weight Tracking** - Log daily weights and visualize progress with sparkline charts
- ✅ **Task Management** - Organize your day with a comprehensive todo system
- 📝 **Notes System** - Capture thoughts and ideas with rich text notes
- 🔄 **Offline First** - Full functionality without internet connection
- 📈 **Dashboard** - Comprehensive overview of your progress and daily stats
- 👤 **User Isolation** - Each user has their own secure, isolated data storage
- 🎯 **Streak Tracking** - Monitor consistency across different activities
- 📤 **Data Export** - Export your data for backup or analysis

## 🚀 Tech Stack

- **Frontend:** Vite + React 18 + TypeScript
- **Styling:** Tailwind CSS 3 + shadcn/ui components
- **State Management:** Zustand with persistence
- **Database:** Dexie (IndexedDB) with user-specific isolation
- **Authentication:** Local username/password with secure hashing
- **PWA:** @vite-pwa/react + Workbox for offline capabilities
- **Testing:** Vitest + Playwright + Testing Library
- **UI Components:** Lucide React icons + Custom component library

## 🏗️ Architecture

```
src/
├── app/                 # App shell, navigation, global components
├── modules/             # Feature modules
│   ├── auth/           # Authentication system
│   ├── weight/         # Weight tracking
│   ├── tasks/          # Task management
│   ├── notes/          # Notes system
│   └── dashboard/      # Dashboard and analytics
├── shared/             # Shared UI components, hooks, utilities
├── types/              # Global TypeScript definitions
└── test/               # Test utilities and setup
```

**Module Isolation Rule:** Modules may import `shared/` but never each other. The app shell imports only module routes.

## 🔧 Prerequisites

- **Node.js 18+** - [Download from nodejs.org](https://nodejs.org/)
- **npm** or **pnpm** (recommended) - `npm install -g pnpm`

## 💻 Development

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

# Run linting
npm run lint
# or with pnpm
pnpm lint

# Format code
npm run format
# or with pnpm
pnpm format
```

## 📱 Mobile Testing

To test the PWA on your mobile device:

1. **Start dev server with LAN access:**

   ```bash
   npm run dev -- --host
   # or with pnpm
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

## 🔐 Authentication

Perfect Zenkai uses a simple but secure local authentication system:

- **Registration:** Create account with username, email, and password
- **Login:** Username and password authentication
- **Security:** Passwords are hashed using secure algorithms
- **Data Isolation:** Each user gets their own isolated database
- **Session Management:** Secure session handling with automatic expiry

## 💾 Data Management

- **Local Storage:** All data stored locally using IndexedDB via Dexie
- **User Isolation:** Each user has separate database instances
- **Offline First:** Full functionality without internet connection
- **Data Export:** Built-in export functionality for data portability
- **Automatic Cleanup:** Session management with automatic cleanup

## 🎯 Quality Gates

- ✅ **Test Coverage:** ≥80%
- ✅ **PWA Score:** ≥90 (Lighthouse)
- ✅ **TypeScript:** Strict mode, no `any` types
- ✅ **ESLint:** Zero warnings/errors
- ✅ **Mobile-First:** Optimized for 375×667 viewport
- ✅ **Accessibility:** WCAG 2.1 AA compliance
- ✅ **Performance:** <3s load time, 60fps animations

## 🚀 Deployment

The app is configured for deployment on:

- **Netlify** - Primary deployment platform
- **Vercel** - Alternative deployment option
- **GitHub Pages** - Static hosting option

Build artifacts are generated in the `dist/` directory and include all PWA assets.

## 🔄 Recent Updates

- **Authentication System:** Migrated from Google OAuth to simple local authentication
- **UI Improvements:** Enhanced dashboard with uniform card layouts
- **Navigation Fixes:** Resolved React Router conflicts with protected routes
- **User Experience:** Improved registration flow with success feedback
- **Data Isolation:** Enhanced user-specific database separation

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📚 Documentation

**📋 [Complete Documentation Index](docs/README.md) - Start here for all rules, standards, and guides**

### Core Development Documentation
- [Development Rules & Standards](docs/ai-development-rules.md) - TDD workflow, quality gates
- [MVP Template & Standards](docs/mvp-template-standards.md) - Documentation templates
- [Project Rules](docs/project-rules.md) - Architecture and coding standards
- [Style Guide](docs/style-guide.md) - UI/UX design system
- [Technical Architecture](docs/solutiondesign.md) - Complete system design

### Additional Documentation
- [Authentication Guide](AUTHENTICATION.md)
- [MVP Sync Documentation](MVP_SUPABASE_SYNC.md)
- [Security Policy](SECURITY.md)
- [Image Generation Guide](IMAGE_GENERATION_PROMPTS.md)
