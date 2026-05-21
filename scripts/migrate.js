// Runs Drizzle SQL migrations using only better-sqlite3 (no drizzle-orm required).
// better-sqlite3 is in serverExternalPackages so it's always present in the standalone image.
const Database = require('better-sqlite3')
const path = require('path')
const fs = require('fs')

const dbPath = (process.env.DATABASE_URL ?? 'file:./data/contekst.db').replace('file:', '')
const dbDir = path.dirname(dbPath)

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true })
}

const db = new Database(dbPath)
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

db.exec(`
  CREATE TABLE IF NOT EXISTS __migrations (
    tag TEXT PRIMARY KEY,
    applied_at TEXT DEFAULT (current_timestamp)
  )
`)

const migrationsDir = path.join(__dirname, '../server/db/migrations')
const journal = JSON.parse(fs.readFileSync(path.join(migrationsDir, 'meta/_journal.json'), 'utf8'))

const applied = new Set(
  db.prepare('SELECT tag FROM __migrations').all().map(r => r.tag)
)

for (const entry of journal.entries) {
  if (applied.has(entry.tag)) continue

  const sql = fs.readFileSync(path.join(migrationsDir, `${entry.tag}.sql`), 'utf8')
  const statements = sql.split('--> statement-breakpoint').map(s => s.trim()).filter(Boolean)

  console.log(`Applying migration: ${entry.tag}`)
  for (const statement of statements) {
    try {
      db.exec(statement)
    } catch (err) {
      const msg = (err && err.message) || ''
      // Tolerate schema changes already applied by a previous deployment
      if (msg.includes('already exists') || msg.includes('duplicate column name')) {
        continue
      }
      throw err
    }
  }
  db.prepare('INSERT INTO __migrations (tag) VALUES (?)').run(entry.tag)
}

console.log('Migrations complete.')
db.close()
