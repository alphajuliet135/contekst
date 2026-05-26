# Handoff: Macro Dashboard redesign — "Context briefing" (final)

## Overview

A redesign of the **Macro dashboard** page in the Contekst codebase — the per-context view at `app/(app)/ctx/[id]/page.tsx`. Replaces the current widget-grid layout with a structured **Context briefing**: hero with at-a-glance summary, mantra and stats, Priorities + Ahead split, a two-pane Notes widget, and a compact Reference strip for Habits/Links/People.

Generalizes across all macro contexts (Work, Pilot license, Friends, etc) — colors and copy come from each context's data. Verified against two very different example contexts (Pilot license + Work) and three viewports (desktop, iPad portrait, iPhone).

---

## About the design files

- **`mc-macro-final.jsx`** — **THE source of truth.** A single self-contained JSX file that renders the refined dashboard at all three sizes, parameterized by a `ctx` object. Read this end-to-end before implementing.
- **`Mission Control.html`** — open in a browser; scroll to the section **"Macro dashboard — refined"** for the 5 final artboards. The other sections (Mission Control, Notes widget explorations, earlier macro drafts) are kept for context but are NOT what you're implementing.
- **`design-canvas.jsx`**, **`ios-frame.jsx`** — canvas/frame chrome only; ignore for implementation.
- Other `mc-*.jsx` files in the bundle — earlier explorations kept for reference. Ignore unless a later question references them.

The HTML is a **design reference**, not production code. Recreate using Contekst conventions from `CLAUDE.md`:

- Next.js 16 App Router, server components by default
- `"use client"` only where interactivity requires it
- Inline styles with `hsl(var(--*))` CSS custom properties from `globals.css`
- Lucide icons (replace the inline SVGs in the prototype)
- All data scoped to `user_id`

## Fidelity

**High-fidelity.** Match the prototype 1:1 — sizes, spacing, padding, colors. The prototype hardcodes hex values because it runs standalone; **read tokens from `globals.css`** instead.

---

## Where it lives

- **Page:** `app/(app)/ctx/[id]/page.tsx` — replace the existing return tree (or extract data-fetching to a server component and pass to a new client component)
- **Components to remove:** `ContextHeader.tsx` (replaced by `BriefingHero`), `WidgetDashboard.tsx` (replaced by the new structured layout)
- **New components** (suggested):
  - `components/macro/BriefingHero.tsx` — client (needs the activity heatmap; topbar actions)
  - `components/macro/PrioritiesWidget.tsx` — client (list tabs + todo interactions)
  - `components/macro/AheadWidget.tsx` — server-renderable
  - `components/macro/NotesWidget.tsx` — client (two-pane state)
  - `components/macro/ReferenceStrip.tsx` — server-renderable
  - `components/ui/CountPill.tsx` — shared counter pill (see below)
- **Existing pieces to reuse or refactor:**
  - `TodoCheckbox` from `components/ui/TodoCheckbox.tsx`
  - `colorTint`, `formatDate` from `lib/utils.ts`
  - Priority badge styles already in `app/(app)/page.tsx` (`BADGE_STYLES`) — extract into `components/ui/PriorityBadge.tsx`
  - The data fetching in current `ctx/[id]/page.tsx` — extend, don't rewrite

---

## Page layout (top → bottom)

```
┌─────────────────────────── Topbar (unchanged) ───────────────────────────┐

  ┌──────────────────────── BriefingHero ────────────────────────────────┐
  │                                                                       │
  │  Left col (1.5fr)                       │  Right col (1fr)            │
  │  ───────────────────                    │  ───────────────────        │
  │  • {Context name} · MACRO              │  ACTIVITY            4w     │
  │  H1: {Context name}                    │  [14 cols × 2 rows]         │
  │                                        │  4w ago      this week     │
  │  Summary paragraph (counts colored)    │                             │
  │                                        │  [Edit context] [Move to    │
  │  ║ Mantra (italic, colored bar)        │   Micro] [⋯ more]           │
  │  ║ MANTRA · PINNED                     │                             │
  │                                        │                             │
  │  3 N  open  │  N  upcoming  │  ...     │                             │
  │                                                                       │
  └───────────────────────────────────────────────────────────────────────┘

  ┌─── Priorities (1.1fr) ──────┐ ┌─── Ahead (1fr) ────────────────────┐
  │  Priorities  [N]   + Add    │ │  Ahead [N]  Next 30 days   + Add   │
  │  [Roadmap 2] [1:1s 1] ...   │ │  Mon 20  • Team standup            │
  │  □ Overdue thing  [HIGH]    │ │  Tue 21  • 1:1 with Lisa           │
  │  □ Q2 review deck [HIGH]    │ │  Sat 24  ▣ Team offsite  (h-light) │
  │  □ Team sync prep [MED]     │ │  Wed 28  ▣ Quarterly review        │
  └─────────────────────────────┘ └────────────────────────────────────┘

  ┌─── Notes (full width, two-pane, height 320) ─────────────────────────┐
  │  Notes [N]  Search  + New note                                       │
  │  ┌────232px───┐ ┌──────────content──────────────────────────────┐    │
  │  │ • Pinned   │ │  Q3 OKR draft         [PINNED]   edited 30m   │    │
  │  │ • Hiring   │ │                                               │    │
  │  │ • Cust int │ │  Lead with customer outcomes, not features… │    │
  │  │ • Q2 rev   │ │                                               │    │
  │  │ ...        │ │                                               │    │
  │  └────────────┘ └───────────────────────────────────────────────┘    │
  └──────────────────────────────────────────────────────────────────────┘

  ┌── Habits ──┐  ┌── Links ──┐  ┌── People ──┐
  │ • Habit 1  │  │ • Link 1  │  │ • Person 1 │      ← Reference strip
  │ • Habit 2  │  │ • Link 2  │  │ • Person 2 │
  │ + 1 more   │  │ + 6 more  │  │ + 4 more   │
  └────────────┘  └───────────┘  └────────────┘
```

Page padding: `padding: 26px 40px 40px` (desktop). Section gap: 16px.

---

## Design tokens

| Token              | CSS variable                   | Used for                       |
|--------------------|--------------------------------|--------------------------------|
| background         | `hsl(var(--background))`       | Page bg                        |
| foreground         | `hsl(var(--foreground))`       | Primary text                   |
| muted              | `hsl(var(--muted))`            | Soft dividers, tab counts dim  |
| muted-foreground   | `hsl(var(--muted-foreground))` | Section labels, meta text      |
| border             | `hsl(var(--border))`           | Card borders, dividers         |
| card               | `hsl(var(--card))`             | All card surfaces              |

**Context color** = `contexts.color` from the user's data (per-row hex). Used everywhere the dashboard accents itself — see `colorTint(ctx.color, opacity)` for fills.

**Status accents (hardcoded):**
- Overdue: `#d95f5f`
- Due-today / high pri: `#d4883a`
- OK / streak: `#2ec27e`

Priority badges: reuse `BADGE_STYLES` from `app/(app)/page.tsx`. Lift into `components/ui/PriorityBadge.tsx`.

---

## Shared component: `CountPill`

Used in many places for consistency. Spec:

```tsx
type Props = { count: number; color: string; dim?: boolean };

function CountPill({ count, color, dim }: Props) {
  if (count === undefined || count === null) return null;
  return (
    <span style={{
      fontSize: 10, fontFamily: 'var(--font-mono)', fontWeight: 500,
      padding: '1px 6px', borderRadius: 4, lineHeight: 1.4,
      background: dim ? 'hsl(var(--muted))' : colorTint(color, 0.14),
      border: dim
        ? '0.5px solid hsl(var(--border))'
        : `0.5px solid ${colorTint(color, 0.25)}`,
      color: dim ? 'hsl(var(--muted-foreground))' : color,
    }}>{count}</span>
  );
}
```

Used by: Priorities header, Ahead header, Notes header, Reference strip cards, list-tab counts (with `dim={!active}`).

---

## Component specs

### 1. BriefingHero

CSS grid `1.5fr 1fr`, `gap: 28`, `align-items: start`, `padding: 28px 40px 24px`, `background: colorTint(ctx.color, 0.07)`, `border-bottom: 0.5px solid colorTint(ctx.color, 0.22)`.

**Left column:**

- Eyebrow row: 8px context-color dot + mono uppercase `${ctx.name} · MACRO` (11px, letter-spacing 1, context color).
- Title: H1, `font-size: 30`, `font-weight: 600`, `letter-spacing: -0.5`, `line-height: 1.15`.
- Summary paragraph: 14px / `line-height: 1.55`, muted-foreground color, `max-width: 560`, `margin: 10px 0 0`. Render inline-colored counts: overdue → `#d95f5f`, due-today → `#d4883a`, streak/positive → ctx color. Format the paragraph with `<strong>`-equivalent spans for each count clause. Skip clauses whose count is 0. Fallback: "All clear today."
- **Mantra block** — italic, 15px, foreground color, 3px-wide context-color left bar (opacity 0.6, border-radius 1.5), `padding-left: 12`, `align-items: flex-start`. Below the mantra text: small mono uppercase `MANTRA · PINNED` eyebrow (10px, letter-spacing 0.8, muted-foreground). `margin: 16px 0 18px`.
  - Hide entirely when no mantra is set for this context.
- Stats row: flex with `gap: 20`, items aligned to baseline. Each stat is `{value}` (20/600/mono, ctx color or fg) + `{label}` (11/muted-fg). 1px-wide × 16px-tall dividers between them. Pre-computed stats:
  - **High open** — count of high-priority todos with `completed=false`.
  - **Upcoming** — count of todos+dates with date in the next 30 days.
  - **Day streak** — current streak on the top habit (longest current). Colored with ctx color.
  - **Next event** — relative time to the next date (`3d`, `2w`, `1m`). Colored `#d4883a` if ≤7d, else fg.

**Right column:**

- Activity heatmap — `Activity` label + `4w` mono caption. Grid: `gridTemplateColumns: repeat(14, 1fr)` × `gridTemplateRows: repeat(2, 1fr)`, `gap: 3`, cells are `aspect-ratio: 1`, `border-radius: 2.5`.
  - Each cell = one day of the last 28 days, oldest top-left to most-recent bottom-right.
  - Cell `v = activityCount(day)`. Background: ctx color if `v > 0`, else `hsl(var(--muted))`. Opacity 0.55 normally, 1.0 for today (also gets a 0.5px ctx-color border).
  - Activity = `count(todos.completedAt on day) + count(habit ticks on day)` — same data as Mission Control's pulse but scoped to this context.
- Below the heatmap: `4w ago` / `this week` mini caption (10px mono, muted-fg).
- Below: action row, right-aligned, `gap: 6`, `margin-top: 14`:
  - **Edit context** — primary-ish button: `padding: 5px 10px`, `border-radius: 7`, `border: 0.5px solid colorTint(ctx.color, 0.3)`, `background: colorTint(ctx.color, 0.08)`, fg-colored text, 12px. Includes a 11px pencil icon.
  - **Move to Micro** — secondary button, same chrome dimensions but `border: 0.5px solid var(--border)`, transparent background, muted-fg text.
  - **More (⋯)** — square 28×28, same chrome as Move-to-Micro, with horizontal triple dot.
  - Wire to existing edit modal (rename, description, color, icon, delete). The kebab opens a dropdown with: Edit, Duplicate, Archive, Delete.

### 2. PrioritiesWidget

Card: `background: hsl(var(--card))`, `border: 0.5px solid hsl(var(--border))`, `border-radius: 12`, standard shadow.

**Header row** `padding: 14px 18px 0`:
- Left: H2 `Priorities` (14/600) + `<CountPill count={openCount} color={ctx.color} />`
- Right: ctx-colored `+ Add` link (12px).

**List tabs** `padding: 10px 18px 0`, flex with `gap: 4`, horizontal scroll:
- Each tab: `padding: 3px 9px`, `border-radius: 5`, 12px text.
- Active: `background: colorTint(ctx.color, 0.16)`, ctx color, weight 500.
- Inactive: transparent, muted-fg.
- After name: `<CountPill count={l.count} color={ctx.color} dim={!l.active} />` when `count > 0`.

**Body** — `margin-top: 10px`, `border-top: 0.5px solid hsl(var(--muted))`:
- Rows: `display: flex; align-items: flex-start; gap: 10; padding: 12px 18px`. Each non-first row: `border-top: 0.5px solid hsl(var(--muted))`.
- Overdue rows: `border-left: 2px solid #d95f5f`, `padding-left: 16` (instead of 18).
- Row content: `TodoCheckbox` (size 14, ctx.color) → title (13px, line-height 1.3) + sub (11px muted-fg, red if overdue) → `PriorityBadge`.

**Data:** active todos filtered by `contextId === ctx.id`, sorted by `[priority high→med→low, dueDate asc, createdAt desc]`. Top 3 shown by default (paginate or "Show more" if >6).

Mark-done flow same as `TodayFocus` — optimistic remove + PATCH `/api/todos/:id` + `router.refresh()`.

### 3. AheadWidget

Card chrome identical to Priorities.

**Header** `padding: 14px 18px`, `border-bottom: 0.5px solid hsl(var(--border))`:
- H2 `Ahead` + `<CountPill>` + (desktop only) `Next 30 days` muted caption.
- Right: ctx-colored `+ Add`.

**Body rows** — grid `gridTemplateColumns: '102px 1fr'`, `padding: 11px 18px`. First row no top border; subsequent rows `border-top: 0.5px solid hsl(var(--muted))`. Highlighted row: `background: colorTint(ctx.color, 0.05)`.

- Date column: mono 12px, muted-fg (or ctx color if `highlight: true`, weight 500). Format `${weekdayShort} ${day}` for same month; once month changes, prefix month with double-space alignment: `Sat  1 Jun`.
- Right column: leading glyph (todo = ctx-colored circle outline; date = ctx-tinted square 13×13, `border-radius: 3`) → title (13px) + optional sub (11px muted-fg, `margin-top: 1`) → optional `PriorityBadge`.

**Data:** union of (todos with `dueDate` in [today, today+30]) and (dates with `start` in same range) where `contextId === ctx.id`. Sort by date asc. Group by day. The single most important upcoming item (next 14d, highest priority OR `important: true`) gets `highlight: true`.

### 4. NotesWidget (two-pane)

**Master-detail desktop pattern.** Tablet uses narrower rail; phone uses inline-expanded pattern (different markup — see §6).

Card with `display: flex; flex-direction: column`, `height: 320` (desktop) / `300` (tablet).

**Header** — same row as other widgets, plus a `Search` chip:
- Icon (Lucide `FileText`, ctx-colored 14px) + label `Notes` (13/500) + `<CountPill count={notes.length} color={ctx.color} />`
- Then a search affordance: `padding: 3px 9px`, `border-radius: 5`, `background: hsl(var(--muted))`, mono 11px, muted-fg, with a tiny search icon. Click → opens existing search UI or focuses an input.
- Right: ctx-colored `+ New note`.

**Body** — flex row, `flex: 1; min-height: 0`:

**Rail** (left):
- Width 232 (desktop) / 200 (tablet), `flex-shrink: 0`, `border-right: 0.5px solid hsl(var(--border))`, `overflow-y: auto`, subtle tint `background: rgba(255,255,255,0.015)`.
- Each item: `padding: 9px 12px`, `border-top: 0.5px solid hsl(var(--muted))` (skipped first).
- Active: `background: colorTint(ctx.color, 0.12)`, `border-left: 2px solid ctx.color`.
- Inactive: transparent left border.
- Item content:
  - Row 1: optional pin (8px ctx-color star SVG) + title (13/active?600:500, fg, italic if untitled, truncate). 
  - Row 2: first line of content (11px muted-fg, truncate).
  - Row 3: updated relative time (10px mono muted-fg, `margin-top: 3`).

**Content pane** (right):
- `flex: 1; overflow-y: auto; padding: 14px 18px`.
- Title row: H3 (16/600/letter-spacing -0.1) + optional `PINNED` chip (10px mono ctx-color, padding 1px 6px, border-radius 3, ctx-tinted bg + border) + `edited ${updated}` (11px mono muted-fg, `margin-left: auto`).
- Content: `font-size: 14; line-height: 1.65; white-space: pre-wrap`, foreground color.

**State (client component):**
- `activeId` — defaults to first pinned note, else first note by `updatedAt desc`. Persist to localStorage per-context: `notes-active-${ctx.id}`.
- Rail click sets `activeId`.

**Data:** all notes for `contextId === ctx.id`, sorted by `[pinned desc, updatedAt desc]`.

Edit flow stays as in existing `NotesWidget.tsx`. The current single-note widget becomes the **content pane** of the new two-pane — much of the editing code (autosave, debouncing, etc) carries over.

### 5. ReferenceStrip

Grid: `display: grid; gridTemplateColumns: repeat(3, 1fr); gap: 10` (desktop/tablet), `1fr` on phone.

Each of the 3 sub-cards (Habits / Links / People):

- `background: hsl(var(--card))`, `border: 0.5px solid hsl(var(--border))`, `border-radius: 10`.
- Header `padding: 9px 12px`, `border-bottom: 0.5px solid hsl(var(--border))`, flex row:
  - 12px ctx-colored Lucide icon + 12/500 title + `<CountPill count={items.length + moreCount} color={ctx.color} dim />` + right-aligned ctx-colored `+`.
- Up to **2 items** shown. Each row `padding: 8px 12px`, `gap: 9`:
  - **Habit:** small 4×14 ctx-color rounded bar (opacity 0.7) glyph + name (12px) + `{streak}d streak` sub (10px muted-fg).
  - **Link:** 16×16 ctx-tinted rounded square with `↗` glyph + title + `{host}` mono sub.
  - **Person:** 22×22 ctx-tinted circle with initials + name (12/500) + role sub (10px muted-fg).
- Footer (if any remaining): `padding: 7px 12px`, `border-top: 0.5px solid hsl(var(--muted))`, 11px muted-fg, center-aligned: `+ N more`.

Clicking any item navigates to its full view (existing routes). The header `+` opens a quick-add modal scoped to that widget type.

### 6. NotesWidget — phone (master-detail collapsed to inline)

On `< 768px` the two-pane doesn't fit. **Replace it with this inline-expanded pattern:**

- Standard widget header (icon + Notes + count pill + ctx-colored `+ New`).
- **Pinned note expanded inline as the first row:**
  - `padding: 14px 14px 14px 12px`, `background: colorTint(ctx.color, 0.06)`, `border-left: 2px solid ctx.color`.
  - Title row: pin glyph + H3 (16/600, fg) + updated time (11px mono muted-fg, right-aligned).
  - Body: `font-size: 13; line-height: 1.6; white-space: pre-wrap`, clamped to 6 lines (`display: -webkit-box; -webkit-line-clamp: 6; -webkit-box-orient: vertical; overflow: hidden`).
  - "Open note →" link (12px ctx-color, no border, weight not bold).
- **Up to 3 other notes** as compact rows: `padding: 11px 14px`, `border-top: 0.5px solid hsl(var(--muted))`, title (14/500) + first-line preview (12px muted-fg) + updated time (11px mono) + chevron (11px).
- Footer `padding: 12px 14px`, ctx-colored, weight 500, centered: `See all N notes`.

Tap "Open note" or a title row → navigate to a full-screen Notes detail view. The full Notes inventory (search, all 8+ notes, two-pane) lives behind "See all N notes" as a stacked screen.

---

## Responsive

- `≥ 1024px` — full desktop as drawn above.
- `768px–1023px` — tablet:
  - Hero: same 2-col grid; padding reduced to `26px 28px 22px`.
  - Notes rail: 200px instead of 232px; height 300 instead of 320.
  - Page padding: `24px 28px 32px`.
- `< 768px` — phone:
  - Hero: stacks to a single column. Stats wrap to 2-col with 14px gap. Edit/Move buttons hide (use the topbar overflow menu instead — phone topbar has `⋮` for that).
  - Hero padding: `24px 18px 22px`.
  - Page padding: `20px 14px 28px`, section gap 14.
  - Topbar: compact "context dropdown" pill (active context as a button with chevron) + a `+` shortcut, no full tab strip.
  - Priorities + Ahead stack vertically.
  - Notes switches to the inline-expanded phone pattern.
  - Reference strip becomes `1fr` (vertical stack).
  - Bumped touch sizes: checkbox 15px, row padding 12px.

Phone topbar overflow menu (`⋮`) handles: Edit context, Move to Micro, Settings, Switch context.

---

## Data flow

In `ctx/[id]/page.tsx`:

```ts
const ctx = await db.contexts.findUnique({ where: { id, userId } });
const todos = await db.todos.findMany({ where: { contextId: id, userId } });
const dates = await db.dates.findMany({ where: { contextId: id, userId } });
const notes = await db.notes.findMany({ where: { contextId: id, userId }, orderBy: [{ pinned: 'desc' }, { updatedAt: 'desc' }] });
const habits = await db.habits.findMany({ where: { contextId: id, userId } });
const links = await db.links.findMany({ where: { contextId: id, userId }, orderBy: { createdAt: 'desc' } });
const people = await db.people.findMany({ where: { contextId: id, userId } });
const mantra = ctx.mantra; // assumed field; if mantra is a separate widget, query it

const stats = computeMacroStats({ todos, dates, habits, today: new Date() });
// stats: { overdue, dueToday, highOpen, upcoming, dayStreak, nextEventRel, summary }
// summary: pre-rendered paragraph clauses array (matches `ctx.paragraph` in prototype)

const activity28 = computeContextActivity({ todos, habits, days: 28 });
// activity28: number[28], counts per day (oldest first)
```

Top habit for "day streak" = `habits[].sort by currentStreak desc`[0]. If no habits, omit the streak stat.

---

## Acceptance checklist

- [ ] Replaces `ContextHeader` + `WidgetDashboard` on `app/(app)/ctx/[id]/page.tsx`
- [ ] All colors via `hsl(var(--*))` except status accents (`#d95f5f`, `#d4883a`, `#2ec27e`) and context color (per row)
- [ ] No Tailwind utility classes for colors/layout (matches existing CLAUDE.md rule)
- [ ] `CountPill` extracted as a shared component and used everywhere counters appear
- [ ] Mantra block hidden when no mantra is set
- [ ] Summary paragraph clauses skip zeroes; "All clear today." fallback works
- [ ] Activity heatmap reflects real data; today highlighted with full opacity + border
- [ ] Edit context button opens the existing context edit modal
- [ ] Move to Micro button calls the existing macro→micro conversion endpoint
- [ ] Notes two-pane: `activeId` persists per-context via localStorage; defaults to top-pinned or newest
- [ ] Notes phone variant shows inline-expanded pinned note + 3 title rows + "See all"
- [ ] Mark-done on todos still optimistically updates + refreshes router data
- [ ] Reference strip: each `+` opens its widget-type's existing quick-add modal
- [ ] Reference strip: clicking an item navigates to that item's detail (existing routes)
- [ ] Mobile breakpoints behave per "Responsive notes"
- [ ] Existing Topbar + global layout untouched

---

## Files in this bundle

- **`mc-macro-final.jsx`** — source of truth; read this end-to-end.
- **`Mission Control.html`** — open in a browser; the **"Macro dashboard — refined"** section has the 5 final artboards (desktop Pilot, desktop Work, iPad Pilot, iPhone Pilot, iPhone Work). Other sections are kept for reference but are not what you're implementing.
- All other `mc-*.jsx` files — earlier explorations; ignore unless referenced.
- `design-canvas.jsx`, `ios-frame.jsx` — canvas/frame chrome only; ignore.
