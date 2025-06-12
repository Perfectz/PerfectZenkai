# Perfect Zenkai — Project Rules & Standards

## Core Architecture Rules

### 🏗️ Module Isolation
- **STRICT RULE:** Modules may import `shared/` but **NEVER each other**
- **Shell Rule:** `src/app/` imports only module **routes**, never internal components
- **Import Hierarchy:** `app/ → modules/ → shared/ → types/`
- **Violation = Build Failure:** Use ESLint rules to enforce import boundaries

### 📁 Folder Structure (IMMUTABLE)
```
src/
├── app/           # AppShell, routes, NavigationBar, GlobalFab
├── modules/       # weight/, tasks/, dashboard/ (isolated domains)
├── shared/        # ui/, hooks/, lib/ (common utilities)
├── types/         # Global TypeScript definitions
└── test/          # Test utilities, setupTests.ts
```

### 🔄 Module Pattern (CONSISTENT)
Every module MUST follow this exact structure:
```
src/modules/{name}/
├── index.ts       # Public API exports only
├── types.ts       # Module-specific types
├── store.ts       # Zustand slice
├── repo.ts        # Dexie database layer
├── routes.ts      # React Router routes
├── pages/         # Route components
└── components/    # Internal components
```

## Technology Stack (LOCKED)

### 📦 Core Dependencies
- **Build:** Vite + React 18 + TypeScript
- **Styling:** Tailwind 3 + shadcn/ui + lucide-react
- **PWA:** @vite-pwa/react + Workbox
- **State:** Zustand (no Redux, no Context API for global state)
- **Database:** Dexie (IndexedDB wrapper)
- **Testing:** Vitest + Playwright + @testing-library/react

### 🚫 Forbidden Dependencies
- No jQuery, Lodash, or utility libraries (use native JS)
- No CSS-in-JS libraries (Tailwind only)
- No state management other than Zustand
- No UI libraries other than shadcn/ui
- No testing frameworks other than Vitest/Playwright

## Code Quality Standards

### ✅ Quality Gates (NON-NEGOTIABLE)
- **Test Coverage:** ≥80% (Vitest)
- **PWA Score:** ≥90 (Lighthouse)
- **TypeScript:** Strict mode, no `any` types
- **ESLint:** Zero warnings/errors
- **Prettier:** Auto-format on save

### 📝 Code Style
- **File Naming:** PascalCase for components, camelCase for utilities
- **Component Structure:** Props interface → Component → Export default
- **Import Order:** External → Internal → Relative (auto-sorted)
- **Comments:** JSDoc for public APIs, inline for complex logic only

### 🧪 Testing Requirements
- **Unit Tests:** All store actions, hooks, utilities
- **Component Tests:** User interactions, error states
- **E2E Tests:** Critical user journeys, offline scenarios
- **Mobile Testing:** All E2E tests use 375×667 viewport

## Development Workflow

### 🔄 MVP Development Process
1. **Read MVP Doc:** Understand user stories & acceptance criteria
2. **Copy Implementation Prompt:** Paste into AI tool exactly as written
3. **Generate Code:** Follow architecture rules strictly
4. **Copy Test-Code Prompt:** Generate matching tests
5. **Run Quality Gates:** All must pass before next MVP
6. **Update Status:** Mark MVP as complete in docs

### 📋 Definition of Done
- [ ] All acceptance criteria met
- [ ] Implementation matches prompt specifications
- [ ] Tests pass (unit + e2e + lighthouse)
- [ ] Code follows architecture rules
- [ ] Mobile testing completed
- [ ] Documentation updated

### 🚀 Deployment Checklist
- [ ] `pnpm lint` exits 0
- [ ] `pnpm test --coverage` ≥80%
- [ ] `pnpm test:e2e` passes
- [ ] `pnpm lighthouse` ≥90 PWA score
- [ ] Manual mobile testing completed
- [ ] All MVP status updated

## UI/UX Standards

### 📱 Mobile-First Design
- **Primary Viewport:** 375×667 (iPhone SE)
- **Touch Targets:** Minimum 44px × 44px
- **Gestures:** Long-press (200ms), swipe-to-delete
- **Navigation:** Bottom nav + FAB pattern

### 🎨 Design System
- **Theme:** Dark mode primary (#111827 background)
- **Components:** shadcn/ui only (no custom components unless necessary)
- **Icons:** lucide-react only
- **Spacing:** Tailwind spacing scale (4px increments)
- **Typography:** Default shadcn typography scale

### ⚡ Performance Rules
- **Bundle Size:** <500KB initial load
- **Lazy Loading:** Use React.lazy for heavy components (Recharts)
- **Images:** WebP format, proper sizing
- **Caching:** Workbox runtime caching for all assets

## Data Management

### 💾 Persistence Strategy
- **Local-First:** All data stored in Dexie (IndexedDB)
- **Offline-First:** App works without network
- **Data Types:** Strongly typed with TypeScript interfaces
- **Migrations:** Version Dexie schema changes

### 🔄 State Management
- **Global State:** Zustand stores only
- **Local State:** React useState/useReducer
- **Server State:** Not applicable (local-first app)
- **Hydration:** Load from Dexie on app init

## Security & Privacy

### 🔒 Data Protection
- **Local Only:** No data leaves device
- **No Analytics:** No tracking or telemetry
- **Permissions:** Request only when needed (notifications, install)
- **Storage:** Encrypted IndexedDB where possible

### 🛡️ Security Headers
- **CSP:** Content Security Policy in index.html
- **HTTPS:** Required for PWA features
- **Permissions Policy:** Restrict unnecessary APIs

## Error Handling

### 🚨 Error Boundaries
- **Global Boundary:** Catch all unhandled React errors
- **Module Boundaries:** Isolate module failures
- **Fallback UI:** Graceful degradation, not blank screens

### 📊 Error Logging
- **Console Only:** No external error reporting
- **User Feedback:** Clear error messages
- **Recovery:** Provide retry mechanisms

## Documentation Standards

### 📚 Required Documentation
- **MVP Status:** Always current in individual MVP docs
- **Architecture Decisions:** Document in relevant MVP docs
- **API Changes:** Update type definitions immediately
- **Breaking Changes:** Update all affected documentation

### 📝 Documentation Format
- **Markdown:** All docs in `/docs` folder
- **Status Emojis:** 🔴🟡🟢🔵⚪ for progress tracking
- **Cross-References:** Link related docs
- **Examples:** Include code examples for complex concepts

## Git Workflow

### 🌿 Branch Strategy
- **Main Branch:** Always deployable
- **Feature Branches:** One per MVP
- **Naming:** `mvp-{number}-{description}` (e.g., `mvp-2-weight-module`)

### 💬 Commit Standards
- **Format:** `{type}: {description}` (e.g., `feat: add weight tracking`)
- **Types:** feat, fix, docs, test, refactor, style
- **Scope:** Keep commits focused and atomic

### 🔍 Code Review
- **Self-Review:** Check against all rules before commit
- **AI Review:** Use AI tools to verify architecture compliance
- **Quality Gates:** All automated checks must pass

## Performance Monitoring

### 📊 Metrics to Track
- **Bundle Size:** Monitor with bundlephobia
- **Lighthouse Scores:** PWA, Performance, Accessibility
- **Test Coverage:** Maintain ≥80% always
- **Build Time:** Keep under 30 seconds

### 🎯 Performance Budgets
- **JavaScript:** <300KB gzipped
- **CSS:** <50KB gzipped
- **Images:** <100KB total
- **Fonts:** Use system fonts only

## Accessibility Standards

### ♿ WCAG Compliance
- **Level:** AA minimum
- **Keyboard Navigation:** All interactive elements
- **Screen Readers:** Proper ARIA labels
- **Color Contrast:** 4.5:1 minimum ratio

### 🎯 Focus Management
- **Focus Indicators:** Visible focus rings
- **Tab Order:** Logical navigation flow
- **Skip Links:** For main content areas

## Emergency Procedures

### 🚨 Build Failures
1. **Revert:** Roll back to last working commit
2. **Isolate:** Identify failing component/module
3. **Fix:** Address root cause, not symptoms
4. **Test:** Verify fix doesn't break other functionality

### 🔧 Hotfix Process
1. **Branch:** Create hotfix branch from main
2. **Fix:** Minimal change to address issue
3. **Test:** Run full test suite
4. **Deploy:** Merge directly to main after review

## Success Metrics

### 📈 Project Success
- **All MVPs Completed:** 7/7 MVPs delivered
- **Quality Gates:** 100% pass rate
- **Mobile Experience:** Smooth on target devices
- **PWA Installation:** Successful install flow

### 🎯 Technical Success
- **Zero Production Bugs:** No critical issues
- **Performance:** <3s load time on 3G
- **Accessibility:** WCAG AA compliance
- **Maintainability:** Easy to extend and modify

---

## Rule Enforcement

### 🤖 Automated Enforcement
- **ESLint Rules:** Import boundaries, code style
- **TypeScript:** Strict mode, no implicit any
- **Prettier:** Code formatting
- **Husky Hooks:** Pre-commit quality checks

### 👥 Human Enforcement
- **Code Reviews:** Architecture compliance
- **Documentation Reviews:** Keep docs current
- **Testing Reviews:** Adequate coverage and quality

### 📊 Compliance Tracking
- **Weekly Reviews:** Check rule adherence
- **Metrics Dashboard:** Track quality gates
- **Retrospectives:** Improve rules based on learnings

---

**Remember: These rules exist to ensure a high-quality, maintainable, and successful PWA. When in doubt, follow the rules. When rules conflict, prioritize user experience and code quality.** 