# Features

## Planned

- [ ] Context reordering — drag or reorder which contexts appear in the top bar and in what sequence (small–medium)
- [ ] Due date push notifications — fire a push notification on the day a todo is due (medium, see [P-001](plans/P-001-2026-05-24-app-stability-refactor.md))
- [ ] Logo — update and make it look better (small)
- [ ] Persistent / configurable DB path — reliable Docker volume and user-configurable database location (medium)
- [ ] Calendar integrations — optional connection to Google Calendar or iCloud (big, future)
- [ ] Expo mobile app — offline-capable native app backed by the same API (big, future, needs refinement)

---

## Shipped

- [x] Auth, Mission Control, Macro dashboards, Micro hub, widget grid, promote/demote, top bar navigation (v0.1.6)
- [x] Inline todo editing, note titles, mantra widget, version number in Settings, widget drag-to-reorder (v0.1.x)
- [x] Today section on Mission Control — cross-context due/overdue/high-priority todos, sortable (v0.2.0)
- [x] Micro context peek modal — full widget dashboard overlay without promoting (v0.2.0)
- [x] Widget drag-to-reorder and half/full-width resize per widget (v0.2.0)
- [x] Edit Layout mode — drag handles, resize toggles, and widget toggle bar gated behind a button (v0.2.0)
- [x] Inline priority picker — H/M/L pills in place, no list-jumping (v0.2.0)
- [x] First-run signup flow — no manual DB inserts needed on a fresh install (v0.2.0)
- [x] Multiple priority lists per context — named sub-lists with a tab bar (v0.3.0)
- [x] Backup & restore — full JSON export/import from the Settings panel (v0.3.0)
- [x] Session stability — stable `AUTH_SECRET`, stale JWT invalidation, ghost session fix (v0.4.0, see [P-001](plans/P-001-2026-05-24-app-stability-refactor.md), [P-002](plans/P-002-2026-05-24-post-deploy-stability-fixes.md))
- [x] Backup restore cross-account userId remapping — restoring to a new account just works (v0.4.0, see [P-002](plans/P-002-2026-05-24-post-deploy-stability-fixes.md))
- [x] CI/CD — Release Please versioning, multi-arch Docker build, `/release` skill (v0.4.0, see [P-001](plans/P-001-2026-05-24-app-stability-refactor.md))
- [x] Due dates on todos — input in create/edit flow, coloured indicator on rows, surfaces in Today section (v0.5.0, see [P-001](plans/P-001-2026-05-24-app-stability-refactor.md))
- [x] Push notification support — service worker, subscription management, VAPID keys (v0.5.0, see [P-001](plans/P-001-2026-05-24-app-stability-refactor.md))
- [x] iPhone PWA improvements — safe areas, mobile top bar with context drawer, swipe-back gesture, responsive grid, touch targets (v0.5.0/v0.6.0, see [P-003](plans/P-003-2026-05-24-ui-improvments.md))
- [x] Multiple independent Priorities widgets — one widget per list, each with its own grid position and size (v0.6.0)
