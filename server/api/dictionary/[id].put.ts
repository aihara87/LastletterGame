import { db } from '../../database/db'
import { words } from '../../database/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const id = event.context.params?.id
  const body = await readBody(event)
  
  if (!id) throw createError({ statusCode: 400, message: 'ID required' })

  await db.update(words)
    .set({
      word: body.word?.toLowerCase(),
      category: body.category,
      language: body.language
    })
    .where(eq(words.id, id))

  return { success: true }
})
