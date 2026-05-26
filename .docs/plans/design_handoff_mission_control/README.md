# Handoff: Mission Control redesign — "Briefing" variation

## Overview

A redesign of the **Mission Control** page (`app/(app)/page.tsx`) in the Contekst codebase. Moves from a "grid of context cards + sidebar" layout to a single‑glance **daily briefing** with a paragraph summary, a 7‑day mini heatmap, a Mantra strip, Pinned shortcuts, a two‑column **Now / Ahead** body, and a **Micro pulse** footer.

The right‑hand Micro sidebar from the current design is removed — Micro contexts surface as a horizontal footer strip instead.

---

## About the design files

The HTML in this bundle is a **design reference**, not production code:

- `Mission Control.html` — entry; loads two variations on a design canvas. Variation **B — Briefing** is the one to implement.
- `mc-variant-b.jsx` — the React/JSX markup for variation B. Source of truth for layout, copy, spacing, and tokens.
- `design-canvas.jsx` — just the surrounding pan/zoom shell. **Ignore for implementation.**

Recreate the design in the Contekst codebase using its **existing conventions** (CLAUDE.md):

- Next.js 16 App Router
- Server components by default; `"use client"` only where interactivity requires it
- **Inline styles with `hsl(var(--*))`** CSS custom properties — do not introduce Tailwind utility classes for colors/layout
- Lucide icons (already in use throughout the app)
- All data scoped to `user_id`

---

## Fidelity

**High‑fidelity.** Colors, type sizes, spacing, and border treatments in the prototype are final. Match the prototype 1:1, but read tokens from `globals.css` instead of hardcoding hex values (the prototype hardcoded them because it runs standalone).

---

## Where it lives

- **Page:** `app/(app)/page.tsx` — replace the existing return tree
- **New components** (suggested):
  - `components/mission-control/BriefingHero.tsx` — client; reads counts + date
  - `components/mission-control/WeekStrip.tsx` — client; 7‑day heatmap
  - `components/mission-control/NowColumn.tsx` — client (already partially exists as `TodayFocus`; refactor or replace)
  - `components/mission-control/WeekTimeline.tsx` — server‑renderable; "Ahead" list grouped by day
  - `components/mission-control/MantraStrip.tsx` — server‑renderable
  - `components/mission-control/PinnedStrip.tsx` — server‑renderable
  - `components/mission-control/MicroPulse.tsx` — server‑renderable with a small client sparkline
- **Existing pieces to reuse:**
  - `Greeting.tsx` — fold its logic into `BriefingHero` (or keep and import)
  - `TodoCheckbox` from `components/ui/TodoCheckbox.tsx`
  - `colorTint`, `formatDate` from `lib/utils.ts`

---

## Page layout (top → bottom)

```
┌─────────────────────────── Topbar (unchanged) ──────────────────────────┐

  page‑pad (36px 40px)

  ┌─── BriefingHero ────────────────────────────────────────────────────┐
  │  Left col (1.4fr)                  │  Right col (1fr) — WeekStrip   │
  │  ──────────────                    │  ───────────────               │
  │  BRIEFING — Sun 18 May, 09:42 •    │  THIS WEEK         WK 20       │
  │  all systems healthy               │  [7 day boxes, today filled]   │
  │  Good morning, AJ.                 │                                │
  │  Summary paragraph with counts.    │                                │
  └─────────────────────────────────────────────────────────────────────┘
       │ 24px bottom padding + 0.5px border + 28px margin │

  MantraStrip                       ← single full‑width card, blue left accent

  PINNED                            ⌘P to focus
  PinnedStrip                       ← 3 equal cards

  ┌── NowColumn (1.1fr) ──────────┐ ┌── WeekTimeline (1fr) ────────────┐
  │  Now                          │ │  Ahead                           │
  │  Overdue (red dot)            │ │  Mon 19 → Book ground school     │
  │   • todos…                    │ │  Tue 20 → Study nav ch.4         │
  │  Due today (amber dot)        │ │  Wed 21 → Flight sim session     │
  │   • todos…                    │ │  Fri 23 → Plan Marco birthday    │
  └───────────────────────────────┘ │  Sat 24 → Team offsite           │
                                    │  Sat  1 Jun → Marco's birthday   │
                                    │  Mon  3 Jun → ATPL theory exam   │
                                    └──────────────────────────────────┘

  MICRO PULSE                       3 micros · ticking along
  [3 cards: name + dot, → top item, meta, sparkline]
```

Container: no right sidebar. Single column, full page‑pad.

---

## Design tokens (read from `globals.css`)

| Token              | Variable                       | Used for                              |
|--------------------|--------------------------------|---------------------------------------|
| background         | `hsl(var(--background))`       | Page bg                               |
| foreground         | `hsl(var(--foreground))`       | Primary text                          |
| muted              | `hsl(var(--muted))`            | Soft dividers, active pills           |
| muted‑foreground   | `hsl(var(--muted-foreground))` | Section labels, meta text             |
| border             | `hsl(var(--border))`           | Card borders, dividers                |
| card               | `hsl(var(--card))`             | All card surfaces                     |

Status colors (hardcoded — match existing `TodayFocus.tsx` and page badges):

- Overdue dot/text: `#d95f5f`
- Due‑today dot/text: `#d4883a`
- Sync OK: `#2ec27e`
- Mantra left accent: `rgba(77,154,255,0.55)` (the same blue used for Mission Control tab)

Priority badges — **already implemented** in `app/(app)/page.tsx` (`BADGE_STYLES`). Reuse verbatim.

Context dot/heatmap dot colors come from `contexts.color` (user data).

---

## Component spec

### 1. BriefingHero

Replaces the current Greeting + date row.

**Layout:** CSS grid, `gridTemplateColumns: '1.4fr 1fr'`, `gap: 24`, `alignItems: 'end'`, `paddingBottom: 24`, `borderBottom: 0.5px solid hsl(var(--border))`, `marginBottom: 28`.

**Left column:**
- Top eyebrow row: `BRIEFING — Sun 18 May, 09:42 • all systems healthy`
  - Format: `BRIEFING — ${formatted now} • all systems healthy`
  - "all systems healthy" can be a static OK indicator (green dot + text) since there's no health check API yet.
  - Style: `fontSize: 11`, monospace (`ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`), `letterSpacing: 1`, `textTransform: 'uppercase'`, `color: hsl(var(--muted-foreground))`, separators are 4×4 round dots in `hsl(var(--border))`.
- Heading: `Good morning, AJ.` — `fontSize: 32`, `fontWeight: 600`, `letterSpacing: -0.6`, `lineHeight: 1.2`.
  - Greeting variant by hour mirrors current `Greeting.tsx` (Good morning / afternoon / evening).
  - Appends `, ${firstName}.` if name set.
- Summary paragraph — `fontSize: 15`, `lineHeight: 1.55`, `color: hsl(var(--muted-foreground))`, `maxWidth: 580`, `margin: '10px 0 0'`.
  - Template: `You have <span color="#d95f5f" weight=500>{overdueCount} overdue</span>, <span color="#d4883a" weight=500>{dueTodayCount} due today</span>, and <span color="fg" weight=500>{upcoming7dCount} events</span> in the next week — mostly {topContextByLoad}.`
  - Skip clauses whose count is 0. If everything is empty, "All clear for today."
  - `topContextByLoad` = the macro context with the most overdue+due‑today todos; null if tied/empty.

**Right column:** see WeekStrip below.

### 2. WeekStrip

7 columns, `display: grid; gridTemplateColumns: repeat(7, 1fr); gap: 6`.

Each cell:
- `padding: '8px 6px 10px'`, `borderRadius: 8`, `textAlign: 'center'`.
- **Today** cell: `background: hsl(var(--card))`, `border: 0.5px solid hsl(var(--border))`. All other cells: transparent + transparent border (keeps row height equal).
- Day label (e.g. `SUN`): `fontSize: 10`, mono, `letterSpacing: 0.5`, `color: today ? fg : muted-fg`.
- Date number: `fontSize: 14`, mono, `fontWeight: today ? 600 : 500`, `lineHeight: 1`.
- Item dot well: `marginTop: 8`, `height: 18`, flex row wrapping with `gap: 2`, items aligned to flex‑end.
  - Each dot: `width: 5`, `height: 5`, `borderRadius: 1.5`, `background: ctx.color`, `opacity: priority === 'high' ? 1 : priority === 'medium' ? 0.65 : 0.4`.

**Data:** query all `todos` (with `dueDate` in week) and `dates` (in week) for the user, group by day, sorted by `[contextOrder, priority]`. Cap displayed dots per cell at ~6 to avoid overflow (excess → no indicator, the count is implied by visual density).

### 3. MantraStrip

Single full‑width card.

```
background:   hsl(var(--card))
border:       0.5px solid hsl(var(--border))
border-left:  2px solid rgba(77,154,255,0.55)
border-radius: 10
box-shadow:    0 1px 2px rgba(0,0,0,0.4), 0 0 0 0.5px rgba(255,255,255,0.04)
padding:      16px 20px
display:      flex; align-items: center; gap: 18
```

Children:
1. Eyebrow `MANTRA` — `fontSize: 10`, mono, `letterSpacing: 1`, uppercase, muted‑fg, no shrink.
2. 1px × 18px vertical divider in border color.
3. The mantra text — `flex: 1`, `fontSize: 16`, `lineHeight: 1.45`, `fontStyle: italic`, `letterSpacing: -0.1`, foreground color.
4. Trailing label — `fontSize: 11`, mono, muted‑fg, no shrink: `pinned · all contexts` (or `pinned · {contextName}` if you scope it per‑context).

**Data:** Use the existing `mantra` widget data model. For Mission Control, surface the mantra from the user's "global" / "Today" context, OR show the mantra from the context with the most loaded day. Simplest first cut: surface the most recent non‑empty mantra; if none, hide the strip entirely.

### 4. PinnedStrip

`display: flex; gap: 8`, three equal flex children.

Each card:
- `flex: 1`, `padding: 11px 14px`, `background: hsl(var(--card))`, `border: 0.5px solid hsl(var(--border))`, `border-radius: 10`, `min-width: 0`.
- Inner row: 26×26 rounded‑6 glyph tile + title/sub stack.
- Glyph tile: `background: colorTint(ctx.color, 0.12)`, `border: 0.5px solid colorTint(ctx.color, 0.25)`, `color: ctx.color`, monospace 13px glyph. Map by item type:
  - Note → `⌘` (or a Lucide `StickyNote` 13px stroke 1.75)
  - Date → `◷` (or `Calendar`)
  - Link → `↗` (or `ExternalLink`)
- Title: `fontSize: 13`, `fontWeight: 500`, single‑line ellipsis.
- Subtitle: `fontSize: 11`, muted‑fg — format `${typeLabel} · ${contextName}`.

Show up to 3 pinned items; if more, add a `+N more` chip at the end.

The eyebrow row above the strip:
- Section label `PINNED` (the standard `SectionLabel` already used)
- Right‑aligned mono hint: `⌘P to focus` (optional — only render if you bind a keyboard shortcut; otherwise omit).

### 5. NowColumn

Card on the left of the two‑column row.

```
background:    hsl(var(--card))
border:        0.5px solid hsl(var(--border))
border-radius: 14
box-shadow:    0 1px 2px rgba(0,0,0,0.4), 0 0 0 0.5px rgba(255,255,255,0.04)
```

Header row (`padding: 14px 18px`, bottom 0.5px border):
- `Now` — 15/600, letter‑spacing −0.2.
- `What needs your attention right now` — 12, muted‑fg.
- Right: item count `${total} items`, 11, mono, muted‑fg.

Body has up to two groups, each only rendered if non‑empty:

**Overdue group:**
- Group header: 4×4 red dot + `OVERDUE` label (11, uppercase, 0.8 letter‑spacing, `#d95f5f`, weight 500). `padding: 14px 18px 6px`.
- Rows: `display: flex; align-items: center; gap: 12; padding: 9px 0`. First row borderless; subsequent rows `border-top: 0.5px solid hsl(var(--muted))`.
- Row contents: `TodoCheckbox` (size 14, ctx.color) → title (`fontSize: 14`, flex 1) → priority badge → context chip (6px dot + name, mono‑ish, 11px muted‑fg, min‑width 96).

**Due‑today group:**
- Same shape, amber dot + `DUE TODAY` label color `#d4883a`.
- Rows: `align-items: flex-start; gap: 12; padding: 10px 0`. Title block can wrap to a 12px muted‑fg subtitle for context.
- Group separator from Overdue: `border-top: 0.5px solid hsl(var(--muted))`.

**Data source:** identical to the current `dailyTodos` derivation in `page.tsx`:

```ts
activeTodos
  .filter(t => (t.dueDate != null && t.dueDate <= today) || t.priority === 'high')
```

Then bucket by `dueDate < today` (overdue) vs `dueDate === today || (no due + priority high)` (today). Apply existing sort: priority order high→med→low within each bucket.

Mark‑done flow stays exactly as `TodayFocus.tsx` already implements (optimistic remove + PATCH `/api/todos/:id` + `router.refresh()`).

### 6. WeekTimeline ("Ahead")

Card on the right of the two‑column row, same outer chrome as NowColumn.

Header row: `Ahead` + `Next 14 days, across contexts` + right‑aligned item count.

Body: list of grouped rows, one per day that has events.

```
grid-template-columns: 92px 1fr
padding: 10px 18px
border-top: 0.5px solid hsl(var(--muted))   /* skipped on first */
```

Left column: day label — mono 12, muted‑fg. Format `${weekdayShort} ${day}` for current month; once month changes, prefix month, e.g. `Sat  1 Jun`. The double‑space alignment keeps day numbers in the same column.

Right column: items stack with `gap: 6`. Each item is a row:
- Leading glyph: if `kind === 'todo'`, render the 13px `TodoCheckbox` tinted by ctx.color. If `kind === 'date'`, render a 13×13 rounded‑3 tinted square: `background: colorTint(ctx.color, 0.18)`, `border: 0.5px solid colorTint(ctx.color, 0.35)`.
- Title (`fontSize: 13`, `lineHeight: 1.3`).
- Optional subtitle (`fontSize: 11`, muted‑fg, `marginTop: 1`).
- Priority badge if todo.
- Context dot (6px) at the trailing edge.

**Data:** Pull todos with `dueDate` within today → today+14, and dates within the same range. Sort by date asc, group by day. Cap at 14 rows (paginate or "+N more" link if exceeded).

### 7. MicroPulse

`display: grid; gridTemplateColumns: repeat(3, 1fr); gap: 8` for ≥3 micros; auto‑fill `minmax(280px, 1fr)` on smaller widths.

Each card:
- `padding: 12px 14px`, `background: hsl(var(--card))`, `border: 0.5px solid hsl(var(--border))`, `border-radius: 12`, `display: flex; align-items: center; gap: 14`.
- Left content (`flex: 1`):
  - Row 1: 7px ctx.color dot + name (13/500) + trailing `μ · peek` (10, mono, muted‑fg, `margin-left: auto`). Clicking `peek` opens the existing `MicroContextModal`.
  - Row 2: `→ ${topTodoTitle}` — `fontSize: 13`, foreground, single‑line ellipsis.
  - Row 3 (optional meta): `fontSize: 11`, muted‑fg. E.g. `4‑day streak`, `15 min avg / day`, `2 todos · 1 link`.
- Right sparkline (`flex-shrink: 0`, `height: 26`, `display: flex; align-items: flex-end; gap: 2`):
  - 7 bars × 4px wide, `borderRadius: 1.5`, `background: ctx.color`, `opacity: 0.45 + value*0.5`.
  - Values: last 7 days of activity (e.g. completed todos that day, or habit log count). Normalize 0..1, floor min height at 12% so empty days still show.

Section label above: `MICRO PULSE`, right hint `${micros.length} micros · ticking along`.

---

## Data flow (server component)

Update `app/(app)/page.tsx` to compute:

```ts
const overdueTodos      // dueDate < today
const dueTodayTodos     // dueDate === today
const highPriBacklog    // priority === 'high' && not overdue && not today
const upcoming7d        // dates+todos in [today, today+7]
const upcoming14d       // dates+todos in [today, today+14], grouped by day
const weekItems         // dates+todos in [weekStart, weekEnd], grouped by day
const pinnedItems       // pinned todos + dates (existing logic)
const microsPulse       // for each micro: top todo + 7d activity series
const mantra            // most recent non-empty mantra widget value
```

All scoped to `user_id`. The current page already does most of this; extend the queries instead of replacing them.

---

## Responsive notes

- `< 768px` (already covered by `page-pad` + media queries in `globals.css`):
  - BriefingHero collapses to a single column — week strip drops below the heading.
  - Two‑column body becomes single column: NowColumn then WeekTimeline.
  - MicroPulse stacks vertically (`gridTemplateColumns: 1fr`).
  - PinnedStrip becomes horizontal scroll (`overflow-x: auto`, hide scrollbar), each card `min-width: 240px`.
- Mantra strip: keep on one row but allow text to wrap; reduce `fontSize` to 14 below 480px.

---

## Interactions

- Todo checkboxes: same optimistic complete + PATCH as current `TodayFocus`.
- Week strip cells: clicking a cell with items opens a lightweight day‑popover (deferred — out of scope unless requested).
- Pinned cards: click navigates to the item's context dashboard with the item scrolled into view (use existing pin → context navigation pattern; if not present, just navigate to `/ctx/${contextId}`).
- Micro pulse `μ · peek`: opens existing `MicroContextModal` for that context.

No new animations needed. Existing 100ms hover transitions from `.nav-item` are sufficient.

---

## Acceptance checklist

- [ ] All colors come from CSS custom properties via `hsl(var(--*))`; only status accents (`#d95f5f`, `#d4883a`, `#2ec27e`, `rgba(77,154,255,0.55)`) are hardcoded.
- [ ] No Tailwind utility classes for colors/layout (matches existing CLAUDE.md rule).
- [ ] Mantra strip hides itself when no mantra is set.
- [ ] BriefingHero summary clauses skip zeroes; falls back to "All clear for today." when everything is zero.
- [ ] NowColumn and WeekTimeline groups only render when they have items.
- [ ] Mark‑done still optimistically updates and refreshes router data.
- [ ] Mobile (`< 768px`) collapses cleanly per "Responsive notes".
- [ ] No new client components introduced where a server component would suffice.
- [ ] Existing Topbar and global layout untouched.

---

## Files in this bundle

- `Mission Control.html` — open in any browser; click into the **B — Briefing** artboard.
- `mc-variant-b.jsx` — JSX source for all components above. Read this alongside the spec.
- `design-canvas.jsx` — canvas chrome only; ignore.
