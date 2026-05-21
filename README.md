# Contekst

A self-hosted life-organisation app. Each area of your life gets its own context — a full dashboard (Macro) or a lightweight background card (Micro) — so you always know what needs attention without carrying everything in your head.

## Features

- **Mission Control** — smart home view with a **Today** section (cross-context todos due today / overdue / high-priority, sortable by Priority, Context, or Due date), per-context attention cards, aggregated Upcoming dates, pinned items, and a Micro sidebar
- **Macro dashboards** — full-page dashboard per context with seven widgets: Priorities, Upcoming dates, Notes, Habits, Links, People, Mantra; drag-to-reorder and resize widgets; toggle visibility via Edit Layout mode
- **Micro hub** — compact card grid; peek into any Micro context's full widget dashboard via modal without promoting it
- **Priorities widget** — inline todo creation and editing; optional named sub-lists per context (tab bar); click-to-open priority picker; mark done with optimistic UI
- **Notes widget** — freeform notes with optional titles; inline editing
- **Backup & restore** — export a full JSON backup from Settings; restore replaces all current data with two-step confirmation; last-backup timestamp tracked per browser
- **Promote / demote** — move any context between Macro and Micro at any time
- **First-run setup** — signup page on first launch, no seed scripts or manual DB inserts needed
- **Self-hosted** — single SQLite file, Docker multi-arch image (`amd64` + `arm64`), no external services required
- **Dark UI** — near-black theme with per-context colour accents throughout

## Quick start

### Prerequisites

- Node.js 20+
- npm

### Local development

```bash
# 1. Install dependencies
npm install

# 2. Copy and fill in the environment file
cp .env.example .env
# Set AUTH_SECRET (openssl rand -base64 32) and NEXTAUTH_URL

# 3. Start the dev server
npm run dev
# Migrations run automatically on startup.
# On first visit you will be prompted to create your account.
```

Open [http://localhost:3000](http://localhost:3000) and complete the one-time setup.

### Self-hosting with Docker

```bash
# 1. Copy and fill in the environment file
cp .env.example .env

# 2. Pull and run
docker compose up -d
# Open http://localhost:3000 — you will be prompted to create your account on first visit.
```

The SQLite database is stored in `./data/contekst.db` on the host. **Back this directory up.**

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `AUTH_SECRET` | Yes | Random secret for JWT signing — `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Yes | Full URL where the app is served, e.g. `https://contekst.example.com` |
| `DATABASE_URL` | Yes | SQLite file path, e.g. `file:./data/contekst.db` |

## Releasing

Merge to `main` to trigger a GitHub Actions build. The workflow reads the version from `package.json`, creates a git tag (`v<version>`), and publishes a multi-arch (`amd64` + `arm64`) Docker image to GHCR.

To release a new version: bump `version` in `package.json`, commit, and merge to `main`.


## Tech stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16 — App Router, server components |
| Styling | Tailwind CSS + inline styles; CSS custom properties for theming |
| DB | SQLite via Drizzle ORM — WAL mode |
| Auth | Auth.js v5 — credentials login, JWT sessions |
| API | Next.js Route Handlers |
| Container | Docker multi-stage, multi-arch build |
| Registry | GitHub Container Registry (GHCR) |
| CI/CD | GitHub Actions — triggers on `v*` tag |
