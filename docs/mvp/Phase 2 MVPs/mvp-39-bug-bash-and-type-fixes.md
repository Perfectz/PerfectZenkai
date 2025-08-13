# MVP-39 Bug Bash and Type Fixes

## Goal
Stabilize the codebase by addressing high-signal lint and TypeScript errors found during the latest bug check while keeping behavior unchanged.

## Scope (Vertical Slices)
- Tasks module
  - Fix `no-case-declarations` in `TodoPage`
  - Correct rich content editor plugin types/imports
  - Checkbox prop mismatch in `RecurringTaskForm`
- Weight module
  - Align `addWeight` call shape with `WeightEntry` type
  - Relax OfflineSync typing usage boundaries
- Scripts
  - Fix `immediateCleanup` Supabase client import

Out of scope: Extensive Workout and Health agent type refactors (tracked separately).

## Success Criteria
- Type-check passes for modified files
- Lint errors reduced by at least 60% for targeted files
- App builds and dev server runs without new warnings

## TDD Plan
- RED: Run lint and type-check to capture failures
- GREEN: Apply minimal edits to pass type-check and lint for targeted files
- REFACTOR: Keep edits clean, no behavior change; add safe casting boundaries where necessary

## Risks
- Over-relaxing types can hide issues; mitigate by limiting any-casts to boundaries
- Rich editor plugin types can be finicky; prefer direct imports over lazy for plugins

## Tasks
1) TodoPage: wrap switch cases in blocks, remove unused imports, replace unsafe any casts
2) RichTextEditor: use direct imports for remark/rehype, correct Pluggable types
3) RecurringTaskForm: update Checkbox handler to use onCheckedChange if supported, else onChange mapping
4) Weight forms: include required `weight` prop or adjust type usage
5) OfflineSyncService: ensure queueOperation accepts optional priority/maxRetries and data typing boundary
6) immediateCleanup: replace `getSupabaseClientSync` with `getSupabaseClient`

## Validation
- Re-run `npm run type-check` and `npm run lint`
- Manual smoke test: add weight, add task, render Todo page

## Test Cases (TDD - RED → GREEN → REFACTOR)

### Unit & Component Tests
- Tasks: TodoPage sorting and rendering
  - should sort by created date by default
  - should sort by priority when selected
  - should not pass recurring todos into `EnhancedTodoRow`
  - file: `src/modules/tasks/__tests__/TodoPage.sorting.test.tsx`

- Tasks: RichTextEditor markdown rendering
  - renders code blocks with syntax highlighting (hljs theme)
  - supports remark-gfm links and lists
  - file: `src/modules/tasks/components/rich-content/__tests__/RichTextEditor.test.tsx`

- Tasks: RecurringTaskForm weekly day toggle
  - toggles selected days via checkbox onChange
  - validates at least one day selected for weekly
  - file: `src/modules/tasks/components/__tests__/RecurringTaskForm.test.tsx`

- Weight: WeightEntryForm conversion and submission
  - converts lbs to kg and calls addWeight with correct payload
  - file: `src/modules/weight/__tests__/WeightEntryForm.test.tsx`

- Shared: OfflineSyncService queueOperation typing boundary
  - accepts operation without priority/maxRetries and defaults correctly
  - persists to queue and triggers process when online
  - file: `src/shared/__tests__/OfflineSyncService.queue.test.ts`

### E2E Tests (Playwright)
- Add task flow
  - open Tasks page, add one-time task, verify appears in Active list
  - sort by priority and verify order
  - file: `e2e/TasksFlow.e2e.ts`

- Weight logging flow
  - open Health > Weight, log weight in lbs, verify entry row shows
  - file: `e2e/WeightFlow.e2e.ts`

### Example Test Skeletons
```ts
// src/modules/tasks/components/rich-content/__tests__/RichTextEditor.test.tsx
import { render, screen } from '@/test/test-utils'
import { RichTextEditor } from '../../rich-content/RichTextEditor'

test('renders code block with syntax highlighting', () => {
  render(
    <RichTextEditor value={'```js\nconsole.log(1)\n```'} format="markdown" onChange={() => {}} />
  )
  expect(screen.getByText('console.log(1)')).toBeInTheDocument()
})
```

```ts
// src/modules/weight/__tests__/WeightEntryForm.test.tsx
import { render, screen, fireEvent } from '@/test/test-utils'
import { WeightEntryForm } from '../../components/WeightEntryForm'

test('submits weight converted to kg', async () => {
  render(<WeightEntryForm />)
  fireEvent.change(screen.getByLabelText(/weight in pounds/i), { target: { value: '220' } })
  fireEvent.click(screen.getByRole('button', { name: /log/i }))
  // Assert addWeight called via toast or store (mock store in real test)
})
```

## How to Run Tests
- Unit/Component:
  ```bash
  npm run test
  npm run test:coverage
  ```
- E2E (ensure dev server is running):
  ```bash
  npm run dev:https
  # in another terminal
  npm run e2e:ui     # interactive
  # or
  npm run e2e        # headless
  ```


