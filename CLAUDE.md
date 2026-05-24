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

- **Today** section — flat cross-context list of todos due today, overdue, or high-priority; sortable by Priority / Context / Due date; inline checkbox marks done
- Smart by default — auto-surfaces urgent/overdue todos and upcoming dates per Macro context
- Aggregated **Upcoming** card showing the next 30 days of dates across all contexts
- Manual pinning — user can pin specific items to always appear
- Right sidebar summarises Micro contexts with their top priority item
- Goal: one glance tells you what needs attention today

---

## Widgets

All contexts share the same widget set. Each context independently controls which widgets are visible and their layout via Edit Layout mode.

| Widget (display name) | Internal type | Description |
|-----------------------|---------------|-------------|
| Priorities | `todos` | Task list with priority levels (high / medium / low); inline editing, click-to-open priority picker; optional named sub-lists per context (tab bar) |
| Upcoming dates | `dates` | Important upcoming dates with coloured date boxes |
| Notes | `notes` | Freeform notes with optional titles; inline editing |
| Habits | `habits` | Recurring daily/weekly check-ins |
| Links | `links` | Saved URLs relevant to the context |
| People | `people` | Contacts associated with the context |
| Mantra | `mantra` | Inspirational/motivational text pinned to the context |

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
- Header: context dot + name (24px/600), subtitle in context colour ("Macro/Micro context · N open todos · Next event in X days"), Move to Micro button
- 2-column widget grid; drag-to-reorder and half/full-width resize per widget
- "Edit layout" button (top-right of grid) reveals drag handles, resize toggles, and the widget toggle bar
- Notes and Mantra widgets default to full-width; all others default to half-width

### Micro hub
- Grid of compact cards (`minmax(280px, 1fr)`)
- Each card: context name + dot, top priority todo (→ prefix), next upcoming date, Promote button, peek button (↗)
- Peek button opens the full widget dashboard in a modal without promoting the context

### Mission Control
- Greeting (28px/600) + date right-aligned on same row
- **Today** section — full-width card with sort pills (Priority / Context / Due); todo rows with circular checkbox, title, due label, priority badge, context dot
- "Needs attention" grid — one card per Macro context showing urgent todos with circular checkboxes + priority badges
- Aggregated Upcoming dates card at end of grid
- Pinned row below (grid layout, icon + type + context label)
- Right sidebar (248px): Micro context cards with → prefixed todo items

---

## V1 Scope — Complete

- [x] Auth (login, session)
- [x] First-run signup flow (no seed scripts needed)
- [x] Mission Control (smart surfacing + manual pins + aggregated upcoming + Today section)
- [x] Macro dashboards with widget grid
- [x] Widget drag-to-reorder and resize per context
- [x] Edit layout mode (drag handles, resize, toggle bar gated behind button)
- [x] Widget toggle per context
- [x] Mantra widget
- [x] Micro hub with compact cards
- [x] Micro context peek modal (full widget view without promoting)
- [x] Promote / demote between Macro ↔ Micro
- [x] Top bar navigation
- [x] Dark mode UI
- [x] Inline item creation and editing from UI (todos, notes, habits, links, people)
- [x] Multiple priority lists per context (named tab bar)
- [x] Backup & restore (JSON export/import from Settings)

### Out of scope for V1
- Mobile app
- Multi-user (schema is ready, UI is not)
- Calendar integrations
- AI features beyond smart surfacing

---

## Tech Stack

| Layer | Choice | Notes |
|-------|--------|-------|
| Framework | Next.js 16 (App Router) | Server components by default |
| Styling | Tailwind CSS + inline styles | CSS custom properties for all colours; `postcss.config.js` required |
| DB | SQLite via Drizzle ORM | WAL mode enabled; `data/contekst.db` on host |
| Auth | Auth.js v5 | Credentials login for V1; JWT sessions |
| API | Next.js Route Handlers | `app/api/` — contexts, todos, widgets |
| Container | Docker multi-stage, multi-arch (amd64 + arm64) | |
| Registry | GitHub Container Registry (GHCR) | |
| CI/CD | GitHub Actions — trigger on merge to `main` (reads version from `package.json`, auto-tags) | |
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
│   │   ├── ctx/[id]/page.tsx # Macro dashboard (works for both Macro and Micro contexts)
│   └── micro/page.tsx    # Micro hub
│   └── api/
│       ├── auth/[...nextauth]/
│       ├── auth/signup/      # POST create first admin account
│       ├── contexts/         # GET list, POST create, PATCH/DELETE [id]
│       │   └── [id]/dashboard/ # GET full widget data (for Micro peek modal)
│       ├── todos/            # GET list, POST create, PATCH/DELETE [id]
│       └── widgets/          # PATCH toggle/settings; order/ POST reorder
├── components/
│   ├── widgets/              # One file per widget type + WidgetDashboard (client, @dnd-kit)
│   ├── micro/                # MicroCard, MicroContextModal, PromoteButton (clients)
│   ├── mission-control/      # TodayFocus, Greeting (clients)
│   └── layout/               # Topbar, ContextHeader, SettingsPanel (clients)
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
└── .github/workflows/release.yml   # multi-arch build on merge to main
```

---

## Data Model

```
users           id, email, password_hash, name, created_at
contexts        id, user_id, name, type (macro|micro), color, icon, order, created_at
widget_configs  id, context_id, widget_type, enabled, settings (JSON), order
                  unique(context_id, widget_type)
todos           id, context_id, user_id, title, priority (high|medium|low), due_date, done, pinned, completed_at, created_at
dates           id, context_id, user_id, title, date, note, pinned, created_at
notes           id, context_id, user_id, title, content, pinned, updated_at
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
npm run dev
# Migrations run automatically on startup.
# On first visit, a signup form creates the admin account.

# Release — merge develop → main; CI reads version from package.json,
# creates the tag, and builds the multi-arch Docker image → GHCR.
```

---

## Mobile path (later)

Expo app consuming the same REST API. Add a `packages/types` monorepo package when needed to share TypeScript types. No business logic in the client — everything stays server-side.

---

## Documentation (.docs)

Planning and design artefacts live in `.docs/`:

| Folder | Purpose |
|--------|---------|
| `concept_views/` | UI design screenshots and mockups |
| `concept_plans/` | Written concept/planning documents |

### Concept plan naming convention

Files in `concept_plans/` follow this pattern:

```
YYYY-MM-DD-short-kebab-title.md
```

Example: `2026-05-24-app-stability-refactor.md`

Each file should open with a one-line summary, then cover:
- **What** — what is being changed or built
- **Why** — the motivation or problem it solves
- **How** — rough approach, open questions, constraints

---

<!-- rtk-instructions v2 -->
# RTK (Rust Token Killer) - Token-Optimized Commands

## Golden Rule

**Always prefix commands with `rtk`**. If RTK has a dedicated filter, it uses it. If not, it passes through unchanged. This means RTK is always safe to use.

**Important**: Even in command chains with `&&`, use `rtk`:
```bash
# ❌ Wrong
git add . && git commit -m "msg" && git push

# ✅ Correct
rtk git add . && rtk git commit -m "msg" && rtk git push
```

## RTK Commands by Workflow

### Build & Compile (80-90% savings)
```bash
rtk cargo build         # Cargo build output
rtk cargo check         # Cargo check output
rtk cargo clippy        # Clippy warnings grouped by file (80%)
rtk tsc                 # TypeScript errors grouped by file/code (83%)
rtk lint                # ESLint/Biome violations grouped (84%)
rtk prettier --check    # Files needing format only (70%)
rtk next build          # Next.js build with route metrics (87%)
```

### Test (60-99% savings)
```bash
rtk cargo test          # Cargo test failures only (90%)
rtk go test             # Go test failures only (90%)
rtk jest                # Jest failures only (99.5%)
rtk vitest              # Vitest failures only (99.5%)
rtk playwright test     # Playwright failures only (94%)
rtk pytest              # Python test failures only (90%)
rtk rake test           # Ruby test failures only (90%)
rtk rspec               # RSpec test failures only (60%)
rtk test <cmd>          # Generic test wrapper - failures only
```

### Git (59-80% savings)
```bash
rtk git status          # Compact status
rtk git log             # Compact log (works with all git flags)
rtk git diff            # Compact diff (80%)
rtk git show            # Compact show (80%)
rtk git add             # Ultra-compact confirmations (59%)
rtk git commit          # Ultra-compact confirmations (59%)
rtk git push            # Ultra-compact confirmations
rtk git pull            # Ultra-compact confirmations
rtk git branch          # Compact branch list
rtk git fetch           # Compact fetch
rtk git stash           # Compact stash
rtk git worktree        # Compact worktree
```

Note: Git passthrough works for ALL subcommands, even those not explicitly listed.

### GitHub (26-87% savings)
```bash
rtk gh pr view <num>    # Compact PR view (87%)
rtk gh pr checks        # Compact PR checks (79%)
rtk gh run list         # Compact workflow runs (82%)
rtk gh issue list       # Compact issue list (80%)
rtk gh api              # Compact API responses (26%)
```

### JavaScript/TypeScript Tooling (70-90% savings)
```bash
rtk pnpm list           # Compact dependency tree (70%)
rtk pnpm outdated       # Compact outdated packages (80%)
rtk pnpm install        # Compact install output (90%)
rtk npm run <script>    # Compact npm script output
rtk npx <cmd>           # Compact npx command output
rtk prisma              # Prisma without ASCII art (88%)
```

### Files & Search (60-75% savings)
```bash
rtk ls <path>           # Tree format, compact (65%)
rtk read <file>         # Code reading with filtering (60%)
rtk grep <pattern>      # Search grouped by file (75%). Format flags (-c, -l, -L, -o, -Z) run raw.
rtk find <pattern>      # Find grouped by directory (70%)
```

### Analysis & Debug (70-90% savings)
```bash
rtk err <cmd>           # Filter errors only from any command
rtk log <file>          # Deduplicated logs with counts
rtk json <file>         # JSON structure without values
rtk deps                # Dependency overview
rtk env                 # Environment variables compact
rtk summary <cmd>       # Smart summary of command output
rtk diff                # Ultra-compact diffs
```

### Infrastructure (85% savings)
```bash
rtk docker ps           # Compact container list
rtk docker images       # Compact image list
rtk docker logs <c>     # Deduplicated logs
rtk kubectl get         # Compact resource list
rtk kubectl logs        # Deduplicated pod logs
```

### Network (65-70% savings)
```bash
rtk curl <url>          # Compact HTTP responses (70%)
rtk wget <url>          # Compact download output (65%)
```

### Meta Commands
```bash
rtk gain                # View token savings statistics
rtk gain --history      # View command history with savings
rtk discover            # Analyze Claude Code sessions for missed RTK usage
rtk proxy <cmd>         # Run command without filtering (for debugging)
rtk init                # Add RTK instructions to CLAUDE.md
rtk init --global       # Add RTK to ~/.claude/CLAUDE.md
```

## Token Savings Overview

| Category | Commands | Typical Savings |
|----------|----------|-----------------|
| Tests | vitest, playwright, cargo test | 90-99% |
| Build | next, tsc, lint, prettier | 70-87% |
| Git | status, log, diff, add, commit | 59-80% |
| GitHub | gh pr, gh run, gh issue | 26-87% |
| Package Managers | pnpm, npm, npx | 70-90% |
| Files | ls, read, grep, find | 60-75% |
| Infrastructure | docker, kubectl | 85% |
| Network | curl, wget | 65-70% |

Overall average: **60-90% token reduction** on common development operations.
<!-- /rtk-instructions -->