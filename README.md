# Contekst

A self-hosted life-organisation app. Each area of your life gets its own context — a full dashboard (Macro) or a lightweight background card (Micro) — so you always know what needs attention without carrying everything in your head.

## Features

- **Mission Control** — smart home view: greeting, per-context attention cards surfacing urgent/overdue todos and upcoming dates, an aggregated Upcoming dates card, pinned items, and a Micro sidebar
- **Macro dashboards** — full-page dashboard per context with six independent widgets: Priorities, Upcoming dates, Notes, Habits, Links, People; each widget can be toggled on/off per context
- **Micro hub** — compact card grid for low-footprint contexts; shows top priority and next date per card
- **Promote / demote** — move any context between Macro and Micro at any time
- **Top bar navigation** — logo → context tabs with coloured accent pills → Micro shortcut
- **Dark UI** — near-black theme with context-colour accents throughout
- **Self-hosted** — single SQLite file, Docker multi-arch image, no external services required

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

# 3. Create the database
npm run db:generate
npm run db:migrate

# 4. Create your first user (run once)
node -e "
const bcrypt = require('bcryptjs');
const Database = require('better-sqlite3');
const db = new Database('./data/contekst.db');
const hash = bcrypt.hashSync('YOUR_PASSWORD', 12);
const id = require('crypto').randomUUID();
db.prepare('INSERT INTO users (id, email, password_hash, name) VALUES (?, ?, ?, ?)').run(id, 'you@example.com', hash, 'Your Name');
db.close();
console.log('User created:', id);
"

# 5. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in.

### Self-hosting with Docker

```bash
# 1. Copy and fill in the environment file
cp .env.example .env

# 3. Pull and run
docker compose up -d
```

The SQLite database is stored in `./data/contekst.db` on the host. **Back this directory up.**

To create the first user inside the container:

```bash
docker exec -it contekst node -e "
const bcrypt = require('bcryptjs');
const Database = require('better-sqlite3');
const db = new Database('/app/data/contekst.db');
const hash = bcrypt.hashSync('YOUR_PASSWORD', 12);
const id = require('crypto').randomUUID();
db.prepare('INSERT INTO users (id, email, password_hash, name) VALUES (?, ?, ?, ?)').run(id, 'you@example.com', hash, 'Your Name');
db.close();
"
```

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `AUTH_SECRET` | Yes | Random secret for JWT signing — `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Yes | Full URL where the app is served, e.g. `https://contekst.example.com` |
| `DATABASE_URL` | Yes | SQLite file path, e.g. `file:./data/contekst.db` |

## Releasing

Push a version tag to trigger a GitHub Actions build that produces a multi-arch (`amd64` + `arm64`) image and pushes it to GHCR:

```bash
git tag v0.1.0
git push origin v0.1.0
```


## Tech stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 15 — App Router, server components |
| Styling | Tailwind CSS + inline styles; CSS custom properties for theming |
| DB | SQLite via Drizzle ORM — WAL mode |
| Auth | Auth.js v5 — credentials login, JWT sessions |
| API | Next.js Route Handlers |
| Container | Docker multi-stage, multi-arch build |
| Registry | GitHub Container Registry (GHCR) |
| CI/CD | GitHub Actions — triggers on `v*` tag |
