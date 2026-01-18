import { db } from '../database/db'
import { words, rooms, roomPlayers } from '../database/schema'
import { eq, and, asc } from 'drizzle-orm'

export type Lang = 'id' | 'en'

export interface RoomPlayer {
  id: string
  name: string
  score: number
  isHost: boolean
  lastSeen: number
  isEliminated: boolean
  lives: number
  buffItems: number
  debuffItems: number
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
  lastItemDrop?: { playerId: string, itemType: 'buff' | 'debuff' } | null
}

const randomId = () => crypto.randomUUID().split('-')[0]

// Helper: Convert DB room + players to RoomState
const toRoomState = (dbRoom: typeof rooms.$inferSelect, players: RoomPlayer[]): RoomState => {
  return {
    id: dbRoom.id,
    language: dbRoom.language as Lang,
    dictionaryLanguage: dbRoom.dictionaryLanguage as Lang,
    timerEnabled: dbRoom.timerEnabled,
    timerDuration: dbRoom.timerDuration,
    turnDeadline: dbRoom.turnDeadline,
    players,
    currentPlayerIndex: dbRoom.currentPlayerIndex,
    gameHistory: JSON.parse(dbRoom.gameHistory),
    usedWords: JSON.parse(dbRoom.usedWords),
    isActive: dbRoom.isActive,
    winnerId: dbRoom.winnerId,
    status: dbRoom.status as 'waiting' | 'playing' | 'finished',
    retryVotes: JSON.parse(dbRoom.retryVotes)
  }
}

// Helper: Get players for a room
const getPlayersForRoom = async (roomId: string): Promise<RoomPlayer[]> => {
  const dbPlayers = await db.select().from(roomPlayers)
    .where(eq(roomPlayers.roomId, roomId))
    .orderBy(asc(roomPlayers.joinOrder))
  
  return dbPlayers.map(p => ({
    id: p.id,
    name: p.name,
    score: p.score,
    isHost: p.isHost,
    lastSeen: p.lastSeen,
    isEliminated: p.isEliminated,
    lives: p.lives,
    buffItems: p.buffItems,
    debuffItems: p.debuffItems
  }))
}

// Helper: Get room with players
const getRoomWithPlayers = async (roomId: string): Promise<RoomState | null> => {
  const dbRooms = await db.select().from(rooms).where(eq(rooms.id, roomId)).limit(1)
  if (dbRooms.length === 0) return null
  
  const players = await getPlayersForRoom(roomId)
  return toRoomState(dbRooms[0], players)
}

// Helper: Update room in DB
const updateRoomInDb = async (room: RoomState) => {
  await db.update(rooms).set({
    language: room.language,
    dictionaryLanguage: room.dictionaryLanguage,
    timerEnabled: room.timerEnabled,
    timerDuration: room.timerDuration,
    turnDeadline: room.turnDeadline,
    currentPlayerIndex: room.currentPlayerIndex,
    gameHistory: JSON.stringify(room.gameHistory),
    usedWords: JSON.stringify(room.usedWords),
    isActive: room.isActive,
    winnerId: room.winnerId,
    status: room.status,
    retryVotes: JSON.stringify(room.retryVotes),
    updatedAt: Date.now()
  }).where(eq(rooms.id, room.id))
}

// Helper: Update player in DB
const updatePlayerInDb = async (player: RoomPlayer, roomId: string) => {
  await db.update(roomPlayers).set({
    name: player.name,
    score: player.score,
    isHost: player.isHost,
    lastSeen: player.lastSeen,
    isEliminated: player.isEliminated,
    lives: player.lives,
    buffItems: player.buffItems,
    debuffItems: player.debuffItems
  }).where(eq(roomPlayers.id, player.id))
}

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

const checkTimeout = async (room: RoomState) => {
  if (room.status !== 'playing' || !room.timerEnabled || !room.turnDeadline) return

  if (Date.now() > room.turnDeadline) {
    const player = room.players[room.currentPlayerIndex]
    
    player.lives = Math.max(0, player.lives - 1)
    
    if (player.lives <= 0) {
      player.isEliminated = true
    }
    
    // Update player in DB
    await updatePlayerInDb(player, room.id)
    
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
    
    // Update room in DB
    await updateRoomInDb(room)
  }
}

export const createRoom = async (opts: {
  playerName: string
  dictionaryLanguage: Lang
  timerEnabled?: boolean
  timerDuration?: number
}) => {
  const id = randomId()
  const playerId = randomId()
  const now = Date.now()
  
  // Insert room
  await db.insert(rooms).values({
    id,
    language: 'id',
    dictionaryLanguage: opts.dictionaryLanguage,
    timerEnabled: opts.timerEnabled ?? false,
    timerDuration: opts.timerDuration ?? 30,
    turnDeadline: null,
    currentPlayerIndex: 0,
    gameHistory: '[]',
    usedWords: '[]',
    isActive: true,
    winnerId: null,
    status: 'waiting',
    retryVotes: '[]',
    createdAt: now,
    updatedAt: now
  })
  
  // Insert host player
  await db.insert(roomPlayers).values({
    id: playerId,
    roomId: id,
    name: opts.playerName,
    score: 0,
    isHost: true,
    lastSeen: now,
    isEliminated: false,
    lives: 2,
    joinOrder: 0,
    buffItems: 0,
    debuffItems: 0
  })
  
  const room = await getRoomWithPlayers(id)
  return { room: room!, playerId }
}

export const joinRoom = async (roomId: string, playerName: string) => {
  const room = await getRoomWithPlayers(roomId)
  if (!room) return null
  if (room.players.length >= 6) return null
  
  const playerId = randomId()
  const now = Date.now()
  
  // Insert new player
  await db.insert(roomPlayers).values({
    id: playerId,
    roomId,
    name: playerName,
    score: 0,
    isHost: false,
    lastSeen: now,
    isEliminated: false,
    lives: 2,
    joinOrder: room.players.length,
    buffItems: 0,
    debuffItems: 0
  })
  
  const updatedRoom = await getRoomWithPlayers(roomId)
  return { room: updatedRoom!, playerId }
}

export const getRoom = async (id: string) => {
  const room = await getRoomWithPlayers(id)
  if (room) await checkTimeout(room)
  return room
}

export const heartbeat = async (id: string, playerId: string) => {
  const room = await getRoomWithPlayers(id)
  if (!room) return null
  
  await checkTimeout(room)
  
  // Update player lastSeen
  await db.update(roomPlayers).set({
    lastSeen: Date.now()
  }).where(eq(roomPlayers.id, playerId))
  
  // Refresh room with updated player
  return await getRoomWithPlayers(id)
}

export const playWord = async (id: string, playerId: string, wordRaw: string) => {
  const room = await getRoomWithPlayers(id)
  if (!room) return { error: 'ROOM_NOT_FOUND' as const }
  
  await checkTimeout(room)
  if (room.status !== 'playing') return { error: 'GAME_NOT_PLAYING' as const }

  const playerIdx = room.players.findIndex(p => p.id === playerId)
  if (playerIdx === -1) return { error: 'PLAYER_NOT_FOUND' as const }
  if (playerIdx !== room.currentPlayerIndex) return { error: 'NOT_YOUR_TURN' as const }
  if (room.players[playerIdx].isEliminated) return { error: 'PLAYER_ELIMINATED' as const }

  const word = wordRaw.toLowerCase().trim()

  if (!word) return { error: 'EMPTY_WORD' as const }

  // Check if word starts with correct letter (last letter of previous word)
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

  // Update game state
  room.gameHistory.push({
    word,
    playerId,
    playerName: room.players[playerIdx].name,
    timestamp: Date.now()
  })
  room.usedWords.push(word)
  room.players[playerIdx].score += 1
  
  // 40% chance to get item after correct answer
  if (Math.random() < 0.4) {
    const itemType = Math.random() < 0.5 ? 'buff' : 'debuff'
    if (itemType === 'buff') {
      room.players[playerIdx].buffItems += 1
    } else {
      room.players[playerIdx].debuffItems += 1
    }
    room.lastItemDrop = { playerId, itemType }
  } else {
    room.lastItemDrop = null
  }
  
  room.currentPlayerIndex = nextPlayerIndex(room)
  setDeadline(room)

  // Update DB
  await updateRoomInDb(room)
  await updatePlayerInDb(room.players[playerIdx], room.id)

  // Return fresh room state
  const updatedRoom = await getRoomWithPlayers(id)
  return { room: updatedRoom }
}

export const startGame = async (roomId: string, playerId: string) => {
  const room = await getRoomWithPlayers(roomId)
  if (!room) return { error: 'ROOM_NOT_FOUND' as const }
  
  const player = room.players.find(p => p.id === playerId)
  if (!player || !player.isHost) return { error: 'NOT_HOST' as const }
  
  if (room.players.length < 2) return { error: 'NOT_ENOUGH_PLAYERS' as const }
  
  if (room.status !== 'waiting') return { error: 'GAME_ALREADY_STARTED' as const }
  
  // Random first player
  const randomPlayerIndex = Math.floor(Math.random() * room.players.length)
  
  room.status = 'playing'
  room.currentPlayerIndex = randomPlayerIndex
  setDeadline(room)
  
  await updateRoomInDb(room)
  
  // Refresh to get updated state
  const updatedRoom = await getRoomWithPlayers(roomId)
  return { room: updatedRoom }
}

const resetRoomState = async (room: RoomState) => {
  room.status = 'waiting'
  room.gameHistory = []
  room.usedWords = []
  room.winnerId = null
  room.currentPlayerIndex = 0
  room.turnDeadline = null
  room.isActive = true
  room.retryVotes = []
  
  // Reset all players
  for (const p of room.players) {
    p.score = 0
    p.isEliminated = false
    p.lives = 2
    await updatePlayerInDb(p, room.id)
  }
  
  await updateRoomInDb(room)
}

export const retryGame = async (roomId: string, playerId: string) => {
  const room = await getRoomWithPlayers(roomId)
  if (!room) return { error: 'ROOM_NOT_FOUND' as const }
  
  const player = room.players.find(p => p.id === playerId)
  if (!player || !player.isHost) return { error: 'NOT_HOST' as const }
  
  await resetRoomState(room)
  
  const updatedRoom = await getRoomWithPlayers(roomId)
  return { room: updatedRoom }
}

export const voteRetry = async (roomId: string, playerId: string) => {
  const room = await getRoomWithPlayers(roomId)
  if (!room) return { error: 'ROOM_NOT_FOUND' as const }
  if (room.status !== 'finished') return { error: 'GAME_NOT_FINISHED' as const }
  
  if (!room.players.some(p => p.id === playerId)) return { error: 'PLAYER_NOT_FOUND' as const }
  
  if (!room.retryVotes.includes(playerId)) {
    room.retryVotes.push(playerId)
    await updateRoomInDb(room)
  }
  
  // Check majority (> 50%)
  if (room.retryVotes.length > room.players.length / 2) {
    await resetRoomState(room)
  }
  
  const updatedRoom = await getRoomWithPlayers(roomId)
  return { room: updatedRoom }
}

export const leaveRoom = async (roomId: string, playerId: string) => {
  const room = await getRoomWithPlayers(roomId)
  if (!room) return { success: true }

  const playerIndex = room.players.findIndex(p => p.id === playerId)
  if (playerIndex === -1) return { success: true }

  const player = room.players[playerIndex]

  if (player.isHost) {
    // Delete all players and room
    await db.delete(roomPlayers).where(eq(roomPlayers.roomId, roomId))
    await db.delete(rooms).where(eq(rooms.id, roomId))
    return { success: true, action: 'room_closed' }
  } else {
    // Delete just this player
    await db.delete(roomPlayers).where(eq(roomPlayers.id, playerId))
    
    // Refresh room state
    const updatedRoom = await getRoomWithPlayers(roomId)
    if (!updatedRoom) return { success: true }
    
    // Remove vote if exists
    if (updatedRoom.retryVotes.includes(playerId)) {
      updatedRoom.retryVotes = updatedRoom.retryVotes.filter(v => v !== playerId)
    }
    
    // Re-check majority if finished
    if (updatedRoom.status === 'finished' && updatedRoom.retryVotes.length > updatedRoom.players.length / 2) {
      await resetRoomState(updatedRoom)
    }
    
    if (updatedRoom.status === 'playing') {
      // Recalculate current player index
      if (playerIndex < updatedRoom.currentPlayerIndex) {
        updatedRoom.currentPlayerIndex--
      } else if (playerIndex === updatedRoom.currentPlayerIndex) {
        updatedRoom.currentPlayerIndex = updatedRoom.currentPlayerIndex % Math.max(1, updatedRoom.players.length)
        setDeadline(updatedRoom)
      }
      
      if (updatedRoom.players.length < 2) {
        updatedRoom.status = 'waiting'
        updatedRoom.gameHistory = []
        updatedRoom.usedWords = []
        updatedRoom.currentPlayerIndex = 0
        updatedRoom.turnDeadline = null
      }
      
      await updateRoomInDb(updatedRoom)
    }
    
    return { success: true, action: 'player_left' }
  }
}

// Use buff item (+3 points to self)
export const useBuff = async (roomId: string, playerId: string) => {
  const room = await getRoomWithPlayers(roomId)
  if (!room) throw new Error('Room not found')
  
  const playerIdx = room.players.findIndex(p => p.id === playerId)
  if (playerIdx === -1) throw new Error('Player not found')
  
  if (room.players[playerIdx].buffItems <= 0) {
    throw new Error('No buff items')
  }
  
  // Use buff: -1 item, +3 score
  room.players[playerIdx].buffItems -= 1
  room.players[playerIdx].score += 3
  
  await updateRoomInDb(room)
  await updatePlayerInDb(room.players[playerIdx], room.id)
  
  const updatedRoom = await getRoomWithPlayers(roomId)
  return updatedRoom
}

// Use debuff item (-2 points to target)
export const useDebuff = async (roomId: string, playerId: string, targetPlayerId: string) => {
  const room = await getRoomWithPlayers(roomId)
  if (!room) throw new Error('Room not found')
  
  const playerIdx = room.players.findIndex(p => p.id === playerId)
  if (playerIdx === -1) throw new Error('Player not found')
  
  if (room.players[playerIdx].debuffItems <= 0) {
    throw new Error('No debuff items')
  }
  
  const targetIdx = room.players.findIndex(p => p.id === targetPlayerId)
  if (targetIdx === -1) throw new Error('Target not found')
  
  if (targetPlayerId === playerId) {
    throw new Error('Cannot debuff yourself')
  }
  
  // Use debuff: -1 item, -2 score to target (min 0)
  room.players[playerIdx].debuffItems -= 1
  room.players[targetIdx].score = Math.max(0, room.players[targetIdx].score - 2)
  
  await updateRoomInDb(room)
  await updatePlayerInDb(room.players[playerIdx], room.id)
  await updatePlayerInDb(room.players[targetIdx], room.id)
  
  const updatedRoom = await getRoomWithPlayers(roomId)
  return updatedRoom
}

export const serializeRoom = (room: RoomState) => {
  const now = Date.now()
  const timeRemaining = room.turnDeadline && room.timerEnabled
    ? Math.max(0, Math.round((room.turnDeadline - now) / 1000))
    : null
  return {
    ...room,
    timeRemaining,
    serverTime: now  // Add server timestamp for client sync
  }
}

export const roomsList = async () => {
  const allRooms = await db.select().from(rooms)
  const result = []
  
  for (const r of allRooms) {
    const players = await getPlayersForRoom(r.id)
    result.push({
      id: r.id,
      players: players.length,
      dictionaryLanguage: r.dictionaryLanguage,
      timerEnabled: r.timerEnabled,
      timerDuration: r.timerDuration,
      isActive: r.isActive,
      status: r.status
    })
  }
  
  return result
}
