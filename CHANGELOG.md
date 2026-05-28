# Changelog

All notable changes to Contekst are documented here.

---

## [0.7.1](https://github.com/alphajuliet135/contekst/compare/v0.7.0...v0.7.1) (2026-05-28)


### Bug Fixes

* bind mount permissions and restore FK constraint ([e917d6c](https://github.com/alphajuliet135/contekst/commit/e917d6ce9af059769afb692e5a01cc87b6b44f3a))
* handle bind mount permissions and restore FK constraint ([d16612f](https://github.com/alphajuliet135/contekst/commit/d16612f177fb5d7f5cfb00bbf1f99392d3f81aa2))

## [0.7.0](https://github.com/alphajuliet135/contekst/compare/v0.6.0...v0.7.0) (2026-05-27)


### Features

* add documentation for bugs, features, and UI improvements; include screenshots ([96811b6](https://github.com/alphajuliet135/contekst/commit/96811b6f78f0717c6e57fcdff8534ff78b7c169e))
* **api:** enhance todo list update functionality with order support ([a4d8e1b](https://github.com/alphajuliet135/contekst/commit/a4d8e1b14c75ff7ead359402963ba2c0c1f8a405))
* enhance habit tracking with completion status and add weekday to habits ([e9f3769](https://github.com/alphajuliet135/contekst/commit/e9f3769bc735b324ee34ec1d1a92f8c5a48a9e00))
* **macro:** add TodoListsModal for managing todo lists ([a4d8e1b](https://github.com/alphajuliet135/contekst/commit/a4d8e1b14c75ff7ead359402963ba2c0c1f8a405))
* **mission-control:** implement editable mantra functionality in MantraStrip ([a4d8e1b](https://github.com/alphajuliet135/contekst/commit/a4d8e1b14c75ff7ead359402963ba2c0c1f8a405))
* Refactor MicroContextModal and add new components for mission control ([74e7e12](https://github.com/alphajuliet135/contekst/commit/74e7e1200717c4effd809271495b0dea3da2b8fc))
* update documentation for bugs and features; enhance clarity and structure ([5f29e4f](https://github.com/alphajuliet135/contekst/commit/5f29e4ffaa25da99bb8f0f600c66f826b504e220))


### Bug Fixes

* **layout:** remove hardcoded padding from Topbar component ([a4d8e1b](https://github.com/alphajuliet135/contekst/commit/a4d8e1b14c75ff7ead359402963ba2c0c1f8a405))
* **mission-control:** adjust layout in WeekTimeline component ([a4d8e1b](https://github.com/alphajuliet135/contekst/commit/a4d8e1b14c75ff7ead359402963ba2c0c1f8a405))
* **mission-control:** conditionally render system health status in BriefingHero ([a4d8e1b](https://github.com/alphajuliet135/contekst/commit/a4d8e1b14c75ff7ead359402963ba2c0c1f8a405))
* **widget:** ensure consistent styling in DatesWidget and NotesWidget components ([a4d8e1b](https://github.com/alphajuliet135/contekst/commit/a4d8e1b14c75ff7ead359402963ba2c0c1f8a405))

## [0.6.0](https://github.com/alphajuliet135/contekst/compare/v0.5.0...v0.6.0) (2026-05-25)


### Features

* enhance widget functionality and UI improvements ([7a7752f](https://github.com/alphajuliet135/contekst/commit/7a7752f2a0dd5a68bbaa4a7d3f62c5ddc8cc50a1))

## [0.5.0](https://github.com/alphajuliet135/contekst/compare/v0.4.0...v0.5.0) (2026-05-24)


### Features

* document post-deploy stability fixes for stale sessions, backup restore, and data persistence ([a370182](https://github.com/alphajuliet135/contekst/commit/a37018211abe1d178fd5d758d054d543a404adad))


### Bug Fixes

* invalidate stale JWT when user no longer exists in DB ([ec260f4](https://github.com/alphajuliet135/contekst/commit/ec260f4cbb7be9e7e412311065c1dda0221efa29))
* move webpush.setVapidDetails inside handler to avoid build-time error ([54cf84d](https://github.com/alphajuliet135/contekst/commit/54cf84d79a1e8860f04cfb031b48a74e16539ba0))
* move webpush.setVapidDetails inside handler to avoid build-time error ([43e50b9](https://github.com/alphajuliet135/contekst/commit/43e50b95458f7f499bafe6704ef38ceff7138d5c))

## [0.4.0](https://github.com/alphajuliet135/contekst/compare/v0.3.2...v0.4.0) (2026-05-24)


### Features

* add documentation structure and guidelines for concept plans ([2209910](https://github.com/alphajuliet135/contekst/commit/22099102806362336710d1beaab920a291bf4f11))
* add push notification support with subscription management ([6a4828f](https://github.com/alphajuliet135/contekst/commit/6a4828f766f83219d75c64077d446b5a17ad3eae))
* add vitest for testing and configure test environment ([0d800c0](https://github.com/alphajuliet135/contekst/commit/0d800c0addca0115ff1caba82e2933cd9744ccd3))
* enhance app stability and refactor code structure with clear decisions and testing direction ([ca13291](https://github.com/alphajuliet135/contekst/commit/ca13291b8b895301a852bbc1de9dbb4e85951026))
* implement CI/CD improvements with Release Please, Docker workflow separation, and branch protection ([431ae26](https://github.com/alphajuliet135/contekst/commit/431ae260815259d6b88fc2962dbf76863ebde619))

## [0.3.0] — 2026-05-21

### Added

- **Multiple priority lists per context** — create named sub-lists within the Priorities widget; tab bar shows Main (ungrouped todos) + named lists; single-click to switch, double-click to rename inline, hover × to delete; lists persist per context in the database
- **Backup & restore** — export a full JSON backup of all contexts, todos, notes, habits, dates, links, people, and widget settings from the Settings panel; restore from a backup file with two-step confirmation; last backup timestamp shown per browser

### Changed

- `todo-lists/[id]` PATCH now whitelists only the `name` field (prevents body-injection of `userId`/`contextId`)

### Fixed

- Standardised auth checks to `session?.user?.id` across all API routes (prevents crash if JWT exists but `user.id` is undefined)
- Added contextId ownership check to `POST /api/todos` (a user could previously create todos in contexts they don't own)
- Fixed race condition in `handleAdd` (TodosWidget, MicroCard) — `submitting` flag is now reset after the fetch completes, preventing duplicate todos on rapid clicks
- Added AbortController to MicroContextModal data fetch — prevents setState on unmounted component if the modal closes while loading

---

## [0.2.2] — 2026-05-21

### Fixed

- Ghost session detection in app layout — calls `signOut` when a valid JWT references a user that no longer exists in the database
- Skip runtime migration runner when Docker `scripts/migrate.js` has already run — prevents double-applying all migrations on every container start

---

## [0.2.1] — 2026-05-20

### Fixed

- Replaced Drizzle's built-in `migrate()` with a fault-tolerant `runMigrations()` — handles existing databases without a `__drizzle_migrations` tracking table; tolerates "already exists" and "duplicate column" errors per statement

---

## [0.2.0] — 2026-05-20

### Added

- **Today section** in Mission Control — flat cross-context list of todos due today, overdue, or high-priority; three sort modes: Priority (default), Context (grouped), Due date
- **Micro context peek modal** — view the full widget dashboard for any Micro context in a centered overlay without permanently promoting it; accessible via the ↗ icon on each Micro card; Escape or click-outside to close
- **Mantra widget** — per-context inspirational text; stored in `widget_configs.settings`; toggleable via Edit Layout
- **Widget drag-to-reorder** — drag handles (centered top of card) appear in Edit Layout mode; sort order persists per context in the database
- **Widget resize** — toggle any widget between half-width and full-width; Notes and Mantra default to full-width; choice persists per context
- **Edit Layout mode** — drag handles, resize toggles, and the widget toggle bar are hidden by default; an "Edit layout" / "Done" button above the grid toggles the editing UI
- **Inline priority picker** — clicking a priority badge opens H / M / L pill buttons in place; the list re-sorts only after a deliberate selection, eliminating unwanted jumping
- **Note titles** — optional title field above note content; click "+ Add title" to set; inline editable; persisted to the `notes.title` column
- **First-run signup flow** — on a fresh install the app navigates to `/signup`; account creation is handled through the UI, no manual database inserts needed
- **Auto-migrations** — `server/db/index.ts` runs Drizzle migrations on module load so the database schema is always up-to-date on startup
- **Settings version number** — current app version displayed in the Settings panel "About" section

### Changed

- Upgraded Next.js from 15 to 16 (Turbopack dev server; production build unchanged)
- Widget settings API (`PATCH /api/widgets`) now **merges** the incoming `settings` object with existing settings rather than replacing — prevents data loss when toggling widget size while Mantra text is set
- Widget toggle bar is now hidden by default and only appears in Edit Layout mode
- Macro context page subtitle dynamically reads "Micro context" or "Macro context" based on actual context type

### Fixed

- Suppressed @dnd-kit `aria-describedby` hydration mismatch (server/client ID counter difference)
- Resolved permanent "rendering…" hang when navigating to Macro context pages — root cause: passing pre-rendered JSX across an RSC boundary through a `dynamic(ssr:false)` Suspense component; fixed by restructuring to a single `WidgetDashboard` client component that receives serializable data props

---

## [0.1.6] — 2026-04-xx

- Initial self-hosted release
- Multi-arch Docker image (`amd64` + `arm64`) published to GHCR on merge to `main`
- Auth, Mission Control, Macro dashboards, Micro hub, widget grid, promote/demote, top bar navigation
