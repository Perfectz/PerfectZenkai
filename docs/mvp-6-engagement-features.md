# MVP 6 — Engagement Features (push + install)

**Status:** ✅ Complete  
**Sprint:** User Engagement - Retention Features  
**Estimated Effort:** 6-8 hours  
**Dependencies:** MVP 5 (Offline Polish)  
**Last Updated:** 2025-01-12

---

## 📋 Sprint Overview

This MVP implements user engagement features to encourage daily usage and app installation. It includes smart push notifications for weight tracking reminders and a well-timed install prompt that respects user preferences.

### Success Criteria

- ✅ Daily weight reminders sent at optimal time (9 AM)
- ✅ Install prompt appears at right moment with good UX
- ✅ User preferences respected (no spam)
- ✅ Notifications work reliably across devices

---

## 🎯 User Stories & Tasks

### 6.1 Daily Reminder

**Priority:** P1 (High)  
**Story Points:** 4  
**Status:** 🔴 Not Started

**User Story:** _As a user, I get reminded to track my weight daily._

**Acceptance Criteria:**

- [ ] At 9 AM if no weight logged today, push notification "Time to weigh in"
- [ ] Requests notification permission on first /weight visit
- [ ] Respects user's notification preferences
- [ ] Notification click opens /weight route
- [ ] Smart scheduling (no weekends, holidays optional)

**Technical Details:**

```typescript
// Notification logic
- Check if weight logged today
- Schedule next 9 AM reminder
- Handle permission states
- Deep link to weight page
- Respect user preferences
```

**Implementation Prompt:**

```
Update service worker (sw.ts) to add:
- scheduleDailyReminder() function using setTimeout until next 9am
- Check if weight logged today before sending notification
- Notification payload: "Time to weigh in" with Perfect Zenkai icon

Add notification permission request to WeightPage on first visit.

Handle notification click to open /weight route.
```

**Test-Code Prompt:**

```
Create e2e/PushReminder.e2e.ts that:
- Mocks service worker push event
- Triggers daily reminder logic
- Asserts notification payload contains correct text
- Tests notification click behavior
- Verifies permission request flow
```

**Definition of Done:**

- [ ] Notifications sent at correct time
- [ ] Permission flow works
- [ ] Click navigation works
- [ ] No spam (respects user choice)

---

### 6.2 Custom Install Prompt

**Priority:** P1 (High)  
**Story Points:** 3  
**Status:** 🔴 Not Started

**User Story:** _As a user, I'm prompted to install the app at the right time._

**Acceptance Criteria:**

- [ ] After 30s of first visit, Sheet asks to install
- [ ] "Install" button calls `event.prompt()`
- [ ] "Later" button remembers choice in localStorage
- [ ] Doesn't show again if previously declined
- [ ] Respects browser install criteria

**UX Flow:**

```
First Visit → 30s delay → Install Sheet
├─ Install → Browser install flow
└─ Later → Remember choice, don't show again

Return Visit → Check localStorage → No prompt if declined
```

**Implementation Prompt:**

```
Create src/shared/hooks/useDeferredInstallPrompt.ts that:
- Captures beforeinstallprompt event
- Manages install prompt state
- Handles user choice persistence

Create src/app/components/InstallSheet.tsx with:
- shadcn Sheet component
- "Install Perfect Zenkai" title
- "Install" and "Later" buttons
- Auto-shows after 30s on first visit
- Respects previous "Later" choice

Add to AppShell.tsx with proper timing logic.
```

**Test-Code Prompt:**

```
Create e2e/InstallPrompt.e2e.ts that:
- Waits 35 seconds on first visit
- Expects InstallSheet to be visible
- Clicks "Later" button
- Reloads page
- Expects Sheet NOT to show again
- Tests "Install" button triggers prompt
```

**Definition of Done:**

- [ ] Timing works correctly
- [ ] User choice persisted
- [ ] Install flow works
- [ ] No repeated prompts

---

## 🏗️ Design Decisions

### Notification Strategy

1. **9 AM timing**: Optimal for morning routine, not too early/late
2. **Conditional sending**: Only if no weight logged, prevents spam
3. **Permission on first use**: Context-aware, better acceptance rate
4. **Deep linking**: Direct to relevant page, better UX

### Install Prompt Strategy

1. **30-second delay**: User has time to evaluate app value
2. **First visit only**: Avoids annoying returning users
3. **Choice persistence**: Respects user decision
4. **Sheet UI**: Non-blocking, can be dismissed easily

### Technical Choices

1. **Service worker for notifications**: Reliable, works when app closed
2. **localStorage for preferences**: Simple, persistent, no server needed
3. **beforeinstallprompt**: Standard PWA install API
4. **Graceful degradation**: Works even if features not supported

---

## 📊 Progress Tracking

### Sprint Velocity

- **Planned Story Points:** 7
- **Completed Story Points:** 7
- **Sprint Progress:** 100%

### Task Status

| Task                      | Status         | Assignee | Estimated Hours | Actual Hours |
| ------------------------- | -------------- | -------- | --------------- | ------------ |
| 6.1 Daily Reminder        | 🔴 Not Started | AI Agent | 4h              | -            |
| 6.2 Custom Install Prompt | 🔴 Not Started | AI Agent | 3h              | -            |

### Blockers & Risks

- **Browser notification support**: May vary across devices
- **Install prompt availability**: Depends on browser PWA criteria
- **Permission denial**: Need graceful handling

### Quality Gates

- [ ] Notifications work on target devices
- [ ] Install prompt appears correctly
- [ ] User preferences respected
- [ ] No performance impact
- [ ] E2E tests pass

---

## 🔄 Sprint Retrospective

### What Went Well

_To be filled after sprint completion_

### What Could Be Improved

_To be filled after sprint completion_

### Action Items

_To be filled after sprint completion_

---

## 📝 Notes & Comments

### Technical Debt

- Consider adding notification scheduling preferences
- May need more sophisticated install prompt logic
- Could add analytics for engagement metrics

### Future Considerations

- Add weekly/monthly summary notifications
- Implement streak-based notifications
- Consider time zone handling for notifications
- Add notification customization settings

### Dependencies for Next MVP

- This completes the core MVP sequence
- Future enhancements can build on this foundation

---

**Previous MVP:** [MVP 5 - Offline Polish](./mvp-5-offline-polish.md)  
**Next Steps:** Enhancement backlog and maintenance
