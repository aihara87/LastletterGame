import { migrate } from 'drizzle-orm/libsql/migrator'
import { db } from '../database/db'
import { words } from '../database/schema'
import { indonesianWords, englishWords } from '../database/seed_data'
import { count } from 'drizzle-orm'

export default defineNitroPlugin(async () => {
  // 1. Run migrations
  try {
    await migrate(db, { migrationsFolder: 'server/database/migrations' })
    console.log('Database migrated successfully')
  } catch (err) {
    console.error('Migration failed:', err)
  }

  // 2. Seed data if empty
  // LibSQL execute async
  const result = await db.select({ count: count() }).from(words)
  const total = result[0]?.count || 0

  if (total === 0) {
    console.log('Seeding database...')
    const allWords = [...indonesianWords, ...englishWords]
    
    const wordsToInsert = allWords.map((w, idx) => ({
      id: crypto.randomUUID(),
      word: w.word,
      category: w.category,
      language: w.language || 'id',
      createdAt: new Date()
    }))

    // Batch insert
    await db.insert(words).values(wordsToInsert)
    console.log(`Seeded ${wordsToInsert.length} words`)
  }
})
