# Changelog

All notable changes to Contekst are documented here.

---

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
