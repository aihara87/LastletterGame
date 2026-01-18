import { useDebuff, serializeRoom } from '~/server/utils/roomStore'

export default defineEventHandler(async (event) => {
  const roomId = getRouterParam(event, 'id')
  const { playerId, targetPlayerId } = await readBody(event)
  
  if (!roomId || !playerId || !targetPlayerId) {
    throw createError({ statusCode: 400, message: 'Missing required fields' })
  }
  
  try {
    const room = await useDebuff(roomId, playerId, targetPlayerId)
    return serializeRoom(room)
  } catch (err: any) {
    throw createError({ statusCode: 400, message: err.message })
  }
})
