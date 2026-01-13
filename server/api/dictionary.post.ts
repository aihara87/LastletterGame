import { db } from '../database/db'
import { words } from '../database/schema'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
  if (!body.word) throw createError({ statusCode: 400, message: 'Word is required' })

  const newWord = {
    id: crypto.randomUUID(),
    word: body.word.toLowerCase(),
    category: body.category,
    language: body.language || 'id',
    createdAt: new Date()
  }

  await db.insert(words).values(newWord)
  return newWord
})
