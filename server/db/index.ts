import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from './schema'
import path from 'path'
import fs from 'fs'
import crypto from 'crypto'

const dbPath = process.env.DATABASE_URL?.replace('file:', '') ?? './data/contekst.db'
const dbDir = path.dirname(dbPath)

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true })
}

const client = new Database(dbPath)

client.pragma('journal_mode = WAL')
client.pragma('foreign_keys = ON')

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

runMigrations(client, path.join(process.cwd(), 'server/db/migrations'))
