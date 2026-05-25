# Bugs

## Open

- [ ] Context order — no way to reorder which contexts appear in the top bar and in what sequence

---

## Fixed

- [x] Stale JWT crashes app after DB reset — user's data is gone but the cookie is still valid (fixed v0.4.0, [P-002](plans/P-002-2026-05-24-post-deploy-stability-fixes.md))
- [x] Backup restore fails with FOREIGN KEY constraint — old `userId` from backup doesn't match new account UUID (fixed v0.4.0, [P-002](plans/P-002-2026-05-24-post-deploy-stability-fixes.md))
- [x] Sessions invalidated on every Docker deploy — `AUTH_SECRET` was not stable across container restarts (fixed v0.4.0, [P-001](plans/P-001-2026-05-24-app-stability-refactor.md))
- [x] `signOut()` called from a Server Component during ghost-session detection → Next.js cookie error (fixed v0.2.2)
- [x] Migrations ran twice on every container start (fixed v0.2.1)
- [x] Macro context page stuck on "rendering…" — JSX passed across RSC/client boundary (fixed v0.2.0)
- [x] `@dnd-kit` `aria-describedby` hydration mismatch (fixed v0.2.0)
- [x] Race condition in todo creation — `submitting` flag not reset after fetch (fixed v0.3.0)
- [x] Due date placeholder (`opacity: 0`) causes empty space under every todo row without a date (fixed v0.6.0)
- [x] Multiple Priorities widgets all show the same todos — `settings.listId` double-serialised in DB (fixed v0.6.0)
- [x] Multiple Priorities widgets show "Priorities" as the title for all lists — symptom of above (fixed v0.6.0)
- [x] × remove button on Priorities chip in toggle bar too small (fixed v0.6.0)
