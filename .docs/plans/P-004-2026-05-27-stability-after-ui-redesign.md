# P-004 — Stabilise UI after major redesign

_Make the PWA UI consistent and working across all views of the app_

---

## Mission Control

- [x] Make the mantra look like on Macro dashboards — `MantraStrip` restyled to card with header+body matching `MantraWidget`
- [x] Mantra: add a way to set/clear it from Mission Control — inline edit with pencil button; placeholder shown when empty
- [x] "All systems healthy" is now only shown when there are genuinely no overdue/due-today/upcoming items
- [x] Micro Pulse: removed the "μ · peek" button — the whole card is now clickable with a hover effect to open the modal
- [x] Micro Pulse: when all contexts are clear, a single "All Micro contexts are clear" row is shown instead of N individual "all clear" rows

## Macro Dashboard

- [x] Priorities lists: added a **Manage Lists** button (List icon) in the widget header that opens a modal for adding, renaming, reordering, and deleting lists
- [x] Priorities widget counter: fixed — header badge now shows the total across all lists, not just the active list
- [x] Notes: mobile optimisation — body caps at 640px with scroll; `MacroNotes` two-pane layout stacks on screens ≤ 640px; delete button tap target improved
- [x] Now widget: reduced excessive right-side whitespace by removing the fixed `minWidth: 96` from the context indicator column
- [x] Ahead widget: date formatting now always includes the month name, giving consistent alignment across all rows

## Misc

- [x] Top bar outer padding aligned with page content — Topbar now uses 40px horizontal padding on desktop (matching `.page-pad`), 16px on mobile
- [x] Data persistence: already correctly configured via `./data:/app/data` volume in `docker-compose.yml` — no changes needed. **Never run `docker compose down -v`** as that removes the volume and wipes data.
- [x] Tests: added `lib/__tests__/mission-control.test.ts` covering `hasAny`, `allClear`, priority counter logic, and `formatDay` consistency
- [x] Drop shadows: replaced all inline `0 1px 2px rgba(0,0,0,0.4)` card shadows with `className="card-shadow"` across `NowColumn`, `WeekTimeline`, `MacroNotes`, `MacroPriorities`, `MacroAhead`
