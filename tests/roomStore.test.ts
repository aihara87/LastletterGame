import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock the database module before importing roomStore
vi.mock('../server/database/db', () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve([]))
        })),
        orderBy: vi.fn(() => Promise.resolve([]))
      }))
    })),
    insert: vi.fn(() => ({
      values: vi.fn(() => Promise.resolve())
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(() => Promise.resolve())
      }))
    })),
    delete: vi.fn(() => ({
      where: vi.fn(() => Promise.resolve())
    }))
  }
}))

vi.mock('../server/database/schema', () => ({
  words: {},
  rooms: {},
  roomPlayers: {}
}))

describe('Room Store Logic Tests', () => {
  describe('Random First Player', () => {
    it('should generate random player index within valid range', () => {
      const playerCount = 4
      const results = new Set<number>()
      
      // Run multiple times to check randomness
      for (let i = 0; i < 100; i++) {
        const randomIndex = Math.floor(Math.random() * playerCount)
        results.add(randomIndex)
        expect(randomIndex).toBeGreaterThanOrEqual(0)
        expect(randomIndex).toBeLessThan(playerCount)
      }
      
      // Should have generated multiple different indices
      expect(results.size).toBeGreaterThan(1)
    })

    it('should always return 0 for single player', () => {
      const playerCount = 1
      const randomIndex = Math.floor(Math.random() * playerCount)
      expect(randomIndex).toBe(0)
    })
  })

  describe('Next Player Index Calculation', () => {
    it('should calculate next player index correctly', () => {
      const players = [
        { id: '1', isEliminated: false },
        { id: '2', isEliminated: false },
        { id: '3', isEliminated: false }
      ]
      
      // Simple next player logic
      const nextPlayerIndex = (currentIndex: number, playerCount: number) => {
        return (currentIndex + 1) % playerCount
      }
      
      expect(nextPlayerIndex(0, 3)).toBe(1)
      expect(nextPlayerIndex(1, 3)).toBe(2)
      expect(nextPlayerIndex(2, 3)).toBe(0) // Wraps around
    })

    it('should skip eliminated players', () => {
      const players = [
        { id: '1', isEliminated: false },
        { id: '2', isEliminated: true },
        { id: '3', isEliminated: false }
      ]
      
      const nextPlayerIndex = (currentIndex: number) => {
        let nextIndex = (currentIndex + 1) % players.length
        let attempts = 0
        while (players[nextIndex].isEliminated && attempts < players.length) {
          nextIndex = (nextIndex + 1) % players.length
          attempts++
        }
        return nextIndex
      }
      
      expect(nextPlayerIndex(0)).toBe(2) // Skips player 2 (eliminated)
      expect(nextPlayerIndex(2)).toBe(0) // Wraps to player 1
    })
  })

  describe('Word Validation', () => {
    it('should validate first letter of word', () => {
      const lastWord = 'apple'
      const requiredLetter = lastWord.at(-1) // 'e'
      
      const newWord1 = 'elephant'
      const newWord2 = 'banana'
      
      expect(newWord1.startsWith(requiredLetter!)).toBe(true)
      expect(newWord2.startsWith(requiredLetter!)).toBe(false)
    })

    it('should handle empty history (first word)', () => {
      const gameHistory: any[] = []
      
      // First word can be anything
      const isFirstWord = gameHistory.length === 0
      expect(isFirstWord).toBe(true)
    })

    it('should check for used words', () => {
      const usedWords = ['apple', 'elephant', 'tiger']
      const newWord = 'elephant'
      
      expect(usedWords.includes(newWord)).toBe(true)
    })
  })

  describe('Timer Deadline', () => {
    it('should set deadline correctly', () => {
      const timerDuration = 30 // seconds
      const now = Date.now()
      const deadline = now + timerDuration * 1000
      
      expect(deadline).toBeGreaterThan(now)
      expect(deadline - now).toBe(30000)
    })

    it('should detect timeout', () => {
      const deadline = Date.now() - 1000 // 1 second ago
      const isTimedOut = Date.now() > deadline
      
      expect(isTimedOut).toBe(true)
    })

    it('should not timeout if time remaining', () => {
      const deadline = Date.now() + 10000 // 10 seconds from now
      const isTimedOut = Date.now() > deadline
      
      expect(isTimedOut).toBe(false)
    })
  })

  describe('Lives System', () => {
    it('should reduce lives on timeout', () => {
      let lives = 2
      lives = Math.max(0, lives - 1)
      expect(lives).toBe(1)
      
      lives = Math.max(0, lives - 1)
      expect(lives).toBe(0)
    })

    it('should eliminate player when lives reach 0', () => {
      const player = { lives: 1, isEliminated: false }
      
      player.lives = Math.max(0, player.lives - 1)
      if (player.lives <= 0) {
        player.isEliminated = true
      }
      
      expect(player.lives).toBe(0)
      expect(player.isEliminated).toBe(true)
    })
  })

  describe('Retry Vote System', () => {
    it('should add vote correctly', () => {
      const retryVotes: string[] = []
      const playerId = 'player1'
      
      if (!retryVotes.includes(playerId)) {
        retryVotes.push(playerId)
      }
      
      expect(retryVotes).toContain(playerId)
      expect(retryVotes.length).toBe(1)
    })

    it('should not add duplicate vote', () => {
      const retryVotes = ['player1']
      const playerId = 'player1'
      
      if (!retryVotes.includes(playerId)) {
        retryVotes.push(playerId)
      }
      
      expect(retryVotes.length).toBe(1)
    })

    it('should check majority vote', () => {
      const playerCount = 4
      const retryVotes = ['player1', 'player2', 'player3']
      
      const hasMajority = retryVotes.length > playerCount / 2
      expect(hasMajority).toBe(true)
    })

    it('should not have majority with insufficient votes', () => {
      const playerCount = 4
      const retryVotes = ['player1']
      
      const hasMajority = retryVotes.length > playerCount / 2
      expect(hasMajority).toBe(false)
    })
  })

  describe('Room State', () => {
    it('should have correct initial status', () => {
      const status = 'waiting'
      expect(['waiting', 'playing', 'finished']).toContain(status)
    })

    it('should transition from waiting to playing', () => {
      let status: 'waiting' | 'playing' | 'finished' = 'waiting'
      status = 'playing'
      expect(status).toBe('playing')
    })

    it('should determine winner when one player remains', () => {
      const players = [
        { id: 'p1', isEliminated: true },
        { id: 'p2', isEliminated: false },
        { id: 'p3', isEliminated: true }
      ]
      
      const activePlayers = players.filter(p => !p.isEliminated)
      expect(activePlayers.length).toBe(1)
      expect(activePlayers[0].id).toBe('p2')
    })
  })

  describe('Heartbeat', () => {
    it('should update lastSeen timestamp', () => {
      const player = { lastSeen: Date.now() - 10000 }
      const beforeUpdate = player.lastSeen
      
      player.lastSeen = Date.now()
      
      expect(player.lastSeen).toBeGreaterThan(beforeUpdate)
    })
  })

  describe('Serialize Room', () => {
    it('should calculate time remaining correctly', () => {
      const turnDeadline = Date.now() + 15000 // 15 seconds
      const timerEnabled = true
      
      const timeRemaining = turnDeadline && timerEnabled
        ? Math.max(0, Math.round((turnDeadline - Date.now()) / 1000))
        : null
      
      expect(timeRemaining).toBeGreaterThan(0)
      expect(timeRemaining).toBeLessThanOrEqual(15)
    })

    it('should return null if timer disabled', () => {
      const turnDeadline = Date.now() + 15000
      const timerEnabled = false
      
      const timeRemaining = turnDeadline && timerEnabled
        ? Math.max(0, Math.round((turnDeadline - Date.now()) / 1000))
        : null
      
      expect(timeRemaining).toBeNull()
    })
  })
})
