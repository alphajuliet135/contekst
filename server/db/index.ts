import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from './schema'
import path from 'path'
import fs from 'fs'
import crypto from 'crypto'

const dbPath = process.env.DATABASE_URL?.replace('file:', '') ?? './data/contekst.db'

// During `next build`, parallel workers each load this module and attempt to
// open the same SQLite file with WAL pragma (a write op), causing "database is
// locked". Use an in-memory database during build — it's never queried for real
// data; only the runtime server needs the actual file.
const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build'

const client = (() => {
  if (isBuildPhase) return new Database(':memory:')
  const dbDir = path.dirname(dbPath)
  if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true })
  const c = new Database(dbPath)
  c.pragma('journal_mode = WAL')
  c.pragma('foreign_keys = ON')
  return c
})()

export const db = drizzle(client, { schema })
export type DB = typeof db

// Fault-tolerant migration runner. Handles three cases:
// 1. Fresh DB (no tables) → runs all migrations normally
// 2. Existing DB without tracking table (upgrade from pre-auto-migration) → tolerates
//    "already exists" / "duplicate column" errors so only new changes are applied
// 3. DB with tracking table (normal restart) → skips already-applied migrations
function runMigrations(sqliteClient: Database.Database, migrationsFolder: string) {
  sqliteClient.exec(`
    CREATE TABLE IF NOT EXISTS __drizzle_migrations (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      hash       TEXT NOT NULL,
      created_at NUMERIC
    )
  `)

  const journal = JSON.parse(
    fs.readFileSync(path.join(migrationsFolder, 'meta', '_journal.json'), 'utf8')
  ) as { entries: { idx: number; tag: string }[] }

  for (const entry of journal.entries) {
    const sqlFile = path.join(migrationsFolder, `${entry.tag}.sql`)
    const sql = fs.readFileSync(sqlFile, 'utf8')
    const hash = crypto.createHash('sha256').update(sql).digest('hex')

    const applied = sqliteClient.prepare(
      'SELECT 1 FROM __drizzle_migrations WHERE hash = ?'
    ).get(hash)
    if (applied) continue

    const statements = sql
      .split('--> statement-breakpoint')
      .map((s: string) => s.trim())
      .filter(Boolean)

    for (const statement of statements) {
      try {
        sqliteClient.exec(statement)
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err)
        if (msg.includes('already exists') || msg.includes('duplicate column name')) {
          continue
        }
        throw err
      }
    }

    sqliteClient.prepare(
      'INSERT INTO __drizzle_migrations (hash, created_at) VALUES (?, ?)'
    ).run(hash, Date.now())
  }
}

// Only run migrations at runtime — build phase uses in-memory DB (above) so this
// block is never reached during `next build`.
if (!isBuildPhase) {
  // In Docker production, scripts/migrate.js (run by entrypoint.sh) already applied
  // all migrations and tracks them in __migrations. Skip the runtime runner to avoid
  // a redundant second pass on every startup.
  const scriptsMigrated = client.prepare(
    "SELECT 1 FROM sqlite_master WHERE type='table' AND name='__migrations'"
  ).get()

  if (!scriptsMigrated) {
    runMigrations(client, path.join(process.cwd(), 'server/db/migrations'))
  }
}
