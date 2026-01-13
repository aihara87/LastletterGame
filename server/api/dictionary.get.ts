import { db } from '../database/db'
import { words } from '../database/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const language = query.language as string

  if (language) {
    return await db.select().from(words).where(eq(words.language, language))
  }
  return await db.select().from(words)
})
