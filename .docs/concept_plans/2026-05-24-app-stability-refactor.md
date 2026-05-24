# App stability and code structure refactor

V1 is feature-complete. Before adding anything new, consolidate the foundation — fix real pain points from the live system, improve reliability, and make the codebase easier to reason about.

---

## Why now

The app works, but it was built feature-first. Now that the scope is settled, there's a clear opportunity to go back and firm things up. Several real problems have surfaced in daily use — session breaks on every deploy, missing UI for due dates, no notifications. These should be fixed as part of this initiative before any V2 additions.

---

## Decisions

| Question | Decision |
|----------|----------|
| `AUTH_SECRET` rotation | Rotate occasionally for security hygiene — treat as planned maintenance, communicate to users in advance |
| Automated tests | Write tests alongside the refactor (especially API routes and utilities), not as a separate initiative |
| Push notifications | Per-device opt-in via browser permission prompt; fire on the day the todo is due |
| "New version available" banner | Always require user to tap Refresh — no auto-reload |

---

## Areas to address

### Session invalidation on container update ⚠️ High priority

- **Problem:** Every time the Docker container is updated on the live system, all sessions are invalidated and cookies must be cleared manually. Particularly painful on mobile.
- **Likely cause:** `AUTH_SECRET` is not stable across deployments — if it's being auto-generated at build time or not persisted in the deployment environment, every new container produces a different signing key, making all existing JWTs invalid.
- **Direction:** Ensure `AUTH_SECRET` is explicitly set to a stable value in the deployment environment (`.env` on the host, not inside the container). Document this clearly in the deployment notes. `AUTH_SECRET` should be rotated periodically for security hygiene — when rotated, all sessions will be invalidated; treat this as planned maintenance and communicate it to users in advance. Also verify cookie settings (`secure`, `sameSite`, `domain`) are correct for the live setup.

### Due dates missing from todos UI ⚠️ High priority

- **Problem:** The schema has `due_date` on todos, and Mission Control is designed to surface overdue/due-today items — but there's no way in the UI to actually set a due date. The feature is dead on arrival without data entry.
- **Direction:** Add a due date input to the todo creation and edit flow in the Priorities widget. Show the due date on todo rows (compact — just the date, coloured if overdue/soon using the existing `isOverdue` and `isDueSoon` utils in `lib/utils.ts`). Once data is flowing, Mission Control's Today section will start working as designed.

### "New version available" in-browser prompt

- **Problem:** When a new container is deployed, users (especially on mobile) have no indication and continue using a stale version indefinitely.
- **Direction:** Add a service worker that detects a new build hash and shows a non-intrusive banner: "New version available — Refresh". Next.js supports this pattern via a custom service worker or a library like `next-pwa`. The banner should be subtle — bottom of screen, dismissible — and always requires the user to tap Refresh. No auto-reload. This also lays the groundwork for push notifications (see below).

### Push notifications for due dates (PWA)

- **Problem:** No reminders for upcoming or overdue todos. Users who have installed the PWA on iOS or Android get nothing.
- **Direction:** Add Web Push notification support. High-level requirements:
  - Service worker with push event handler (prerequisite: service worker from "new version" feature above)
  - Notification permission prompt shown on explicit opt-in, not on first load
  - Per-device opt-in — store push subscription per user/device in DB (new table: `push_subscriptions`)
  - Background job or cron that checks for todos due today and dispatches notifications on the day
  - iOS PWA push requires iOS 16.4+; Android works broadly
- **Note:** This is the most significant new feature in this initiative. Scope it as a separate PR once the service worker is in place.

### Testing

- No automated tests currently exist. The refactor touches API routes, utilities, and data flows that are hard to verify manually.
- **Direction:** Write tests alongside the refactor work — not as a separate initiative. Focus on:
  - API route handlers (input validation, auth checks, response shapes)
  - Utility functions in `lib/utils.ts` (pure functions, easy to test)
  - DB query helpers once those are extracted
- Use a lightweight test setup appropriate for Next.js (e.g., Vitest + Testing Library for components, Vitest for pure logic).

### Error handling

- No React error boundaries anywhere — a single unhandled throw can blank the whole page
- API routes return inconsistent shapes on errors (some return `{ error }`, some throw, some return empty)
- Client-side fetch calls often have no error state in the UI — failures are silent

**Direction:** Add error boundaries at the page and widget level. Standardise API error responses to `{ error: string }` with consistent HTTP status codes. Surface errors in the UI where data fails to load.

### API route consistency

- Response shapes vary across routes
- Some routes don't validate input at all; others do partial validation
- No shared middleware pattern for auth checks — each route re-implements session fetching

**Direction:** Extract a small `withAuth` wrapper or shared helper for session validation. Standardise response shape: `{ data }` on success, `{ error }` on failure.

### Type safety

- `lib/types.ts` has the shared interfaces but some are loose (`any`, optional fields that shouldn't be)
- API route return types aren't always enforced — TypeScript trusts `Response.json()` implicitly
- Some widget components accept `any`-typed props

**Direction:** Tighten the types in `lib/types.ts`. Add return type annotations to API handlers. Replace any remaining `any` usages.

### Loading and suspense states

- Server component pages have no loading fallbacks — slow DB queries show a blank or stale screen
- No `loading.tsx` files in any route segment
- Widget data is either all-or-nothing; no per-widget loading indication

**Direction:** Add `loading.tsx` where appropriate. Consider Suspense boundaries around widget sections to allow incremental rendering.

### Server vs. client component audit

- `"use client"` is used broadly, including in components that could be server-rendered
- This limits streaming and increases bundle size
- Goal: push interactivity to leaf nodes; keep data-fetching and layout in server components

**Direction:** Walk the component tree and identify components that only need client APIs (state, effects, event handlers). Move static/presentational parts out.

### DB reliability

- Migration script is tolerant but could be more defensive
- WAL mode is set on connection, but there's no connection pooling or retry logic for busy errors
- The in-memory DB workaround during `next build` is a workaround, not a fix

**Direction:** Review connection lifecycle. Investigate whether the build-time workaround can be eliminated properly (e.g., guard DB calls behind a check, or restructure so build doesn't touch the DB at all).

### Code organisation and readability

- Codebase has grown organically — a human reading it cold would struggle to orient quickly
- Some utility functions in `lib/utils.ts` may be unused or duplicated
- Component files have grown — some could be split for clarity
- Inconsistent file naming (some kebab-case, some PascalCase for non-component files)

**Direction:** Audit `lib/utils.ts` for unused exports. Review large component files for natural split points. Settle on a consistent naming convention. Add inline comments where the *why* is non-obvious (not what the code does, but why it's structured that way). Consider a brief orientation section in `CLAUDE.md` for contributors new to the codebase.

---

### CI/CD improvements

The current release workflow is a single file that bundles versioning, tag creation, and Docker builds. It uses GitHub's default `generate_release_notes: true`, which produces a flat commit list — not very readable.

**Planned changes:**

#### Switch to Release Please
Replace the manual version-from-`package.json` approach with `googleapis/release-please-action@v4` (the same tool used by the j3tsetr reference project). Release Please:
- Reads conventional commits and determines the next version automatically (`feat:` → minor, `fix:` → patch, `feat!:` → major)
- Opens a PR that bumps `package.json` version and generates a structured `CHANGELOG.md` grouped by commit type
- Publishes the GitHub Release when that PR is merged

This replaces the current `softprops/action-gh-release` step entirely.

#### Separate Docker build workflow
Move the multi-arch Docker build (amd64 + arm64) out of `release.yml` into a new `docker.yml` that triggers on `on: release: types: [published]`. The build logic stays identical — only the trigger and the version-reading mechanism change (version comes from `github.event.release.tag_name` instead of a `jq` step).

#### Branch protection
Set `main` and `develop` as protected branches via `gh api`:
- No direct pushes — PRs required
- Deletion forbidden
- One-time setup, not a workflow file

#### `/release` Claude Code skill
Create `.claude/commands/release.md` — a markdown prompt file that becomes available as `/release` inside Claude Code. It guides the full release process:
- Pre-release checklist (branch, build, no secrets staged)
- Conventional commit type reference (what triggers which version bump)
- Step-by-step flow: push develop → PR to main → Release Please PR → merge → Docker builds
- Troubleshooting for common failure modes

#### Conventional commit convention
All commits going into a release should follow this format: `<type>: <description>`

| Type | Version bump | Use for |
|------|-------------|---------|
| `feat:` | minor (0.x.0) | New user-facing feature |
| `fix:` | patch (0.0.x) | Bug fix |
| `feat!:` | major (x.0.0) | Breaking change |
| `chore:` | none | Deps, tooling, config |
| `refactor:` | none | Code restructure, no behaviour change |
| `ci:` | none | CI/CD workflow changes |
| `docs:` | none | Documentation only |
| `test:` | none | Adding or fixing tests |

---

## Priority order (rough)

1. **Session invalidation fix** — blocks every deployment; highest user friction
2. **Due dates in todo UI** — schema ready, just needs UI; high value, low risk
3. **CI/CD improvements** — Release Please + Docker split + branch protection + `/release` skill
4. **Error boundaries** — high user-visible impact, low risk
5. **"New version available" banner** — pairs with service worker groundwork
6. **Push notifications** — depends on service worker being in place; meaningful new feature
7. **API route consistency + auth helper** — makes all future API work cleaner
8. **Testing** — write as work progresses through items above
9. **Type safety tightening** — catches bugs at compile time
10. **Loading states** — improves perceived performance
11. **Server/client component audit** — meaningful but more involved
12. **DB reliability** — investigate before committing to changes
13. **Code organisation / readability** — lowest urgency, do alongside other work
