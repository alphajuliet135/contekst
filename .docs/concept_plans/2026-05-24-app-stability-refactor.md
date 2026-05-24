# App stability and code structure refactor

V1 is feature-complete. Before adding anything new, consolidate the foundation — fix real pain points from the live system, improve reliability, and make the codebase easier to reason about.

---

## Why now

The app works, but it was built feature-first. Now that the scope is settled, there's a clear opportunity to go back and firm things up. Several real problems have surfaced in daily use — session breaks on every deploy, missing UI for due dates, no notifications. These should be fixed as part of this initiative before any V2 additions.

---

## Areas to address

### Session invalidation on container update ⚠️ High priority

- **Problem:** Every time the Docker container is updated on the live system, all sessions are invalidated and cookies must be cleared manually. Particularly painful on mobile.
- **Likely cause:** `AUTH_SECRET` is not stable across deployments — if it's being auto-generated at build time or not persisted in the deployment environment, every new container produces a different signing key, making all existing JWTs invalid.
- **Direction:** Ensure `AUTH_SECRET` is explicitly set to a stable value in the deployment environment (`.env` on the host, not inside the container). Document this clearly in the deployment notes. Also consider whether the current cookie settings (`secure`, `sameSite`, `domain`) are correct for the live setup.

### Due dates missing from todos UI ⚠️ High priority

- **Problem:** The schema has `due_date` on todos, and Mission Control is designed to surface overdue/due-today items — but there's no way in the UI to actually set a due date. The feature is dead on arrival without data entry.
- **Direction:** Add a due date input to the todo creation and edit flow in the Priorities widget. Show the due date on todo rows (compact — just the date, coloured if overdue/soon using the existing `isOverdue` and `isDueSoon` utils in `lib/utils.ts`). Once data is flowing, Mission Control's Today section will start working as designed.

### "New version available" in-browser prompt

- **Problem:** When a new container is deployed, users (especially on mobile) have no indication and continue using a stale version indefinitely.
- **Direction:** Add a service worker that detects a new build hash and shows a non-intrusive banner: "New version available — Refresh". Next.js supports this pattern via a custom `_sw.js` or a library like `next-pwa`. This also lays the groundwork for push notifications (see below). The banner should be subtle — bottom of screen, dismissible, auto-disappears on refresh.

### Push notifications for due dates (PWA)

- **Problem:** No reminders for upcoming or overdue todos. Users who have installed the PWA on iOS or Android get nothing.
- **Direction:** Add Web Push notification support. High-level requirements:
  - Service worker with push event handler (prerequisite: service worker from "new version" feature above)
  - Notification permission prompt (on opt-in, not on first load)
  - Store push subscription per user/device in DB (new table: `push_subscriptions`)
  - Background job or cron that checks for todos due today/tomorrow and dispatches notifications
  - iOS PWA push requires iOS 16.4+; Android works broadly
- **Note:** This is the most significant new feature in this initiative. Scope it as a separate PR once the service worker is in place.

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

## Open questions

- Should `AUTH_SECRET` be rotated occasionally for security, or kept permanently stable? (Rotating it will always invalidate sessions — maybe document a "planned maintenance" expectation.)
- Is there appetite for adding any automated tests as part of this, or is that a separate initiative?
- Push notifications: opt-in per-device, or a global user setting? What's the right default cadence (day-of, day-before)?
- The "new version available" banner — should it auto-reload, or always require user confirmation?

---

## Priority order (rough)

1. **Session invalidation fix** — blocks every deployment; highest user friction
2. **Due dates in todo UI** — schema ready, just needs UI; high value, low risk
3. **Error boundaries** — high user-visible impact, low risk
4. **"New version available" banner** — pairs with service worker groundwork
5. **Push notifications** — depends on service worker being in place; meaningful new feature
6. **API route consistency + auth helper** — makes all future API work cleaner
7. **Type safety tightening** — catches bugs at compile time
8. **Loading states** — improves perceived performance
9. **Server/client component audit** — meaningful but more involved
10. **DB reliability** — investigate before committing to changes
11. **Code organisation / readability** — lowest urgency, do alongside other work
