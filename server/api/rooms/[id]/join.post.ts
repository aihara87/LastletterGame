import { defineEventHandler, readBody, createError } from 'h3'
import { getRoom, joinRoom, serializeRoom } from '../../../utils/roomStore'

export default defineEventHandler(async (event) => {
  const id = event.context.params?.id
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Room id required' })

  const body = await readBody(event)
  const { playerName } = body || {}
  if (!playerName || typeof playerName !== 'string' || !playerName.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid player name' })
  }

  const room = getRoom(id)
  if (!room) throw createError({ statusCode: 404, statusMessage: 'Room not found' })
  if (room.players.length >= 6) throw createError({ statusCode: 400, statusMessage: 'Room is full' })

  const res = joinRoom(id, playerName.trim())
  if (!res) throw createError({ statusCode: 400, statusMessage: 'Join failed' })

  return { room: serializeRoom(res.room), playerId: res.playerId }
})
