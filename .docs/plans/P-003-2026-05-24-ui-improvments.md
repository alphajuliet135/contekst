# P-003 — iPhone PWA UI Improvements

_Make the PWA feel native and comfortable on iPhone._

---

## Todo

- [x] **T1** — Add safe-area CSS support (notch / Dynamic Island / home indicator)
- [x] **T2** — Increase base font size and touch target minimums (mobile-only)
- [x] **T3** — Redesign the top bar for mobile (collapsible context list)
- [x] **T4** — Rework the widget toggle bar so it doesn't dominate the screen
- [x] **T5** — Fix sticky/fixed elements that collide with home indicator
- [x] **T6** — Improve micro hub grid on narrow iPhones
- [x] **T7** — Review and tighten mobile breakpoints across the app
- [x] **T8** — Responsive two-column Macro dashboard grid
- [x] **T9** — Native iOS swipe-back gesture support
- [x] **T10** — iPad-specific layout tweaks

---

## What

A focused pass on the iPhone PWA experience, targeting readability, touch ergonomics, and layout problems that only appear on a small screen.

---

## Why

The app is fully functional on desktop but the PWA on iPhone feels like a shrunk-down desktop UI rather than something designed for the device. Key pain points reported:

- Text, icons, and interactive elements are too small to read and tap comfortably
- The widget toggle bar (shown in Edit Layout mode) spans the full viewport width but is visually too tall/dense on a phone screen
- The top bar context list gets cramped when there are more than a few contexts
- Several fixed/sticky elements don't account for the iPhone notch or home indicator safe areas, causing content to be clipped

---

## How

### T1 — Safe-area CSS support

Add `viewport-fit=cover` to the viewport meta in `app/layout.tsx`. Then thread `env(safe-area-inset-*)` into every fixed/sticky element:

| Component | Fix needed |
|-----------|-----------|
| `Topbar.tsx` | `padding-top: env(safe-area-inset-top)` on the sticky bar |
| `WidgetToggleBar.tsx` | `padding-bottom: env(safe-area-inset-bottom)` |
| `SettingsPanel.tsx` | `top` and `right` adjusted for insets |
| `UpdateBanner.tsx` | `bottom: max(24px, env(safe-area-inset-bottom))` |
| `globals.css` | Add `--safe-top`, `--safe-bottom` CSS vars at `:root` for reuse |

---

### T2 — Font size and touch targets (mobile-only)

- Desktop font stays at 14px — no risk of shifting existing layouts
- Under `@media (max-width: 480px)`: raise body `font-size` to 15px, 16px for primary content text
- Secondary/label text (currently 10–12px) floors at 12px, ideal 13px on mobile
- All interactive elements get a minimum 44×44px tap area. Where the visual size should stay small (checkboxes, icon buttons), use a transparent `::before` pseudo-element or `padding` to expand the hit zone without changing the layout

Specific targets:
- Topbar settings button: `width: 32` → `width: 44; height: 44`
- `MicroCard.tsx` checkbox: 14px visual → 44px hit zone via padding
- Priority badges: min font-size 12px
- Context nav items in topbar: 13px → 14px

---

### T3 — Top bar redesign for mobile

Current behaviour: all context tabs are listed horizontally in the sticky header and scroll off-screen. On desktop this is fine; on iPhone you quickly run out of space.

Proposed approach:

**≥ 768px (desktop):** keep existing horizontal tab strip — no change.

**< 768px (mobile):**
- Replace the scrolling context strip with a **compact header** showing only the active context name + colour dot
- A tap on it (or a dedicated chevron button) opens a **bottom sheet / drawer** listing all contexts — full name, dot colour, Macro/Micro label
- Drawer always opens scrolled to the top (no scroll position state to manage)
- The bottom sheet uses `position: fixed; bottom: 0` with `env(safe-area-inset-bottom)` padding, slides up with a CSS transition
- Micro shortcut (LayoutGrid icon) stays visible in the top bar at all times
- "Add context" and Settings buttons are retained on the right

This avoids the header becoming a scrolling list of tabs and gives each context enough room to be tappable.

---

### T4 — Widget toggle bar on mobile

Current behaviour: in Edit Layout mode the toggle bar is a full-width sticky strip at the bottom of the page. On desktop it shows all widget toggle chips in a single row. On iPhone the row wraps or overflows, and the bar itself is too tall.

Proposed approach:
- Cap bar height with `max-height: 56px` and `overflow-x: auto; -webkit-overflow-scrolling: touch` so chips scroll horizontally rather than wrap
- Reduce chip padding slightly on mobile (`padding: 4px 10px` down from `6px 14px`)
- Signal scrollability with a **gradient fade** at the left and right edges — a semi-transparent overlay that fades out chips to hint at more content (simple CSS, no JS)
- Ensure `padding-bottom: env(safe-area-inset-bottom)` so the bar clears the home indicator

---

### T5 — Home indicator / fixed element collisions (covered partially in T1)

Dedicated check of every `position: fixed` or `position: sticky; bottom: 0` element to make sure nothing is swallowed by the home indicator bar (~34px on modern iPhones). UpdateBanner and SettingsPanel are the main offenders beyond the toggle bar.

---

### T6 — Micro hub grid on narrow iPhones

Current: `minmax(280px, 1fr)` with `gap: 12`. On a 375px iPhone this gives a single column at ~363px — workable but very tight with no visual breathing room.

- Change to `minmax(min(280px, 100%), 1fr)` so the grid doesn't force horizontal scroll on small devices
- On `< 480px` increase card padding slightly (16px → 18px) and the gap to 16px so cards feel deliberate, not squished

---

### T7 — Mobile breakpoints audit

`globals.css` currently has one breakpoint at `768px`. Add:

| Breakpoint | Target |
|-----------|--------|
| `480px` | Small phones (iPhone SE, older models) |
| `390px` | iPhone 14/15 portrait |

Use these to:
- Increase padding in the main content area slightly on the smallest screens
- Scale down the Macro dashboard header to avoid text wrap on narrow viewports
- Reduce the "Needs attention" grid min-width on Mission Control

---

## Decisions

| # | Question | Decision |
|---|----------|----------|
| D1 | Drawer scroll position on open | Always top — no state overhead |
| D2 | Toggle bar scroll hint | Gradient fade edges — simple CSS, no JS |
| D3 | Font size scope | Mobile-only via `@media (max-width: 480px)` — desktop unchanged |

---

### T8 — Responsive Macro dashboard grid

On desktop the widget grid is two columns. On iPhone this feels like two cramped columns. Switch to a single-column stack below 768px — widgets still honour their half/full-width setting but the grid column count drops to 1, giving each widget full width.

- `gridTemplateColumns` switches from `repeat(2, 1fr)` → `1fr` under 768px
- Drag-to-reorder should still work in single-column mode
- Half/full-width toggle becomes less meaningful on mobile — hide the resize control below 768px to reduce confusion

---

### T9 — Native iOS swipe-back gesture

PWAs in standalone mode lose the browser's swipe-back gesture. Add a simple edge-swipe listener on the left ~30px of the screen that calls `router.back()`. This is a small JS enhancement:

- Listen for `touchstart` near the left edge and `touchend` with sufficient horizontal delta
- Only fire if a history entry exists (`window.history.length > 1`)
- No visual indicator needed for V1 — the gesture alone is enough

---

### T10 — iPad layout tweaks

iPad in portrait (768px) currently gets the mobile top-bar and single-column grid from T3/T8. That's too aggressive — iPad has the space for the desktop layout.

- Shift the mobile top-bar breakpoint from 768px → 640px so iPad keeps the full tab strip
- Keep the two-column widget grid on iPad (≥ 768px)
- The bottom-sheet context switcher and single-column grid only kick in below 640px
