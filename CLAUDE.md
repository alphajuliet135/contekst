# Contekst

> A self-hosted life-organisation app. Reduces cognitive overload by giving each area of your life its own dedicated space.

---

## Instructions for Claude Code

- Always refer to this file before making architectural decisions
- Keep the codebase simple — if a feature adds complexity without clear user value, push back
- Follow the design language exactly — do not introduce new patterns without discussion
- All data must be scoped to `user_id` — never return data across users
- Prefer server components; only use `"use client"` when interactivity requires it
- When adding a new widget, follow the existing widget pattern in `components/widgets/`
- All styling uses inline styles with CSS custom properties (`hsl(var(--*))`). Do not introduce Tailwind utility classes for colours or layout — keep the pattern consistent

---

## Concept

Contexts vary in cognitive footprint — some demand active attention (Macro), others tick along in the background (Micro). The app gives each context its own space without cluttering the head further.

---

## Structure

### Views
1. **Mission Control** — default home, smart overview across all contexts
2. **Macro dashboards** — one full page per Macro context, switchable via top bar
3. **Micro hub** — single page with compact cards for all Micro contexts

### Context types

| Type | Description | UI treatment |
|------|-------------|--------------|
| Macro | High cognitive footprint, needs active attention | Full dashboard |
| Micro | Low footprint, ticks along in background | Compact card on Micro hub |

Micros can be promoted to Macro (and demoted back) at any time.

---

## Mission Control

- Smart by default — auto-surfaces urgent/overdue todos and upcoming dates per Macro context
- Aggregated **Upcoming** card showing the next 30 days of dates across all contexts
- Manual pinning — user can pin specific items to always appear
- Right sidebar summarises Micro contexts with their top priority item
- Goal: one glance tells you what needs attention today

---

## Widgets

All contexts share the same widget set. Each context independently controls which widgets are visible via a sticky toggle bar at the bottom of the dashboard.

| Widget (display name) | Internal type | Description |
|-----------------------|---------------|-------------|
| Priorities | `todos` | Task list with priority levels (high / medium / low); badge pills for status |
| Upcoming dates | `dates` | Important upcoming dates with coloured date boxes |
| Notes | `notes` | Freeform text area |
| Habits | `habits` | Recurring daily/weekly check-ins |
| Links | `links` | Saved URLs relevant to the context |
| People | `people` | Contacts associated with the context |

Micro cards show a condensed version — top priority todo and next upcoming date.

---

## Design Language

### Aesthetic

Dark, minimal, confident. Near-black backgrounds with context-colour accents. Rounded corners, generous whitespace, no clutter.

### Colour palette (CSS custom properties in `app/globals.css`)

| Token | Value | Role |
|-------|-------|------|
| `--background` | `0 0% 9%` (#171717) | Page background |
| `--foreground` | `0 0% 93%` (#EDEDED) | Primary text |
| `--muted` | `0 0% 15%` (#262626) | Hover surfaces |
| `--muted-foreground` | `0 0% 56%` (#8F8F8F) | Secondary text |
| `--border` | `0 0% 20%` (#333333) | Dividers, card borders |
| `--card` | `0 0% 12%` (#1F1F1F) | Widget cards, topbar |

### Context colour theming
- Each context has one accent colour (user-chosen hex, stored in `contexts.color`)
- On a Macro dashboard that colour tints: header background (`colorTint(color, 0.12)`), active tab pill (`colorTint(color, 0.25)`), date boxes, widget icon accents, header subtitle text
- Priority badge pills: High = amber, Med = gray, Done = context-blue

### Typography
- System sans-serif (`-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif`)
- Weights: 400 regular, 500 medium, 600 semibold (headings only)
- Sentence case everywhere, no ALL CAPS except section labels

### Top bar
- Left: logo → Macro context tabs (coloured dot + name, active = `colorTint(color, 0.25)` pill) → separator → Micro shortcut (LayoutGrid icon)
- Right: add context, settings
- Active Mission Control tab: `hsl(var(--muted))` pill

### Macro dashboard
- Header: context dot + name (24px/600), subtitle in context colour ("Macro context · N open todos · Next event in X days"), Move to Micro button
- 2-column widget grid; Notes widget is full-width
- Sticky widget toggle bar at bottom with icons in active pills

### Micro hub
- Grid of compact cards (`minmax(280px, 1fr)`)
- Each card: context name + dot, top priority todo (→ prefix), next upcoming date, Promote button

### Mission Control
- Greeting (28px/600) + date right-aligned on same row
- "Needs attention" grid — one card per Macro context showing urgent todos with circular checkboxes + priority badges
- Aggregated Upcoming dates card at end of grid
- Pinned row below (grid layout, icon + type + context label)
- Right sidebar (248px): Micro context cards with → prefixed todo items

---

## V1 Scope

- [x] Auth (login, session)
- [x] Mission Control (smart surfacing + manual pins + aggregated upcoming)
- [x] Macro dashboards with widget grid
- [x] Widget toggle per context
- [x] Micro hub with compact cards
- [x] Promote / demote between Macro ↔ Micro
- [x] Top bar navigation
- [x] Dark mode UI

### Out of scope for V1
- Mobile app
- Multi-user (schema is ready, UI is not)
- Calendar integrations
- AI features beyond smart surfacing
- Adding/editing items from the UI (data entry via seed scripts for now)

---

## Tech Stack

| Layer | Choice | Notes |
|-------|--------|-------|
| Framework | Next.js 15 (App Router) | Server components by default |
| Styling | Tailwind CSS + inline styles | CSS custom properties for all colours; `postcss.config.js` required |
| DB | SQLite via Drizzle ORM | WAL mode enabled; `data/contekst.db` on host |
| Auth | Auth.js v5 | Credentials login for V1; JWT sessions |
| API | Next.js Route Handlers | `app/api/` — contexts, todos, widgets |
| Container | Docker multi-stage, multi-arch (amd64 + arm64) | |
| Registry | GitHub Container Registry (GHCR) | |
| CI/CD | GitHub Actions — trigger on `v*` tag | |
| Mobile (later) | React Native + Expo | Same API, shared types |

---

## Project Structure

```
contekst/
├── app/
│   ├── (auth)/login/         # Login page (server action form)
│   ├── (app)/                # Protected routes (layout fetches contexts + renders Topbar)
│   │   ├── page.tsx          # Mission Control
│   │   ├── micro/page.tsx    # Micro hub
│   │   └── ctx/[id]/page.tsx # Macro dashboard
│   └── api/
│       ├── auth/[...nextauth]/
│       ├── contexts/         # GET list, POST create, PATCH/DELETE [id]
│       ├── todos/            # GET list, POST create, PATCH/DELETE [id]
│       └── widgets/          # PATCH toggle enabled state
├── components/
│   ├── widgets/              # One file per widget type (server components)
│   ├── micro/                # PromoteButton (client)
│   └── layout/               # Topbar (client — needs usePathname)
├── server/
│   └── db/
│       ├── schema.ts         # Drizzle schema — all 11 tables
│       ├── index.ts          # DB connection (WAL mode)
│       └── migrations/       # Auto-generated SQL migrations
├── lib/
│   ├── auth.ts               # Auth.js config + bcrypt verify
│   ├── types.ts              # Shared TypeScript interfaces
│   └── utils.ts              # cn, colorTint, colorBorder, formatDate, isOverdue, isDueSoon
├── types/
│   └── next-auth.d.ts        # Auth.js session type augmentation (adds user.id: string)
├── postcss.config.js         # Required — without this Tailwind does not process globals.css
├── tailwind.config.ts
├── drizzle.config.ts
├── Dockerfile
├── docker-compose.yml
└── .github/workflows/release.yml   # (to be created) multi-arch build on v* tag
```

---

## Data Model

```
users           id, email, password_hash, name, created_at
contexts        id, user_id, name, type (macro|micro), color, icon, order, created_at
widget_configs  id, context_id, widget_type, enabled, settings (JSON)
                  unique(context_id, widget_type)
todos           id, context_id, user_id, title, priority (high|medium|low), due_date, done, pinned, created_at
dates           id, context_id, user_id, title, date, note, pinned, created_at
notes           id, context_id, user_id, content, pinned, updated_at
habits          id, context_id, user_id, title, frequency (daily|weekly), created_at
habit_logs      id, habit_id, date, completed
links           id, context_id, user_id, title, url, created_at
people          id, context_id, user_id, name, note, created_at
```

Everything is scoped to `user_id`. Multi-user support is a UI addition, not a schema change.

---

## Deployment

```bash
# Local dev
cp .env.example .env   # fill in AUTH_SECRET and NEXTAUTH_URL
npm install
npm run db:generate
npm run db:migrate
npm run dev

# Release — triggers GitHub Actions multi-arch build → GHCR
git tag v0.1.0
git push origin v0.1.0
```

---

## Mobile path (later)

Expo app consuming the same REST API. Add a `packages/types` monorepo package when needed to share TypeScript types. No business logic in the client — everything stays server-side.
