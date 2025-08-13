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


