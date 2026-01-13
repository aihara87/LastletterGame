import { db } from '../database/db'
import { words } from '../database/schema'
import { eq, and } from 'drizzle-orm'

export type Lang = 'id' | 'en'

export interface RoomPlayer {
  id: string
  name: string
  score: number
  isHost: boolean
  lastSeen: number
}

export interface RoomHistory {
  word: string
  playerId: string
  playerName: string
  timestamp: number
}

export interface RoomState {
  id: string
  language: Lang
  dictionaryLanguage: Lang
  timerEnabled: boolean
  timerDuration: number
  turnDeadline: number | null
  players: RoomPlayer[]
  currentPlayerIndex: number
  gameHistory: RoomHistory[]
  usedWords: string[]
  isActive: boolean
  winnerId: string | null
}

const rooms = new Map<string, RoomState>()
const randomId = () => crypto.randomUUID().split('-')[0]

const nextPlayerIndex = (room: RoomState) => {
  if (room.players.length === 0) return 0
  return (room.currentPlayerIndex + 1) % room.players.length
}

const setDeadline = (room: RoomState) => {
  if (!room.timerEnabled) {
    room.turnDeadline = null
    return
  }
  room.turnDeadline = Date.now() + room.timerDuration * 1000
}

const checkTimeout = (room: RoomState) => {
  if (!room.isActive || !room.timerEnabled || !room.turnDeadline) return

  if (Date.now() > room.turnDeadline) {
    room.isActive = false
    // Winner is the previous player
    if (room.players.length > 1) {
      let prevIndex = room.currentPlayerIndex - 1
      if (prevIndex < 0) prevIndex = room.players.length - 1
      room.winnerId = room.players[prevIndex].id
    }
  }
}

export const createRoom = (opts: {
  playerName: string
  dictionaryLanguage: Lang
  timerEnabled?: boolean
  timerDuration?: number
}) => {
  const id = randomId()
  const playerId = randomId()
  const room: RoomState = {
    id,
    language: 'id',
    dictionaryLanguage: opts.dictionaryLanguage,
    timerEnabled: opts.timerEnabled ?? false,
    timerDuration: opts.timerDuration ?? 30,
    turnDeadline: null,
    players: [
      {
        id: playerId,
        name: opts.playerName,
        score: 0,
        isHost: true,
        lastSeen: Date.now()
      }
    ],
    currentPlayerIndex: 0,
    gameHistory: [],
    usedWords: [],
    isActive: true,
    winnerId: null
  }
  setDeadline(room)
  rooms.set(id, room)
  return { room, playerId }
}

export const joinRoom = (roomId: string, playerName: string) => {
  const room = rooms.get(roomId)
  if (!room) return null
  if (room.players.length >= 6) return null
  const playerId = randomId()
  room.players.push({
    id: playerId,
    name: playerName,
    score: 0,
    isHost: false,
    lastSeen: Date.now()
  })
  return { room, playerId }
}

export const getRoom = (id: string) => {
  const room = rooms.get(id)
  if (room) checkTimeout(room)
  return room
}

export const heartbeat = (id: string, playerId: string) => {
  const room = rooms.get(id)
  if (!room) return null
  checkTimeout(room)
  const player = room.players.find(p => p.id === playerId)
  if (player) player.lastSeen = Date.now()
  return room
}

export const playWord = async (id: string, playerId: string, wordRaw: string) => {
  const room = rooms.get(id)
  if (!room) return { error: 'ROOM_NOT_FOUND' as const }
  
  checkTimeout(room)
  if (!room.isActive) return { error: 'ROOM_NOT_FOUND' as const }

  const playerIdx = room.players.findIndex(p => p.id === playerId)
  if (playerIdx === -1) return { error: 'PLAYER_NOT_FOUND' as const }
  if (playerIdx !== room.currentPlayerIndex) return { error: 'NOT_YOUR_TURN' as const }

  const word = wordRaw.toLowerCase().trim()
  if (!word) return { error: 'EMPTY_WORD' as const }

  if (room.gameHistory.length > 0) {
    const lastWord = room.gameHistory[room.gameHistory.length - 1].word
    const required = lastWord.at(-1)
    if (required && !word.startsWith(required)) return { error: 'WRONG_LETTER' as const, required }
  }

  // Check dictionary from DB
  const results = await db.select().from(words).where(
    and(
      eq(words.word, word),
      eq(words.language, room.dictionaryLanguage)
    )
  ).limit(1)

  const entry = results[0]

  if (!entry) return { error: 'NOT_IN_DICTIONARY' as const }
  
  if (room.usedWords.includes(word)) return { error: 'USED_WORD' as const }

  room.gameHistory.push({
    word,
    playerId,
    playerName: room.players[playerIdx].name,
    timestamp: Date.now()
  })
  room.usedWords.push(word)
  room.players[playerIdx].score += 1

  room.currentPlayerIndex = nextPlayerIndex(room)
  setDeadline(room)

  return { room }
}

export const serializeRoom = (room: RoomState) => {
  const timeRemaining = room.turnDeadline && room.timerEnabled
    ? Math.max(0, Math.round((room.turnDeadline - Date.now()) / 1000))
    : null
  return {
    ...room,
    timeRemaining
  }
}

export const roomsList = () => Array.from(rooms.values()).map(r => ({
  id: r.id,
  players: r.players.length,
  dictionaryLanguage: r.dictionaryLanguage,
  timerEnabled: r.timerEnabled,
  timerDuration: r.timerDuration,
  isActive: r.isActive
}))
