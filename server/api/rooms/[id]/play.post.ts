import { defineEventHandler, readBody, createError } from 'h3'
import { playWord, serializeRoom } from '../../../utils/roomStore'

export default defineEventHandler(async (event) => {
  const id = event.context.params?.id
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Room id required' })

  const body = await readBody(event)
  const { playerId, word } = body || {}
  if (!playerId || typeof playerId !== 'string') throw createError({ statusCode: 400, statusMessage: 'Invalid playerId' })
  if (!word || typeof word !== 'string') throw createError({ statusCode: 400, statusMessage: 'Invalid word' })

  const result = await playWord(id, playerId, word)

  if (result.error) {

    return {
      error: result.error,
      required: (result as any).required || null
    }
  }

  return serializeRoom(result.room)
})
