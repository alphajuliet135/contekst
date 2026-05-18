const Database = require('better-sqlite3')
const { drizzle } = require('drizzle-orm/better-sqlite3')
const { migrate } = require('drizzle-orm/better-sqlite3/migrator')
const path = require('path')
const fs = require('fs')

const dbPath = (process.env.DATABASE_URL ?? 'file:./data/contekst.db').replace('file:', '')
const dbDir = path.dirname(dbPath)

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true })
}

const client = new Database(dbPath)
client.pragma('journal_mode = WAL')
client.pragma('foreign_keys = ON')

const db = drizzle(client)

console.log('Running database migrations...')
migrate(db, { migrationsFolder: path.join(__dirname, '../server/db/migrations') })
console.log('Migrations complete.')

client.close()
