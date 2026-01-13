import { db } from '../../database/db'
import { words } from '../../database/schema'
import { eq, or, inArray } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  console.log('[Import] Start processing import request')
  
  // Check if DB is connected (optional simple check, maybe count 1)
  try {
    const check = await db.select({ id: words.id }).from(words).limit(1)
    console.log('[Import] DB connection check passed')
  } catch (e: any) {
    console.error('[Import] DB connection failed immediately:', e)
    throw createError({ 
      statusCode: 500, 
      message: `Database connection failed: ${e.message}` 
    })
  }

  const body = await readBody(event)
  if (!Array.isArray(body)) throw createError({ statusCode: 400, message: 'Array expected' })

  console.log(`[Import] Received ${body.length} items to import`)

  let imported = 0
  let skipped = 0
  
  // Process in chunks to avoid payload limits and memory issues
  const CHUNK_SIZE = 50
  
  for (let i = 0; i < body.length; i += CHUNK_SIZE) {
    const chunk = body.slice(i, i + CHUNK_SIZE)
    console.log(`[Import] Processing batch ${i / CHUNK_SIZE + 1}, items ${i} to ${i + chunk.length}`)
    
    const chunkWords = chunk
      .filter(item => item.word && typeof item.word === 'string')
      .map(item => item.word.toLowerCase().trim())
    
    if (chunkWords.length === 0) continue

    try {
      // Find existing words in this chunk from DB
      const existingInDb = await db.select({ 
        word: words.word, 
        language: words.language 
      })
      .from(words)
      .where(inArray(words.word, chunkWords))

      const existingSet = new Set(existingInDb.map(w => `${w.word}|${w.language}`))
      const toInsert = []
      const currentBatchSet = new Set<string>() // To prevent dupes inside the same batch

      for (const item of chunk) {
        if (!item.word) continue
        const wordClean = item.word.toLowerCase().trim()
        const lang = item.language || 'id'
        const key = `${wordClean}|${lang}`

        if (!existingSet.has(key) && !currentBatchSet.has(key)) {
          toInsert.push({
            id: crypto.randomUUID(),
            word: wordClean,
            category: item.category,
            language: lang,
            createdAt: new Date()
          })
          currentBatchSet.add(key)
          imported++
        } else {
          skipped++
        }
      }

      if (toInsert.length > 0) {
        console.log(`[Import] Inserting ${toInsert.length} new words in batch`)
        await db.insert(words).values(toInsert)
      } else {
        console.log(`[Import] No new words to insert in this batch`)
      }
    } catch (e: any) {
      console.error(`[Import] Batch error at index ${i}:`, e)
      // Continue next batch or fail? Failsafe: throw to alert user partial failure
      throw createError({ 
        statusCode: 500, 
        message: `Failed to import batch starting at index ${i}. Error: ${e.message}` 
      })
    }
  }

  console.log(`[Import] Completed. Imported: ${imported}, Skipped: ${skipped}`)
  return { imported, skipped, total: body.length }
})
