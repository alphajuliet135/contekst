import { sqliteTable, text, integer, real, uniqueIndex } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

// --- Auth ---

export const users = sqliteTable('users', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name'),
  createdAt: text('created_at').default(sql`(current_timestamp)`),
})

export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: integer('expires_at').notNull(),
})

// --- Contexts ---

export const contexts = sqliteTable('contexts', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  type: text('type', { enum: ['macro', 'micro'] }).notNull().default('macro'),
  color: text('color').notNull().default('#378ADD'),
  icon: text('icon').notNull().default('circle'),
  order: integer('order').notNull().default(0),
  description: text('description'),
  createdAt: text('created_at').default(sql`(current_timestamp)`),
})

export const widgetConfigs = sqliteTable('widget_configs', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  contextId: text('context_id').notNull().references(() => contexts.id, { onDelete: 'cascade' }),
  widgetType: text('widget_type', {
    enum: ['todos', 'dates', 'notes', 'habits', 'links', 'people', 'mantra'],
  }).notNull(),
  enabled: integer('enabled', { mode: 'boolean' }).notNull().default(true),
  settings: text('settings', { mode: 'json' }),
  order: integer('order').notNull().default(0),
}, (t) => ({
  uniqContextWidget: uniqueIndex('widget_configs_ctx_type_uniq').on(t.contextId, t.widgetType),
}))

// --- Todo Lists ---

export const todoLists = sqliteTable('todo_lists', {
  id:        text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  contextId: text('context_id').notNull().references(() => contexts.id, { onDelete: 'cascade' }),
  userId:    text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name:      text('name').notNull(),
  order:     integer('order').notNull().default(0),
  createdAt: text('created_at').default(sql`(current_timestamp)`),
})

// --- Todos ---

export const todos = sqliteTable('todos', {
  id:          text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  contextId:   text('context_id').notNull().references(() => contexts.id, { onDelete: 'cascade' }),
  userId:      text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  listId:      text('list_id').references(() => todoLists.id, { onDelete: 'set null' }),
  title:       text('title').notNull(),
  priority:    text('priority', { enum: ['high', 'medium', 'low'] }).notNull().default('medium'),
  dueDate:     text('due_date'),
  done:        integer('done', { mode: 'boolean' }).notNull().default(false),
  pinned:      integer('pinned', { mode: 'boolean' }).notNull().default(false),
  completedAt: text('completed_at'),
  createdAt:   text('created_at').default(sql`(current_timestamp)`),
})

// --- Dates ---

export const dates = sqliteTable('dates', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  contextId: text('context_id').notNull().references(() => contexts.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  date: text('date').notNull(),
  note: text('note'),
  pinned: integer('pinned', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at').default(sql`(current_timestamp)`),
})

// --- Notes ---

export const notes = sqliteTable('notes', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  contextId: text('context_id').notNull().references(() => contexts.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title'),
  content: text('content').notNull().default(''),
  pinned: integer('pinned', { mode: 'boolean' }).notNull().default(false),
  updatedAt: text('updated_at').default(sql`(current_timestamp)`),
})

// --- Habits ---

export const habits = sqliteTable('habits', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  contextId: text('context_id').notNull().references(() => contexts.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  frequency: text('frequency', { enum: ['daily', 'weekly'] }).notNull().default('daily'),
  createdAt: text('created_at').default(sql`(current_timestamp)`),
})

export const habitLogs = sqliteTable('habit_logs', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  habitId: text('habit_id').notNull().references(() => habits.id, { onDelete: 'cascade' }),
  date: text('date').notNull(),
  completed: integer('completed', { mode: 'boolean' }).notNull().default(false),
})

// --- Links ---

export const links = sqliteTable('links', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  contextId: text('context_id').notNull().references(() => contexts.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  url: text('url').notNull(),
  createdAt: text('created_at').default(sql`(current_timestamp)`),
})

// --- People ---

export const people = sqliteTable('people', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  contextId: text('context_id').notNull().references(() => contexts.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  note: text('note'),
  createdAt: text('created_at').default(sql`(current_timestamp)`),
})
