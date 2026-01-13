import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const words = sqliteTable('words', {
  id: text('id').primaryKey(), // We use string IDs in current app
  word: text('word').notNull(),
  category: text('category'),
  language: text('language').notNull().default('id'), // 'id' | 'en'
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
})
