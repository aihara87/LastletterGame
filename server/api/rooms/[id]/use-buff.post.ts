import { useBuff, serializeRoom } from '~/server/utils/roomStore'

export default defineEventHandler(async (event) => {
  const roomId = getRouterParam(event, 'id')
  const { playerId } = await readBody(event)
  
  if (!roomId || !playerId) {
    throw createError({ statusCode: 400, message: 'Missing required fields' })
  }
  
  try {
    const room = await useBuff(roomId, playerId)
    return serializeRoom(room)
  } catch (err: any) {
    throw createError({ statusCode: 400, message: err.message })
  }
})
