import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const words = sqliteTable('words', {
  id: text('id').primaryKey(),
  word: text('word').notNull(),
  category: text('category'),
  language: text('language').notNull().default('id'), // 'id' | 'en'
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
})

// Online game rooms
export const rooms = sqliteTable('rooms', {
  id: text('id').primaryKey(),
  language: text('language').notNull().default('id'), // 'id' | 'en'
  dictionaryLanguage: text('dictionary_language').notNull().default('id'),
  timerEnabled: integer('timer_enabled', { mode: 'boolean' }).notNull().default(false),
  timerDuration: integer('timer_duration').notNull().default(30),
  turnDeadline: integer('turn_deadline'), // Unix timestamp in ms
  currentPlayerIndex: integer('current_player_index').notNull().default(0),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  winnerId: text('winner_id'),
  status: text('status').notNull().default('waiting'), // 'waiting' | 'playing' | 'finished'
  gameHistory: text('game_history').notNull().default('[]'), // JSON array
  usedWords: text('used_words').notNull().default('[]'), // JSON array
  retryVotes: text('retry_votes').notNull().default('[]'), // JSON array of player IDs
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull()
})

// Players in rooms
export const roomPlayers = sqliteTable('room_players', {
  id: text('id').primaryKey(),
  roomId: text('room_id').notNull(),
  name: text('name').notNull(),
  score: integer('score').notNull().default(0),
  isHost: integer('is_host', { mode: 'boolean' }).notNull().default(false),
  lastSeen: integer('last_seen').notNull(),
  isEliminated: integer('is_eliminated', { mode: 'boolean' }).notNull().default(false),
  lives: integer('lives').notNull().default(2),
  joinOrder: integer('join_order').notNull().default(0), // To maintain player order
  buffItems: integer('buff_items').default(0), // Power-up items (+3 points) - nullable for existing records
  debuffItems: integer('debuff_items').default(0) // Sabotage items (-2 points to target) - nullable for existing records
})
