export interface Player {
  id: string
  name: string
  score: number
  isBot: boolean
  avatar?: string
}

export interface GameHistory {
  word: string
  player: string
  timestamp: Date
}

export type GameMode = 'pvp' | 'bot'

export const useGameState = () => {
  const players = useState<Player[]>('players', () => [])
  const currentPlayerIndex = useState<number>('currentPlayerIndex', () => 0)
  const gameHistory = useState<GameHistory[]>('gameHistory', () => [])
  const gameMode = useState<GameMode>('gameMode', () => 'pvp')
  const isGameActive = useState<boolean>('isGameActive', () => false)
  const usedWords = useState<Set<string>>('usedWords', () => new Set())
  
  // Timer states
  const timerEnabled = useState<boolean>('timerEnabled', () => false)
  const timerDuration = useState<number>('timerDuration', () => 30) // default 30 seconds
  const timeRemaining = useState<number>('timeRemaining', () => 30)
  const timerInterval = useState<NodeJS.Timeout | null>('timerInterval', () => null)

  const currentPlayer = computed(() => players.value[currentPlayerIndex.value])

  const lastWord = computed(() => {
    if (gameHistory.value.length === 0) return null
    return gameHistory.value[gameHistory.value.length - 1].word
  })

  const requiredFirstLetter = computed(() => {
    if (!lastWord.value) return null
    return lastWord.value.charAt(lastWord.value.length - 1).toLowerCase()
  })

  const initGame = (mode: GameMode, playerNames: string[], enableTimer: boolean = false, duration: number = 30) => {
    gameMode.value = mode
    players.value = playerNames.map((name, index) => ({
      id: `player-${index}`,
      name,
      score: 0,
      isBot: mode === 'bot' && index > 0,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`
    }))
    currentPlayerIndex.value = 0
    gameHistory.value = []
    usedWords.value = new Set()
    isGameActive.value = true
    
    // Timer setup
    timerEnabled.value = enableTimer
    timerDuration.value = duration
    timeRemaining.value = duration
  }

  const addToHistory = (word: string, playerName: string) => {
    gameHistory.value.push({
      word,
      player: playerName,
      timestamp: new Date()
    })
    usedWords.value.add(word.toLowerCase())
  }

  const incrementScore = (playerId: string) => {
    const player = players.value.find(p => p.id === playerId)
    if (player) {
      player.score++
    }
  }

  const nextPlayer = () => {
    currentPlayerIndex.value = (currentPlayerIndex.value + 1) % players.value.length
    // Reset timer for next player
    if (timerEnabled.value) {
      resetTimer()
    }
  }

  const resetGame = () => {
    stopTimer()
    players.value = []
    currentPlayerIndex.value = 0
    gameHistory.value = []
    usedWords.value = new Set()
    isGameActive.value = false
    timerEnabled.value = false
    timerDuration.value = 30
    timeRemaining.value = 30
  }

  const isWordUsed = (word: string): boolean => {
    return usedWords.value.has(word.toLowerCase())
  }

  // Timer functions
  const startTimer = (onTimeout: () => void) => {
    if (!timerEnabled.value) return
    
    stopTimer() // Clear any existing timer
    timeRemaining.value = timerDuration.value
    
    timerInterval.value = setInterval(() => {
      timeRemaining.value--
      
      if (timeRemaining.value <= 0) {
        stopTimer()
        onTimeout()
      }
    }, 1000)
  }

  const stopTimer = () => {
    if (timerInterval.value) {
      clearInterval(timerInterval.value)
      timerInterval.value = null
    }
  }

  const resetTimer = () => {
    timeRemaining.value = timerDuration.value
  }

  const pauseTimer = () => {
    stopTimer()
  }

  const resumeTimer = (onTimeout: () => void) => {
    if (!timerEnabled.value) return
    
    stopTimer()
    
    timerInterval.value = setInterval(() => {
      timeRemaining.value--
      
      if (timeRemaining.value <= 0) {
        stopTimer()
        onTimeout()
      }
    }, 1000)
  }

  return {
    players,
    currentPlayer,
    currentPlayerIndex,
    gameHistory,
    gameMode,
    isGameActive,
    lastWord,
    requiredFirstLetter,
    timerEnabled,
    timerDuration,
    timeRemaining,
    initGame,
    addToHistory,
    incrementScore,
    nextPlayer,
    resetGame,
    isWordUsed,
    startTimer,
    stopTimer,
    resetTimer,
    pauseTimer,
    resumeTimer
  }
}
