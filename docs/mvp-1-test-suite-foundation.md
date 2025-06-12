# MVP 1 — Test Suite Foundation

**Status:** 🔴 Not Started  
**Sprint:** Quality Infrastructure  
**Estimated Effort:** 6-8 hours  
**Dependencies:** MVP 0 (Environment & Skeleton)  
**Last Updated:** 2025-01-12

---

## 📋 Sprint Overview

This MVP establishes a comprehensive testing infrastructure that will support all future development. It includes unit testing, E2E testing, PWA quality gates, and CI/CD pipeline setup.

### Success Criteria
- ✅ Unit tests run with ≥80% coverage
- ✅ E2E tests run in mobile viewport automatically
- ✅ Lighthouse PWA score enforced in CI
- ✅ GitHub Actions pipeline fully functional

---

## 🎯 User Stories & Tasks

### 1.1 Vitest Harness
**Priority:** P0 (Blocker)  
**Story Points:** 3  
**Status:** 🔴 Not Started

**User Story:** *As a developer, I can unit-test hooks & components easily with proper providers.*

**Acceptance Criteria:**
- [ ] `src/test/setupTests.ts` registers RTL + jest-dom
- [ ] `renderWithProviders()` helper adds MemoryRouter + Zustand + Dexie providers
- [ ] Coverage gate ≥ 80%
- [ ] JSDOM environment configured
- [ ] Fast test execution (<5s for basic suite)

**Implementation Prompt:**
```
Create vitest.config.ts with:
- JSDOM environment
- Coverage threshold 80%
- setupFiles pointing to src/test/setupTests.ts

Create src/test/setupTests.ts importing @testing-library/jest-dom.

Implement renderWithProviders(children) wrapper that provides:
- MemoryRouter from react-router-dom
- Zustand store providers (when they exist)
- Any Dexie database providers
```

**Test-Code Prompt:**
```
Create src/test/Sample.test.tsx — render <button>Hi</button> with renderWithProviders and expect text "Hi" to be in document.
```

**Definition of Done:**
- [ ] All tests pass with coverage ≥80%
- [ ] renderWithProviders works with routing
- [ ] Test execution is fast and reliable

---

### 1.2 Playwright Harness
**Priority:** P0 (Blocker)  
**Story Points:** 3  
**Status:** 🔴 Not Started

**User Story:** *As a developer, I can run e2e tests in mobile viewport automatically.*

**Acceptance Criteria:**
- [ ] playwright.config.ts default viewport 375×667 & baseURL=http://localhost:5173
- [ ] `pnpm test:e2e` spins dev server automatically
- [ ] Mobile-first testing approach
- [ ] Screenshots on failure
- [ ] Parallel test execution

**Implementation Prompt:**
```
Add @playwright/test dependency. Create playwright.config.ts with:
- Mobile viewport 375×667
- baseURL http://localhost:5173
- webServer config to start Vite dev server automatically
- Projects for chromium mobile

Add npm script "test:e2e": "playwright test"
```

**Test-Code Prompt:**
```
Create e2e/sample.spec.ts — goto '/', expect Header text "Perfect Zenkai", take screenshot sample.png.
```

**Definition of Done:**
- [ ] E2E tests run reliably in mobile viewport
- [ ] Dev server starts/stops automatically
- [ ] Screenshots captured on failures

---

### 1.3 Lighthouse Gate
**Priority:** P1 (High)  
**Story Points:** 2  
**Status:** 🔴 Not Started

**User Story:** *As a product owner, build fails if PWA score dips below 90.*

**Acceptance Criteria:**
- [ ] `pnpm lighthouse` exits non-zero on < 90
- [ ] Tests against production build
- [ ] Detailed scoring breakdown
- [ ] Performance budget enforcement

**Implementation Prompt:**
```
Create scripts/lighthouse.mjs that:
1. Runs `vite build && vite preview` 
2. Uses @lhci/cli with preset=pwa
3. Asserts PWA score ≥ 90
4. Exits with error code if fails

Add npm script "lighthouse": "node scripts/lighthouse.mjs"
```

**Definition of Done:**
- [ ] Lighthouse runs against production build
- [ ] PWA score threshold enforced
- [ ] Clear failure messages

---

### 1.4 CI Pipeline
**Priority:** P0 (Blocker)  
**Story Points:** 2  
**Status:** 🔴 Not Started

**User Story:** *As a team, all PRs run lint, unit, e2e, lighthouse automatically.*

**Acceptance Criteria:**
- [ ] GitHub Action passes on push/PR
- [ ] Caches pnpm dependencies
- [ ] Runs all quality gates
- [ ] Fast feedback (<10 minutes)
- [ ] Clear failure reporting

**Implementation Prompt:**
```
Create .github/workflows/ci.yml with:
- ubuntu-latest
- Node.js 18
- pnpm cache
- Steps: install, lint, test (with coverage), test:e2e, lighthouse
- Fail fast on any step failure
```

**Definition of Done:**
- [ ] CI runs on every push/PR
- [ ] All quality gates enforced
- [ ] Build artifacts cached properly

---

## 🏗️ Design Decisions

### Testing Strategy
1. **Vitest over Jest**: Better Vite integration, faster execution, modern API
2. **Playwright over Cypress**: Better mobile testing, more reliable, faster
3. **RTL + jest-dom**: Industry standard for React component testing
4. **Coverage threshold 80%**: Balance between quality and development speed

### CI/CD Choices
1. **GitHub Actions**: Native integration, good performance, free for public repos
2. **pnpm caching**: Faster builds, consistent dependency resolution
3. **Fail-fast strategy**: Quick feedback, saves CI minutes
4. **Lighthouse CI**: Automated PWA quality enforcement

### Provider Pattern
1. **renderWithProviders**: Consistent test setup, reduces boilerplate
2. **Mock providers**: Isolated testing, predictable state
3. **Router integration**: Full navigation testing capability

---

## 📊 Progress Tracking

### Sprint Velocity
- **Planned Story Points:** 10
- **Completed Story Points:** 0
- **Sprint Progress:** 0%

### Task Status
| Task | Status | Assignee | Estimated Hours | Actual Hours |
|------|--------|----------|----------------|--------------|
| 1.1 Vitest Harness | 🔴 Not Started | AI Agent | 3h | - |
| 1.2 Playwright Harness | 🔴 Not Started | AI Agent | 2.5h | - |
| 1.3 Lighthouse Gate | 🔴 Not Started | AI Agent | 1.5h | - |
| 1.4 CI Pipeline | 🔴 Not Started | AI Agent | 1h | - |

### Blockers & Risks
- **Dependency on MVP 0**: Cannot start until basic project structure exists
- **CI setup complexity**: May need GitHub repository configuration

### Quality Gates
- [ ] All unit tests pass with ≥80% coverage
- [ ] E2E tests pass in mobile viewport
- [ ] Lighthouse PWA score ≥ 90
- [ ] CI pipeline runs successfully

---

## 🔄 Sprint Retrospective

### What Went Well
*To be filled after sprint completion*

### What Could Be Improved
*To be filled after sprint completion*

### Action Items
*To be filled after sprint completion*

---

## 📝 Notes & Comments

### Technical Debt
- Consider adding visual regression testing with Percy/Chromatic
- May need to optimize test execution time as suite grows

### Future Considerations
- Add performance testing with Lighthouse CI budgets
- Consider adding accessibility testing with axe-playwright
- Evaluate adding mutation testing for higher confidence

### Dependencies for Next MVP
- MVP 2 depends on working test harness for TDD approach
- All future MVPs will use this testing infrastructure

---

**Previous MVP:** [MVP 0 - Environment & Skeleton](./mvp-0-environment-skeleton.md)  
**Next MVP:** [MVP 2 - Weight Module v1](./mvp-2-weight-module-v1.md) 