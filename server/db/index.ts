import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from './schema'
import path from 'path'
import fs from 'fs'

const dbPath = process.env.DATABASE_URL?.replace('file:', '') ?? './data/contekst.db'
const dbDir = path.dirname(dbPath)

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true })
}

const client = new Database(dbPath)

// Enable WAL mode for better performance
client.pragma('journal_mode = WAL')
client.pragma('foreign_keys = ON')

export const db = drizzle(client, { schema })
export type DB = typeof db
