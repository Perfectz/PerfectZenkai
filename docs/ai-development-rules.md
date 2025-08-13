# Perfect Zenkai Development Rules - Updated

## Philosophy

This project follows **Test-Driven Development (TDD)** with **Vertical Slice Architecture** and **comprehensive MVP documentation** for all complex tasks.

## 🎯 **CURRENT STATUS: Phase 1 Completion & Phase 2 Preparation**

### **Phase 1 MVPs (Completion Target: Today)**
- **Location**: `docs/mvp/Phase 1 MVPS/`
- **Status**: Final cleanup and completion in progress
- **Goal**: Complete all foundational features and technical debt resolution

### **Phase 2 MVPs (Enhancement Focus)**
- **Location**: `docs/mvp/Phase 2 MVPs/`
- **Status**: Ready for advanced enhancement features
- **Goal**: Advanced AI capabilities, performance optimization, and user experience enhancements

## 🎨 **MAJOR UPDATE: Enhanced Landing Page**

### **New Landing Page Features (Completed)**
- **Attractive Design**: Gradient backgrounds, dramatic shadows, and professional styling
- **Login-First Approach**: Prominent authentication with integrated information
- **Expandable Information Sections**: 
  - 🚀 Key Features (AI Assistant, Weight Management, Food Analysis, etc.)
  - 🏗️ Technical Architecture (React 18, TypeScript, Supabase, Azure)
  - 🏆 Technical Achievements (96.6% error reduction, enterprise-grade code)
  - 🚀 Getting Started (User and developer onboarding)
  - 🤝 Contributing (Development standards and guidelines)
- **Platform Statistics**: 20+ features, 96.6% code quality, 100% offline ready
- **Mobile-Responsive**: Optimized for all screen sizes
- **Visual Effects**: 
  - White gradient text with sharp drop shadows
  - Glowing "Zenkai" with ki-green gradient
  - Professional depth with layered shadow effects

### **Title Styling (Latest)**
```typescript
// Enhanced title with dramatic effects and readability
<h1 style={{
  textShadow: '0 4px 8px rgba(0, 0, 0, 0.3), 0 2px 4px rgba(0, 0, 0, 0.2)',
  background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #ffffff 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent'
}}>
  Perfect <span className="text-ki-green" style={{
    textShadow: '0 0 20px rgba(34, 255, 183, 0.6), 0 4px 8px rgba(0, 0, 0, 0.3)',
    background: 'linear-gradient(135deg, #22ffb7 0%, #1be7ff 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  }}>Zenkai</span>
</h1>
```

## Key Enhancement: Automatic MVP Documentation

**When you request a complex task, I will:**
1. **Create MVP document first** using phase-appropriate templates
2. **Define success criteria** and break into vertical slices
3. **Plan TDD approach** with comprehensive test strategy
4. **Get your confirmation** before starting implementation
5. **Update documentation** in real-time during development
6. **Complete retrospective** with actual metrics and learnings

### New Rule: Mandatory Test Section in Every New MVP
- Every newly created MVP document MUST include a "Test Cases" section with:
  - Unit, component, integration, and E2E cases enumerated
  - Example test skeletons where helpful
  - Exact commands to run the tests locally (unit and E2E)
- The MVP is NOT considered complete until tests are implemented and passing.

## Rule Categories

### Always Apply
- `mvp-documentation.mdc` - MVP docs for complex tasks (>2 hours)
- `tdd-workflow.mdc` - Mandatory RED → GREEN → REFACTOR cycle
- `architecture-standards.mdc` - Vertical slice architecture

### Auto-Attach (by file pattern)
- `react-component-standards.mdc` - React patterns (src/**/*.tsx)
- `tasks-module.mdc` - Tasks module patterns (src/modules/tasks/**/*) 
- `test-files.mdc` - Testing standards (**/*.{test,spec}.{ts,tsx})

### Agent-Requested (semantic)
- `quality-gates.mdc` - Performance and coverage standards

### Manual (Applied when explicitly mentioned)
- `documentation-standards.mdc` - General documentation guidelines

## Core Principles

1. **Phase-Based Development**: Phase 1 (Foundation) → Phase 2 (Enhancement)
2. **MVP-First Approach**: All complex tasks (>2 hours estimated) require MVP documentation
3. **TDD Mandatory**: Every feature follows RED → GREEN → REFACTOR cycle
4. **Vertical Slices**: Complete user value delivery (UI + Logic + Data + Tests)
5. **Quality Gates**: ≥90% test coverage, ≥90 Lighthouse PWA score
6. **Real-time Documentation**: MVP docs updated with actual progress and metrics
7. **Enhanced UX**: Professional landing page with integrated information architecture

## Success Metrics

- Test Coverage: ≥90% for new features, 100% for critical workflows
- Performance: <2s load times, ≥90 Lighthouse scores
- Documentation: Real-time updates with embedded test results
- TDD Compliance: Mandatory cycle completion for all features
- Code Quality: Maintain 96.6%+ error reduction achievement
- User Experience: Professional, accessible, mobile-optimized interfaces

## 🚀 **Phase 1 Completion Checklist**

### **Critical Items for Today**
- [ ] Complete all MVP implementations in Phase 1 folder
- [ ] Resolve any remaining technical debt
- [ ] Ensure 90%+ test coverage across all modules
- [ ] Verify enhanced landing page functionality
- [ ] Update all documentation with current status
- [ ] Prepare Phase 2 enhancement roadmap

### **Phase 2 Preparation**
- [ ] Advanced AI capabilities planning
- [ ] Performance optimization strategies
- [ ] Enhanced user experience features
- [ ] Advanced analytics and insights
- [ ] Enterprise-grade security enhancements

# AI Development Rules for Perfect Zenkai

**Purpose:** Maintain consistency, traceability, and quality across all development activities  
**Scope:** All AI agents working on Perfect Zenkai project  
**Last Updated:** 2025-01-12  
**Enhanced With:** TDD, Vertical Slice Architecture, and Vibe Coding Standards

---

## 🎯 Core Principles

### 1. Test-Driven Development (TDD) Mandatory

**RED → GREEN → REFACTOR:** Every feature MUST follow TDD cycle.

**TDD Workflow for Every Task:**

1. **RED Phase:** Write failing tests first (unit, integration, e2e)
2. **GREEN Phase:** Write minimal code to make tests pass
3. **REFACTOR Phase:** Clean up code while keeping tests green
4. **VERIFY Phase:** Run full test suite and update documentation

**Required Test Coverage:**
- Unit Tests: ≥90% coverage for new features
- Integration Tests: All store interactions and data flows
- E2E Tests: Complete user journeys on mobile viewport (375×667)
- Component Tests: All user interactions and error states

### 2. Vertical Slice Architecture

**COMPLETE FEATURES:** Each task delivers end-to-end user value.

**Vertical Slice Components:**
```
Feature Slice = UI Component + Store Logic + Repository + Types + Tests + E2E
├── UI Layer: React component with user interactions
├── Business Logic: Zustand store with actions
├── Data Layer: Dexie repository with CRUD operations
├── Type Safety: TypeScript interfaces and types
├── Unit Tests: Store, repository, and utility functions
├── Component Tests: User interactions and error states
└── E2E Tests: Complete user workflow on mobile
```

**Slice Completion Criteria:**
- [ ] User can complete entire workflow without errors
- [ ] All tests pass (unit, integration, component, e2e)
- [ ] Feature works offline and online
- [ ] Mobile UX is smooth and responsive
- [ ] Performance benchmarks met
- [ ] Documentation updated

### 3. Document Synchronization

**CRITICAL:** Every change must be reflected across all relevant documents to maintain consistency.

**Required Updates for ANY Change:**

1. **Primary MVP Document** (`docs/mvp-X-*.md`) - Update task status, progress, notes
2. **MVP Master List** (`docs/mvpmasterlist.md`) - Update corresponding section
3. **Solution Design** (`docs/solutiondesign.md`) - Update if architecture/tech decisions change
4. **This Rules File** - Update if new patterns/rules emerge

### 4. Status Tracking Protocol

**MANDATORY:** Update status in ALL documents when task status changes.

**Status Indicators:**

- 🔴 **Not Started** - No work begun, tests not written
- 🟡 **In Progress** - TDD cycle active, some tests passing
- 🟢 **Completed** - All tests pass, feature fully functional
- 🔵 **Blocked** - Cannot proceed due to dependencies/issues
- ⚪ **On Hold** - Paused for strategic reasons

---

## 🧪 TDD Implementation Rules

### Test-First Development Process

**MANDATORY SEQUENCE:** for every feature implementation:

1. **Write User Story Tests (E2E):**
   ```typescript
   // e2e/FeatureName.e2e.ts
   test('user can complete primary workflow', async ({ page }) => {
     // Test complete user journey
   })
   ```

2. **Write Integration Tests:**
   ```typescript
   // src/modules/feature/__tests__/integration.test.ts
   test('store and repository work together', () => {
     // Test data flow from UI to storage
   })
   ```

3. **Write Unit Tests:**
   ```typescript
   // src/modules/feature/__tests__/store.test.ts
   // src/modules/feature/__tests__/repo.test.ts
   test('individual functions work correctly', () => {
     // Test isolated functionality
   })
   ```

4. **Run Tests (Should FAIL):**
   ```bash
   npm run test        # Unit/integration tests
   npm run test:e2e    # End-to-end tests
   ```

5. **Implement Feature (Minimal Code):**
   - Write just enough code to make tests pass
   - Follow existing architecture patterns
   - Maintain module isolation

6. **Run Tests (Should PASS):**
   ```bash
   npm run test:coverage  # Verify coverage thresholds
   npm run lighthouse     # Performance verification
   ```

7. **Refactor and Clean:**
   - Improve code quality while keeping tests green
   - Add error handling and edge cases
   - Update documentation

### Test Organization Standards

**File Structure:**
```
src/modules/feature/
├── __tests__/
│   ├── store.test.ts         # Unit tests for Zustand store
│   ├── repo.test.ts          # Unit tests for Dexie repository
│   ├── integration.test.ts   # Store + Repo integration
│   └── components/
│       └── FeaturePage.test.tsx  # Component behavior tests
└── components/
    └── __tests__/
        └── ComponentName.test.tsx

e2e/
└── FeatureName.e2e.ts       # End-to-end user workflows
```

**Test Naming Convention:**
- Unit tests: `functionName.test.ts`
- Component tests: `ComponentName.test.tsx`
- Integration tests: `featureName-integration.test.ts`
- E2E tests: `FeatureName.e2e.ts`

---

## 📋 Document Update Rules

### When Starting a Task (TDD RED Phase)

**MUST UPDATE:**

1. Change status from 🔴 to 🟡 in MVP document
2. Update "Last Updated" date
3. Add start time to progress tracking table
4. Create test files with failing tests
5. Document test approach in "Technical Details"
6. Update master list with same status

### During Implementation (TDD GREEN Phase)

**CONTINUOUS UPDATES:**

1. Keep tests passing as code is added
2. Update progress notes with TDD cycle status
3. Document any architectural decisions made
4. Note blockers or challenges encountered
5. Update time estimates if needed

### When Completing a Task (TDD REFACTOR Phase)

**MUST UPDATE:**

1. Change status from 🟡 to 🟢 in MVP document
2. Check off all acceptance criteria checkboxes
3. Add actual hours to progress tracking table
4. Update sprint progress percentage
5. **Run and document all test results:**
   ```bash
   npm run test:coverage  # Document coverage percentage
   npm run test:e2e      # Document E2E results
   npm run lighthouse    # Document performance scores
   ```
6. Fill in retrospective notes if task completes sprint
7. Update master list with completion
8. Update solution design if architecture changed

### When Encountering Issues

**MUST UPDATE:**

1. Change status to 🔵 if blocked
2. Document blocker in "Blockers & Risks" section
3. Include failing test outputs and error messages
4. Add detailed notes in "Notes & Comments"
5. Estimate impact on timeline
6. Propose mitigation strategies with test considerations

---

## 🏗️ Architecture Consistency Rules

### Module Isolation with Testing

**ENFORCE:** Modules may import `shared` but NEVER each other.

**Before Adding Any Import:**

1. Check if it violates module isolation
2. Write integration tests to verify module boundaries
3. If cross-module import needed, refactor to use `shared`
4. Update solution design if new shared utilities added
5. Document decision in relevant MVP file

### Vertical Slice Completeness

**REQUIRED:** Each slice must include all layers:

**UI Layer Testing:**
```typescript
// Test user interactions, form validation, error states
test('user can submit form with valid data', async () => {
  // Component behavior testing
})
```

**Business Logic Testing:**
```typescript
// Test Zustand store actions and state management
test('store updates correctly when action is dispatched', () => {
  // Store logic testing
})
```

**Data Layer Testing:**
```typescript
// Test Dexie repository CRUD operations
test('repository saves and retrieves data correctly', async () => {
  // Database interaction testing
})
```

**Integration Testing:**
```typescript
// Test complete data flow from UI to storage
test('user action results in correct data persistence', async () => {
  // End-to-end integration testing
})
```

### Technology Stack Adherence

**REQUIRED:** All implementations must use approved tech stack.

**Approved Stack (from solution design):**

- **Build:** Vite + React 18 + TypeScript
- **Styling:** Tailwind 3 + shadcn/ui + lucide-react
- **State:** Zustand (slice per module)
- **Persistence:** Dexie (IndexedDB)
- **Testing:** Vitest + Playwright + Lighthouse CI
- **PWA:** @vite-pwa/react + Workbox

**If New Technology Needed:**

1. Write tests demonstrating need for new technology
2. Document justification in MVP file
3. Update solution design tech stack section
4. Update master list if it affects prompts
5. Get approval before implementation

---

## 🧪 Quality Gate Rules

### Testing Requirements

**MANDATORY:** All code must meet testing standards before completion.

**Unit Tests:**
- ≥90% coverage for new modules
- ≥80% coverage for modifications
- All store actions tested with mock data
- All components tested with renderWithProviders
- All repository functions tested with mock Dexie

**Integration Tests:**
- Store + Repository interactions tested
- Component + Store integration verified
- Error handling paths covered
- Offline/online state transitions tested

**E2E Tests:**
- Mobile viewport (375×667) exclusively
- Complete user workflows tested
- Offline scenarios where applicable
- Happy path and error cases covered
- Cross-browser compatibility verified

**Performance Tests:**
- Lighthouse PWA score ≥90
- Bundle size impact documented
- Mobile performance verified
- Loading time benchmarks met

### Code Quality with TDD

**REQUIRED:** All code must meet quality standards through TDD process.

**TDD Quality Standards:**
- Tests written before implementation
- All tests pass before task completion
- TypeScript strict mode compliance
- ESLint + Prettier compliance
- No console.log in production
- Proper error handling with tests
- Accessibility compliance (WCAG 2.1 AA) with tests

### Continuous Test Execution

**WORKFLOW:** Tests must be run at each phase:

1. **Before Implementation:** Tests should fail (RED)
2. **During Implementation:** Tests gradually pass (GREEN)
3. **After Implementation:** All tests pass, coverage met (REFACTOR)
4. **Before Commit:** Full test suite passes

**Commands to Run:**
```bash
# Development workflow
npm run test:watch        # Continuous unit testing
npm run test:coverage     # Coverage verification
npm run test:e2e          # End-to-end validation
npm run lighthouse        # Performance benchmarks

# Pre-commit verification
npm run lint              # Code quality
npm run build             # Build verification
npm run test:ci           # Full test suite
```

---

## 📊 Progress Tracking Rules

### Sprint Velocity Calculation

**FORMULA:** `(Completed Story Points / Planned Story Points) × 100`

**Update Frequency:** After each task completion

**TDD Tracking Elements:**
- Story points (planning poker estimation)
- Actual hours vs estimated hours (include TDD time)
- Test coverage percentage achieved
- Number of tests written vs planned
- TDD cycle completion rate
- Velocity trends across sprints
- Blocker impact on timeline

### Test Metrics Tracking

**MANDATORY:** Track testing metrics for each MVP:

**Coverage Metrics:**
- Unit test coverage percentage
- Integration test coverage
- E2E test scenario coverage
- Component test coverage

**Quality Metrics:**
- Test execution time
- Test failure rate
- Bug detection rate through tests
- Performance benchmark results

**TDD Metrics:**
- Time spent in RED phase
- Time spent in GREEN phase
- Time spent in REFACTOR phase
- Number of TDD cycles per feature

### Retrospective Requirements

**MANDATORY:** Fill retrospectives after sprint completion.

**Required Sections:**

- What Went Well (minimum 2 items, include TDD successes)
- What Could Be Improved (minimum 2 items, include TDD challenges)
- Action Items (specific, measurable, test-focused)
- Velocity analysis (including TDD impact)
- Technical debt assessment
- Test quality analysis

---

## 🔄 Change Management Protocol

### Design Decision Changes

**PROCESS:** When changing any design decision:

1. **Write tests** for new design first
2. **Document in MVP file** under "Design Decisions"
3. **Update solution design** if architectural
4. **Update master list** if affects prompts
5. **Note rationale** for the change
6. **Assess impact** on other MVPs and their tests
7. **Update dependencies** if needed
8. **Verify all tests still pass**

### Scope Changes

**PROCESS:** When adding/removing features:

1. **Update test requirements** in MVP file
2. **Update acceptance criteria** in MVP file
3. **Recalculate story points** and effort estimates (include TDD time)
4. **Update master list** with new prompts
5. **Document scope change** in notes section
6. **Assess timeline impact** on dependent MVPs
7. **Update test plans** for affected features

---

## 🚨 Error Handling Rules

### When Tests Fail

**IMMEDIATE ACTIONS:**

1. Change status to 🔵 Blocked
2. Document test failure details in MVP file
3. Include full error output and stack traces
4. Analyze root cause (code issue vs test issue)
5. Estimate fix effort and impact on TDD cycle
6. Update timeline if significant

### When Implementation Differs from Tests

**REQUIRED ACTIONS:**

1. Determine if tests or implementation is incorrect
2. Update either tests or implementation to align
3. Document actual implementation in MVP file
4. Update solution design if architectural
5. Update master list prompts if needed
6. Justify deviation in design decisions
7. Assess impact on future MVPs
8. Re-run full test suite

---

## 📝 Enhanced Documentation Standards

### MVP Document Structure (Enhanced)

**REQUIRED SECTIONS:** (in order)

1. **Header** with status, dependencies, dates, TDD progress
2. **Sprint Overview** with success criteria and test requirements
3. **User Stories & Tasks** with detailed specs and test plans
4. **TDD Implementation Plan** with test-first approach
5. **Test Results & Coverage** with metrics and reports
6. **Design Decisions** with rationale and test implications
7. **Progress Tracking** with metrics including TDD phases
8. **Retrospective** (after completion) with TDD analysis
9. **Notes & Comments** for additional context

### File Naming Convention

- MVP files: `mvp-X-descriptive-name.md`
- Use lowercase, hyphens for spaces
- Include MVP number for ordering
- Test files follow module structure

### Content Structure with TDD

**User Stories Enhanced Format:**
```markdown
**User Story:** As a [user], I want [goal] so that [benefit]

**Acceptance Criteria:**
- [ ] Functional requirement 1
- [ ] Functional requirement 2
- [ ] All tests pass (≥90% coverage)
- [ ] E2E workflow completes successfully
- [ ] Performance benchmarks met

**Test Plan:**
- Unit Tests: [specific test descriptions]
- Integration Tests: [workflow tests]
- E2E Tests: [user journey tests]
- Performance Tests: [benchmark tests]

**TDD Approach:**
1. Write failing tests for [specific functionality]
2. Implement minimal [component/feature]
3. Refactor for [quality aspects]
```

### Writing Style

- **User stories:** "As a [user], I want [goal] so that [benefit]"
- **Acceptance criteria:** Testable, specific, measurable
- **Technical details:** Code examples, interfaces, specifications
- **Test descriptions:** Clear, specific, verifiable
- **Status updates:** Clear, concise, actionable
- **Test cases:** Include explicit run instructions (npm scripts) in the MVP

---

## 🔗 Cross-Reference Rules

### Linking Between Documents

**REQUIRED:** Maintain navigation links between related documents.

**Link Format:**

- Previous/Next MVP: `[MVP X - Name](./mvp-x-name.md)`
- Master list reference: `[MVP Master List](./mvpmasterlist.md)`
- Solution design: `[Solution Design](./solutiondesign.md)`
- Test reports: `[Test Report](./test-reports/mvp-x-report.md)`

### Dependency Tracking with Tests

**MAINTAIN:** Clear dependency chains between MVPs and their tests.

**Document Dependencies:**

- Technical dependencies (code/architecture)
- Data dependencies (requires data from other modules)
- Testing dependencies (requires test infrastructure)
- UX dependencies (requires UI components)
- Test dependencies (shared test utilities, mocks)

---

## 🎯 Success Metrics

### Project Health Indicators

**TRACK:** Key metrics for project success including TDD effectiveness.

**Velocity Metrics:**
- Story points completed per sprint
- Actual vs estimated hours (including TDD time)
- TDD cycle completion rate
- Blocker frequency and resolution time
- Test pass rate and coverage trends

**Quality Metrics:**
- Code coverage percentage (≥90% target)
- Test execution time and reliability
- Lighthouse scores (≥90 PWA target)
- Bug count and severity
- Technical debt accumulation
- TDD cycle time analysis

### Completion Criteria

**DEFINITION OF DONE:** For tasks and project.

**Task Completion:**
- All acceptance criteria met
- All tests written and passing
- TDD cycle completed (RED → GREEN → REFACTOR)
- Code coverage thresholds met
- E2E tests pass on mobile
- Performance benchmarks met
- Documentation updated

**MVP Completion:**
- All tasks completed with TDD
- Integration tests pass
- E2E user workflows complete
- Performance verified
- Manual testing completed
- Sprint retrospective completed

**Project Completion:**
- All MVPs completed with TDD
- Full test suite passes
- Performance benchmarks met
- Documentation complete
- Ready for production deployment

---

## 🚀 Deployment Rules

### Pre-Deployment Checklist

**MANDATORY:** Before any deployment.

**Quality Gates:**
- [ ] All tests passing (unit, integration, component, e2e)
- [ ] Code coverage ≥90%
- [ ] No linting errors
- [ ] Performance benchmarks met (Lighthouse ≥90)
- [ ] Security audit passed
- [ ] TDD cycles completed for all features
- [ ] Documentation updated
- [ ] Manual testing on mobile device

**Deployment Process:**

1. **Run full test suite:**
   ```bash
   npm run test:ci          # All automated tests
   npm run test:coverage    # Coverage verification
   npm run test:e2e         # End-to-end tests
   npm run lighthouse       # Performance tests
   ```

2. **Build and verify:**
   ```bash
   npm run build           # Production build
   npm run preview         # Test production build
   ```

3. **Mobile testing:**
   - Test on actual mobile device
   - Verify offline functionality
   - Test PWA installation

4. **Deploy and monitor:**
   - Deploy to staging
   - Run smoke tests
   - Deploy to production
   - Monitor for issues

---

## 📞 Escalation Protocol

### When to Escalate

**ESCALATE IMMEDIATELY:** If any of these occur:

1. **TDD cycle broken** for >2 hours without resolution
2. **Test coverage drops** below 80% threshold
3. **Blocker lasting >4 hours** without resolution path
4. **Architecture decision** affecting multiple MVPs
5. **Scope change** requiring >20% effort increase
6. **Quality gate failure** that can't be quickly resolved
7. **Security vulnerability** discovered
8. **Performance degradation** below acceptable thresholds

### Escalation Process

1. **Document issue** in relevant MVP file with test evidence
2. **Assess impact** on timeline and other MVPs
3. **Propose solutions** with effort estimates and test plans
4. **Update all affected documents**
5. **Communicate status** to stakeholders

---

## 🔄 Continuous Improvement

### Rule Updates

**PROCESS:** When these rules need updating:

1. **Document reason** for rule change with evidence
2. **Update this file** with new/modified rules
3. **Update test strategies** if testing rules change
4. **Notify all AI agents** of rule changes
5. **Update MVP files** if rules affect them
6. **Version control** rule changes

### Learning Integration

**CAPTURE:** Lessons learned during TDD development:

1. **Document in retrospectives** what TDD patterns worked/didn't work
2. **Update rules** if TDD patterns emerge
3. **Share knowledge** across MVP teams
4. **Improve TDD processes** based on experience
5. **Update test utilities** and shared testing code

---

## ✅ Compliance Checklist

**Before ANY commit, verify:**

- [ ] TDD cycle completed (RED → GREEN → REFACTOR)
- [ ] All tests pass (unit, integration, component, e2e)
- [ ] Code coverage ≥90% for new code
- [ ] All affected documents updated
- [ ] Status indicators consistent across files
- [ ] Progress tracking updated with test metrics
- [ ] Quality gates met
- [ ] Dependencies verified
- [ ] Links working
- [ ] No rule violations
- [ ] Performance benchmarks met

**Remember:** TDD and Vertical Slice Architecture are not optional - they are the foundation of quality delivery. When in doubt, write more tests rather than fewer, and update more documents rather than fewer.

---

## 🎯 Vibe Coding Best Practices

### Developer Experience Focus

**PRIORITIZE:** Developer productivity and code maintainability.

**Vibe Coding Principles:**
- **Intuitive Architecture:** Code structure should be self-explanatory
- **Rapid Feedback:** Fast test execution and clear error messages
- **Minimal Friction:** Smooth development workflow with good tooling
- **Quality by Default:** Standards that prevent common mistakes
- **Progressive Enhancement:** Features that build on each other naturally

### Code Aesthetics with Function

**BALANCE:** Beautiful code that also performs well.

**Aesthetic Principles:**
- **Consistent Formatting:** Prettier + ESLint for uniform style
- **Meaningful Names:** Self-documenting code with clear naming
- **Logical Organization:** Files and functions grouped intuitively
- **Clean Abstractions:** Simple interfaces hiding complexity
- **Visual Hierarchy:** Code structure that's easy to scan

### Documentation as Code

**TREAT:** Documentation as a first-class deliverable.

**Documentation Standards:**
- **Living Documentation:** Updated with every change
- **Example-Driven:** Show don't just tell
- **User-Focused:** Written for the next developer
- **Visually Organized:** Clear sections and formatting
- **Test-Verified:** Examples that actually work

Remember: Good vibes in coding come from confidence in the system, which comes from comprehensive testing and clear documentation.
