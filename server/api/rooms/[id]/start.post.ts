import { defineEventHandler, readBody, createError } from 'h3'
import { startGame, serializeRoom } from '../../../utils/roomStore'

export default defineEventHandler(async (event) => {
  const id = event.context.params?.id
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Room id required' })

  const body = await readBody(event)
  const { playerId } = body || {}
  if (!playerId || typeof playerId !== 'string') throw createError({ statusCode: 400, statusMessage: 'Invalid playerId' })

  const result = await startGame(id, playerId)

  if (result.error) {
    throw createError({ statusCode: 400, statusMessage: result.error })
  }

  return serializeRoom(result.room!)
})
