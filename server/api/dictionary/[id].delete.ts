import { db } from '../../database/db'
import { words } from '../../database/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const id = event.context.params?.id
  if (!id) throw createError({ statusCode: 400, message: 'ID required' })

  await db.delete(words).where(eq(words.id, id))
  return { success: true }
})
