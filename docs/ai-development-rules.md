# AI Development Rules for Perfect Zenkai

**Purpose:** Maintain consistency, traceability, and quality across all development activities  
**Scope:** All AI agents working on Perfect Zenkai project  
**Last Updated:** 2025-01-12

---

## 🎯 Core Principles

### 1. Document Synchronization

**CRITICAL:** Every change must be reflected across all relevant documents to maintain consistency.

**Required Updates for ANY Change:**

1. **Primary MVP Document** (`docs/mvp-X-*.md`) - Update task status, progress, notes
2. **MVP Master List** (`docs/mvpmasterlist.md`) - Update corresponding section
3. **Solution Design** (`docs/solutiondesign.md`) - Update if architecture/tech decisions change
4. **This Rules File** - Update if new patterns/rules emerge

### 2. Status Tracking Protocol

**MANDATORY:** Update status in ALL documents when task status changes.

**Status Indicators:**

- 🔴 **Not Started** - No work begun
- 🟡 **In Progress** - Actively being worked on
- 🟢 **Completed** - All acceptance criteria met, tests pass
- 🔵 **Blocked** - Cannot proceed due to dependencies/issues
- ⚪ **On Hold** - Paused for strategic reasons

---

## 📋 Document Update Rules

### When Starting a Task

**MUST UPDATE:**

1. Change status from 🔴 to 🟡 in MVP document
2. Update "Last Updated" date
3. Add start time to progress tracking table
4. Note any blockers discovered
5. Update master list with same status

### When Completing a Task

**MUST UPDATE:**

1. Change status from 🟡 to 🟢 in MVP document
2. Check off all acceptance criteria checkboxes
3. Add actual hours to progress tracking table
4. Update sprint progress percentage
5. Fill in retrospective notes if task completes sprint
6. Update master list with completion
7. Update solution design if architecture changed

### When Encountering Issues

**MUST UPDATE:**

1. Change status to 🔵 if blocked
2. Document blocker in "Blockers & Risks" section
3. Add detailed notes in "Notes & Comments"
4. Estimate impact on timeline
5. Propose mitigation strategies

---

## 🏗️ Architecture Consistency Rules

### Module Isolation

**ENFORCE:** Modules may import `shared` but NEVER each other.

**Before Adding Any Import:**

1. Check if it violates module isolation
2. If cross-module import needed, refactor to use `shared`
3. Update solution design if new shared utilities added
4. Document decision in relevant MVP file

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

1. Document justification in MVP file
2. Update solution design tech stack section
3. Update master list if it affects prompts
4. Get approval before implementation

---

## 🧪 Quality Gate Rules

### Testing Requirements

**MANDATORY:** All code must meet testing standards.

**Unit Tests:**

- ≥90% coverage for new modules
- ≥80% coverage for modifications
- All store actions tested
- All components tested with renderWithProviders

**E2E Tests:**

- Mobile viewport (375×667)
- Offline scenarios where applicable
- Happy path and error cases
- Cross-browser compatibility

**Performance:**

- Lighthouse PWA score ≥90
- Bundle size impact documented
- Mobile performance verified

### Code Quality

**REQUIRED:** All code must meet quality standards.

**Standards:**

- TypeScript strict mode
- ESLint + Prettier compliance
- No console.log in production
- Proper error handling
- Accessibility compliance (WCAG 2.1 AA)

---

## 📊 Progress Tracking Rules

### Sprint Velocity Calculation

**FORMULA:** `(Completed Story Points / Planned Story Points) × 100`

**Update Frequency:** After each task completion

**Tracking Elements:**

- Story points (planning poker estimation)
- Actual hours vs estimated hours
- Velocity trends across sprints
- Blocker impact on timeline

### Retrospective Requirements

**MANDATORY:** Fill retrospectives after sprint completion.

**Required Sections:**

- What Went Well (minimum 2 items)
- What Could Be Improved (minimum 2 items)
- Action Items (specific, measurable)
- Velocity analysis
- Technical debt assessment

---

## 🔄 Change Management Protocol

### Design Decision Changes

**PROCESS:** When changing any design decision:

1. **Document in MVP file** under "Design Decisions"
2. **Update solution design** if architectural
3. **Update master list** if affects prompts
4. **Note rationale** for the change
5. **Assess impact** on other MVPs
6. **Update dependencies** if needed

### Scope Changes

**PROCESS:** When adding/removing features:

1. **Update acceptance criteria** in MVP file
2. **Recalculate story points** and effort estimates
3. **Update master list** with new prompts
4. **Document scope change** in notes section
5. **Assess timeline impact** on dependent MVPs

---

## 🚨 Error Handling Rules

### When Tests Fail

**IMMEDIATE ACTIONS:**

1. Change status to 🔵 Blocked
2. Document failure details in MVP file
3. Analyze root cause
4. Estimate fix effort
5. Update timeline if significant

### When Implementation Differs from Design

**REQUIRED ACTIONS:**

1. Document actual implementation in MVP file
2. Update solution design if architectural
3. Update master list prompts if needed
4. Justify deviation in design decisions
5. Assess impact on future MVPs

---

## 📝 Documentation Standards

### File Naming Convention

- MVP files: `mvp-X-descriptive-name.md`
- Use lowercase, hyphens for spaces
- Include MVP number for ordering

### Content Structure

**REQUIRED SECTIONS:** (in order)

1. Header with status, dependencies, dates
2. Sprint Overview with success criteria
3. User Stories & Tasks with detailed specs
4. Design Decisions with rationale
5. Progress Tracking with metrics
6. Retrospective (after completion)
7. Notes & Comments for additional context

### Writing Style

- **User stories:** "As a [user], I want [goal] so that [benefit]"
- **Acceptance criteria:** Testable, specific, measurable
- **Technical details:** Code examples, interfaces, specifications
- **Status updates:** Clear, concise, actionable

---

## 🔗 Cross-Reference Rules

### Linking Between Documents

**REQUIRED:** Maintain navigation links between related documents.

**Link Format:**

- Previous/Next MVP: `[MVP X - Name](./mvp-x-name.md)`
- Master list reference: `[MVP Master List](./mvpmasterlist.md)`
- Solution design: `[Solution Design](./solutiondesign.md)`

### Dependency Tracking

**MAINTAIN:** Clear dependency chains between MVPs.

**Document Dependencies:**

- Technical dependencies (code/architecture)
- Data dependencies (requires data from other modules)
- Testing dependencies (requires test infrastructure)
- UX dependencies (requires UI components)

---

## 🎯 Success Metrics

### Project Health Indicators

**TRACK:** Key metrics for project success.

**Velocity Metrics:**

- Story points completed per sprint
- Actual vs estimated hours
- Blocker frequency and resolution time
- Test pass rate

**Quality Metrics:**

- Code coverage percentage
- Lighthouse scores
- Bug count and severity
- Technical debt accumulation

### Completion Criteria

**DEFINITION OF DONE:** For entire project.

**MVP Completion:**

- All acceptance criteria met
- All tests passing
- Documentation updated
- Manual testing completed
- Performance verified

**Project Completion:**

- All 6 MVPs completed
- End-to-end testing passed
- Performance benchmarks met
- Documentation complete
- Ready for production deployment

---

## 🚀 Deployment Rules

### Pre-Deployment Checklist

**MANDATORY:** Before any deployment.

**Quality Gates:**

- [ ] All tests passing (unit, E2E, Lighthouse)
- [ ] Code coverage ≥80%
- [ ] No linting errors
- [ ] Performance benchmarks met
- [ ] Security audit passed
- [ ] Documentation updated

**Deployment Process:**

1. Run full test suite
2. Build production bundle
3. Verify bundle size
4. Test on actual mobile device
5. Deploy to staging
6. Run smoke tests
7. Deploy to production
8. Monitor for issues

---

## 📞 Escalation Protocol

### When to Escalate

**ESCALATE IMMEDIATELY:** If any of these occur:

1. **Blocker lasting >4 hours** without resolution path
2. **Architecture decision** affecting multiple MVPs
3. **Scope change** requiring >20% effort increase
4. **Quality gate failure** that can't be quickly resolved
5. **Security vulnerability** discovered
6. **Performance degradation** below acceptable thresholds

### Escalation Process

1. **Document issue** in relevant MVP file
2. **Assess impact** on timeline and other MVPs
3. **Propose solutions** with effort estimates
4. **Update all affected documents**
5. **Communicate status** to stakeholders

---

## 🔄 Continuous Improvement

### Rule Updates

**PROCESS:** When these rules need updating:

1. **Document reason** for rule change
2. **Update this file** with new/modified rules
3. **Notify all AI agents** of rule changes
4. **Update MVP files** if rules affect them
5. **Version control** rule changes

### Learning Integration

**CAPTURE:** Lessons learned during development:

1. **Document in retrospectives** what worked/didn't work
2. **Update rules** if patterns emerge
3. **Share knowledge** across MVP teams
4. **Improve processes** based on experience

---

## ✅ Compliance Checklist

**Before ANY commit, verify:**

- [ ] All affected documents updated
- [ ] Status indicators consistent across files
- [ ] Progress tracking updated
- [ ] Quality gates met
- [ ] Dependencies verified
- [ ] Links working
- [ ] No rule violations

**Remember:** Consistency is key to project success. When in doubt, update more documents rather than fewer.
