import { defineEventHandler, createError } from 'h3'
import { getRoom, serializeRoom } from '../../../utils/roomStore'

export default defineEventHandler((event) => {
  const id = event.context.params?.id
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Room id required' })

  const room = getRoom(id)
  if (!room) throw createError({ statusCode: 404, statusMessage: 'Room not found' })

  return serializeRoom(room)
})
