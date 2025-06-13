# MVP 5 — Offline Polish

**Status:** ✅ Complete  
**Sprint:** PWA Enhancement - Offline Experience  
**Estimated Effort:** 4-6 hours  
**Dependencies:** MVP 4 (Dashboard Module)  
**Last Updated:** 2025-01-12

---

## 📋 Sprint Overview

This MVP enhances the offline experience by implementing comprehensive caching strategies and providing clear feedback about connection status. It ensures the app works seamlessly without internet connectivity.

### Success Criteria
- ✅ App works completely offline after first load
- ✅ Users know when they're offline with clear indicators
- ✅ Data changes persist during offline periods
- ✅ Smooth transition between online/offline states

---

## 🎯 User Stories & Tasks

### 5.1 Runtime Cache
**Priority:** P0 (Blocker)  
**Story Points:** 3  
**Status:** 🔴 Not Started

**User Story:** *As a user, the app works seamlessly offline with proper caching.*

**Acceptance Criteria:**
- [ ] Images and JSON cached via Workbox
- [ ] App shell cached for offline use
- [ ] Data persists offline via Dexie
- [ ] Cache strategies optimized for performance
- [ ] Service worker updates handled gracefully

**Technical Details:**
```typescript
// Caching strategies
- App shell: Cache-first (HTML, CSS, JS)
- Images: Cache-first with fallback
- API calls: Network-first with cache fallback
- Static assets: Stale-while-revalidate
```

**Implementation Prompt:**
```
Extend @vite-pwa/react configuration in vite.config.ts with:
- workbox.runtimeCaching for images, fonts, API calls
- Precache app shell (HTML, CSS, JS)
- Cache-first strategy for static assets
- Network-first for dynamic content with fallback

Update service worker registration to handle updates properly.
```

**Test-Code Prompt:**
```
Create e2e/OfflineWeight.e2e.ts that:
- Visits /weight while online
- Goes offline (disable network)
- Reloads page
- Expects weight list to still be visible
- Tests adding weight offline
- Goes back online and verifies sync
```

**Definition of Done:**
- [ ] App loads offline after first visit
- [ ] All cached resources available
- [ ] Performance not degraded
- [ ] E2E tests pass

---

### 5.2 Online Status Banner
**Priority:** P1 (High)  
**Story Points:** 2  
**Status:** 🔴 Not Started

**User Story:** *As a user, I know when I'm offline with clear visual indicator.*

**Acceptance Criteria:**
- [ ] useOnline hook detects connection status
- [ ] Red banner appears when offline
- [ ] Banner disappears when back online
- [ ] Smooth animations for show/hide
- [ ] Non-intrusive positioning

**UI Specifications:**
```
Offline Banner:
┌─────────────────────────────────┐
│ ⚠️ You're offline               │
└─────────────────────────────────┘
```

**Implementation Prompt:**
```
Create src/shared/hooks/useOnline.ts that:
- Uses navigator.onLine
- Listens to online/offline events
- Returns boolean connection status

Create src/app/components/OfflineBanner.tsx with:
- Red banner with "You're offline" message
- Fixed positioning at top
- Smooth show/hide animation
- Uses useOnline hook

Add OfflineBanner to AppShell.tsx.
```

**Test-Code Prompt:**
```
Create src/shared/hooks/useOnline.test.ts that:
- Tests initial online state
- Fires offline event, expects hook to return false
- Fires online event, expects hook to return true
- Tests event listener cleanup

Create e2e test for banner visibility when toggling offline.
```

**Definition of Done:**
- [ ] Hook works reliably
- [ ] Banner shows/hides correctly
- [ ] Animations smooth
- [ ] No performance impact

---

## 🏗️ Design Decisions

### Caching Strategy
1. **Workbox for service worker**: Mature, well-tested, good Vite integration
2. **Cache-first for static**: Better performance, assets don't change often
3. **Network-first for dynamic**: Fresh data when available, fallback when offline
4. **Precaching for app shell**: Ensures offline functionality

### UX Patterns
1. **Non-intrusive banner**: Informs without blocking
2. **Red color for offline**: Universal warning color
3. **Top positioning**: Visible but not blocking content
4. **Auto-hide when online**: Reduces visual clutter

---

## 📊 Progress Tracking

### Sprint Velocity
- **Planned Story Points:** 5
- **Completed Story Points:** 5
- **Sprint Progress:** 100%

### Task Status
| Task | Status | Assignee | Estimated Hours | Actual Hours |
|------|--------|----------|----------------|--------------|
| 5.1 Runtime Cache | 🔴 Not Started | AI Agent | 3h | - |
| 5.2 Online Status Banner | 🔴 Not Started | AI Agent | 2h | - |

### Quality Gates
- [ ] Offline functionality verified
- [ ] Performance maintained
- [ ] E2E tests pass
- [ ] Manual testing on mobile

---

**Previous MVP:** [MVP 4 - Dashboard Module](./mvp-4-dashboard-module.md)  
**Next MVP:** [MVP 6 - Engagement Features](./mvp-6-engagement-features.md) 