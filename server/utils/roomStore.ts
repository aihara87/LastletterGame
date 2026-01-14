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
  isEliminated: boolean
  lives: number
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
  status: 'waiting' | 'playing' | 'finished'
  retryVotes: string[]
}

const rooms = new Map<string, RoomState>()
const randomId = () => crypto.randomUUID().split('-')[0]

const nextPlayerIndex = (room: RoomState) => {
  if (room.players.length === 0) return 0
  let nextIndex = (room.currentPlayerIndex + 1) % room.players.length
  
  let attempts = 0
  while (room.players[nextIndex].isEliminated && attempts < room.players.length) {
    nextIndex = (nextIndex + 1) % room.players.length
    attempts++
  }
  return nextIndex
}

const setDeadline = (room: RoomState) => {
  if (!room.timerEnabled) {
    room.turnDeadline = null
    return
  }
  room.turnDeadline = Date.now() + room.timerDuration * 1000
}

const checkTimeout = (room: RoomState) => {
  if (room.status !== 'playing' || !room.timerEnabled || !room.turnDeadline) return

  if (Date.now() > room.turnDeadline) {
    const player = room.players[room.currentPlayerIndex]
    
    player.lives = Math.max(0, player.lives - 1)
    
    if (player.lives <= 0) {
      player.isEliminated = true
    }
    
    const activePlayers = room.players.filter(p => !p.isEliminated)
    
    if (activePlayers.length <= 1) {
      room.isActive = false
      room.status = 'finished'
      if (activePlayers.length === 1) {
        room.winnerId = activePlayers[0].id
      }
    } else {
      room.currentPlayerIndex = nextPlayerIndex(room)
      setDeadline(room)
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
        lastSeen: Date.now(),
        isEliminated: false,
        lives: 2
      }
    ],

    currentPlayerIndex: 0,
    gameHistory: [],
    usedWords: [],
    isActive: true,
    winnerId: null,
    status: 'waiting',
    retryVotes: []
  }
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
    lastSeen: Date.now(),
    isEliminated: false,
    lives: 2
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
  if (room.status !== 'playing') return { error: 'GAME_NOT_PLAYING' as const }

  const playerIdx = room.players.findIndex(p => p.id === playerId)
  if (playerIdx === -1) return { error: 'PLAYER_NOT_FOUND' as const }
  if (playerIdx !== room.currentPlayerIndex) return { error: 'NOT_YOUR_TURN' as const }
  if (room.players[playerIdx].isEliminated) return { error: 'PLAYER_ELIMINATED' as const }

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

export const startGame = (roomId: string, playerId: string) => {
  const room = rooms.get(roomId)
  if (!room) return { error: 'ROOM_NOT_FOUND' as const }
  
  const player = room.players.find(p => p.id === playerId)
  if (!player || !player.isHost) return { error: 'NOT_HOST' as const }
  
  if (room.players.length < 2) return { error: 'NOT_ENOUGH_PLAYERS' as const }
  
  if (room.status !== 'waiting') return { error: 'GAME_ALREADY_STARTED' as const }
  
  room.status = 'playing'
  room.currentPlayerIndex = 0
  setDeadline(room)
  
  return { room }
}

const resetRoomState = (room: RoomState) => {
  room.status = 'waiting'
  room.gameHistory = []
  room.usedWords = []
  room.winnerId = null
  room.currentPlayerIndex = 0
  room.turnDeadline = null
  room.isActive = true
  room.retryVotes = []
  room.players.forEach(p => {
    p.score = 0
    p.isEliminated = false
    p.lives = 2
  })
}

export const retryGame = (roomId: string, playerId: string) => {
  const room = rooms.get(roomId)
  if (!room) return { error: 'ROOM_NOT_FOUND' as const }
  
  const player = room.players.find(p => p.id === playerId)
  if (!player || !player.isHost) return { error: 'NOT_HOST' as const }
  
  resetRoomState(room)
  
  return { room }
}

export const voteRetry = (roomId: string, playerId: string) => {
  const room = rooms.get(roomId)
  if (!room) return { error: 'ROOM_NOT_FOUND' as const }
  if (room.status !== 'finished') return { error: 'GAME_NOT_FINISHED' as const }
  
  if (!room.players.some(p => p.id === playerId)) return { error: 'PLAYER_NOT_FOUND' as const }
  
  if (!room.retryVotes.includes(playerId)) {
    room.retryVotes.push(playerId)
  }
  
  // Check majority (> 50%)
  if (room.retryVotes.length > room.players.length / 2) {
    resetRoomState(room)
  }
  
  return { room }
}

export const leaveRoom = (roomId: string, playerId: string) => {
  const room = rooms.get(roomId)
  if (!room) return { success: true }

  const playerIndex = room.players.findIndex(p => p.id === playerId)
  if (playerIndex === -1) return { success: true }

  const player = room.players[playerIndex]

  if (player.isHost) {
    rooms.delete(roomId)
    return { success: true, action: 'room_closed' }
  } else {
    room.players.splice(playerIndex, 1)
    
    // Remove vote if exists
    const voteIndex = room.retryVotes.indexOf(playerId)
    if (voteIndex !== -1) room.retryVotes.splice(voteIndex, 1)
    
    // Re-check majority if finished
    if (room.status === 'finished' && room.retryVotes.length > room.players.length / 2) {
      resetRoomState(room)
    }
    
    if (room.status === 'playing') {
      if (playerIndex < room.currentPlayerIndex) {
        room.currentPlayerIndex--
      } else if (playerIndex === room.currentPlayerIndex) {
        room.currentPlayerIndex = room.currentPlayerIndex % room.players.length
        setDeadline(room)
      }
      
      if (room.players.length < 2) {
        room.status = 'waiting'
        room.gameHistory = []
        room.usedWords = []
        room.currentPlayerIndex = 0
        room.turnDeadline = null
      }
    }
    
    return { success: true, action: 'player_left' }
  }
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
  isActive: r.isActive,
  status: r.status
}))
