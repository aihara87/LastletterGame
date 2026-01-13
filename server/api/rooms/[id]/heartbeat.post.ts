import { defineEventHandler, readBody, createError } from 'h3'
import { heartbeat, serializeRoom } from '../../../utils/roomStore'

export default defineEventHandler(async (event) => {
  const id = event.context.params?.id
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Room id required' })

  const body = await readBody(event)
  const { playerId } = body || {}
  if (!playerId || typeof playerId !== 'string') throw createError({ statusCode: 400, statusMessage: 'Invalid playerId' })

  const room = heartbeat(id, playerId)
  if (!room) throw createError({ statusCode: 404, statusMessage: 'Room not found' })

  return serializeRoom(room)
})
