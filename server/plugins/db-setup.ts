import { db } from '../database/db'
import { words } from '../database/schema'
import { indonesianWords, englishWords } from '../database/seed_data'
import { count } from 'drizzle-orm'

export default defineNitroPlugin(async () => {
  // Note: Migrations are handled via `npm run db:push` command
  // This is more reliable for serverless environments like Vercel
  
  // Seed data if empty
  try {
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
  } catch (err) {
    console.error('Database setup error:', err)
  }
})
