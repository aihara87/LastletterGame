import { createError, defineEventHandler, readBody } from 'h3'
import { createRoom, serializeRoom } from '../../utils/roomStore'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { playerName, dictionaryLanguage = 'id', timerEnabled = false, timerDuration = 30 } = body || {}

  if (!playerName || typeof playerName !== 'string' || !playerName.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid player name' })
  }
  if (!['id', 'en'].includes(dictionaryLanguage)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid language' })
  }

  const { room, playerId } = createRoom({
    playerName: playerName.trim(),
    dictionaryLanguage,
    timerEnabled: !!timerEnabled,
    timerDuration: Number(timerDuration) || 30
  })

  return {
    room: serializeRoom(room),
    playerId
  }
})
