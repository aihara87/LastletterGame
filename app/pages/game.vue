<template>
  <div class="min-h-screen p-4">
    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Last Letter Game
        </h1>
        <button @click="confirmQuit" class="btn-danger">
          <Icon name="mdi:exit-to-app" class="inline mr-2" />
          Keluar
        </button>
      </div>

      <!-- Game Status -->
      <div class="card mb-6">
        <div class="flex flex-wrap gap-4 justify-between items-center">
          <div>
            <p class="text-sm text-gray-600">Mode</p>
            <p class="font-bold text-lg">{{ gameMode === 'pvp' ? 'Multiplayer' : 'Vs Bot' }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-600">Giliran</p>
            <p class="font-bold text-lg text-purple-600">{{ currentPlayer?.name }}</p>
          </div>
          
          <!-- Timer Display -->
          <div v-if="timerEnabled" class="flex flex-col items-center">
            <p class="text-sm text-gray-600 mb-1">Waktu Tersisa</p>
            <div 
              class="flex items-center justify-center w-20 h-20 rounded-full border-4 transition-all duration-300"
              :class="getTimerColorClass()"
            >
              <div class="text-center">
                <Icon 
                  name="mdi:timer-sand" 
                  class="text-2xl mb-1"
                  :class="timeRemaining <= 5 ? 'animate-bounce' : ''"
                />
                <p class="font-bold text-xl">{{ timeRemaining }}</p>
              </div>
            </div>
          </div>
          
          <div v-if="lastWord">
            <p class="text-sm text-gray-600">Kata Terakhir</p>
            <p class="font-bold text-lg text-pink-600">{{ lastWord }}</p>
          </div>
          <div v-if="requiredFirstLetter">
            <p class="text-sm text-gray-600">Harus Dimulai Dengan</p>
            <p class="font-bold text-3xl text-blue-600 uppercase">{{ requiredFirstLetter }}</p>
          </div>
        </div>
      </div>

      <div class="grid lg:grid-cols-3 gap-6">
        <!-- Players Score -->
        <div class="card">
          <h3 class="text-xl font-bold mb-4 text-gray-800">Skor Pemain</h3>
          <div class="space-y-3">
            <div
              v-for="player in players"
              :key="player.id"
              class="flex items-center justify-between p-3 rounded-xl"
              :class="player.id === currentPlayer?.id ? 'bg-purple-100 border-2 border-purple-500' : 'bg-gray-50'"
            >
              <div class="flex items-center gap-3">
                <img :src="player.avatar" :alt="player.name" class="w-10 h-10 rounded-full" />
                <div>
                  <p class="font-semibold">{{ player.name }}</p>
                  <p v-if="player.isBot" class="text-xs text-gray-500">
                    <Icon name="mdi:robot" class="inline" /> Bot
                  </p>
                </div>
              </div>
              <div class="text-2xl font-bold text-purple-600">
                {{ player.score }}
              </div>
            </div>
          </div>
        </div>

        <!-- Game Board -->
        <div class="lg:col-span-2">
          <!-- Input Area -->
          <div class="card mb-4">
            <h3 class="text-xl font-bold mb-4 text-gray-800">Masukkan Kata</h3>
            
            <!-- Bot Thinking -->
            <div v-if="isBotThinking" class="text-center py-8">
              <Icon name="mdi:loading" class="text-6xl text-purple-600 animate-spin mx-auto mb-4" />
              <p class="text-lg text-gray-600">Bot sedang berpikir...</p>
            </div>

            <!-- Human Input -->
            <div v-else-if="!currentPlayer?.isBot">
              <form @submit.prevent="submitWord" class="space-y-4">
                <div>
                  <input
                    v-model="inputWord"
                    type="text"
                    placeholder="Ketik kata Anda..."
                    class="input-field"
                    :disabled="isBotThinking"
                    autofocus
                  />
                  <p v-if="errorMessage" class="text-red-500 text-sm mt-2">
                    {{ errorMessage }}
                  </p>
                  <p v-if="requiredFirstLetter" class="text-gray-500 text-sm mt-2">
                    Kata harus dimulai dengan huruf: <strong class="text-purple-600 uppercase">{{ requiredFirstLetter }}</strong>
                  </p>
                </div>
                <button
                  type="submit"
                  class="btn-primary w-full"
                  :disabled="!inputWord.trim() || isBotThinking"
                >
                  <Icon name="mdi:send" class="inline mr-2" />
                  Kirim Kata
                </button>
              </form>
            </div>
          </div>

          <!-- Game History -->
          <div class="card">
            <h3 class="text-xl font-bold mb-4 text-gray-800">Riwayat Permainan</h3>
            <div class="max-h-96 overflow-y-auto space-y-2">
              <div
                v-for="(entry, index) in gameHistory.slice().reverse()"
                :key="index"
                class="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl flex justify-between items-center"
              >
                <div>
                  <p class="font-semibold text-purple-600">{{ entry.word }}</p>
                  <p class="text-sm text-gray-600">{{ entry.player }}</p>
                </div>
                <p class="text-xs text-gray-400">
                  {{ formatTime(entry.timestamp) }}
                </p>
              </div>
              <div v-if="gameHistory.length === 0" class="text-center text-gray-400 py-8">
                Belum ada kata yang dimainkan
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Winner Modal -->
      <div v-if="showWinnerModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="card max-w-md mx-4 text-center">
          <Icon name="mdi:trophy" class="text-8xl text-yellow-500 mx-auto mb-4" />
          <h2 class="text-3xl font-bold mb-4">Game Over!</h2>
          <p class="text-xl mb-6">
            <span class="font-bold text-purple-600">{{ winner }}</span> tidak bisa menemukan kata!
          </p>
          <div class="space-y-3">
            <button @click="playAgain" class="btn-primary w-full">
              <Icon name="mdi:replay" class="inline mr-2" />
              Main Lagi
            </button>
            <button @click="backToHome" class="btn-secondary w-full">
              <Icon name="mdi:home" class="inline mr-2" />
              Kembali ke Home
            </button>
          </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BotPlayer } from '~/utils/botPlayer'

const {
  players,
  currentPlayer,
  gameHistory,
  gameMode,
  isGameActive,
  lastWord,
  requiredFirstLetter,
  timerEnabled,
  timeRemaining,
  addToHistory,
  incrementScore,
  nextPlayer,
  resetGame,
  isWordUsed,
  startTimer,
  stopTimer
} = useGameState()

const { dictionary, currentDictionary, isValidWord, getWordsByFirstLetter } = useDictionary()

const inputWord = ref('')

const errorMessage = ref('')
const isBotThinking = ref(false)
const showWinnerModal = ref(false)
const winner = ref('')

// Timer color based on remaining time
const getTimerColorClass = () => {
  if (timeRemaining.value > 15) return 'border-green-500 text-green-600'
  if (timeRemaining.value > 5) return 'border-yellow-500 text-yellow-600'
  return 'border-red-500 text-red-600 animate-pulse'
}

// Handle timer timeout
const handleTimeout = () => {
  if (!currentPlayer.value) return
  
  // Skip turn if time runs out
  winner.value = currentPlayer.value.name
  showWinnerModal.value = true
  stopTimer()
}

// Check if game is active, redirect if not
onMounted(() => {
  if (!isGameActive.value) {
    navigateTo('/')
  } else if (timerEnabled.value) {
    // Start timer for first player
    startTimer(handleTimeout)
  }
})

// Cleanup timer on unmount
onUnmounted(() => {
  stopTimer()
})

// Watch for player changes and restart timer
watch(currentPlayer, (newPlayer, oldPlayer) => {
  if (newPlayer && newPlayer.id !== oldPlayer?.id && timerEnabled.value && !isBotThinking.value) {
    startTimer(handleTimeout)
  }
})

// Bot auto-play
watch([currentPlayer, isBotThinking], async ([player, thinking]) => {
  if (player?.isBot && !thinking && isGameActive.value) {
    stopTimer() // Stop timer while bot is thinking
    await playBotTurn()
  }
})

const submitWord = () => {
  errorMessage.value = ''
  const word = inputWord.value.trim().toLowerCase()

  if (!word) {
    errorMessage.value = 'Kata tidak boleh kosong!'
    return
  }

  // Check if word starts with required letter
  if (requiredFirstLetter.value && !word.startsWith(requiredFirstLetter.value)) {
    errorMessage.value = `Kata harus dimulai dengan huruf "${requiredFirstLetter.value.toUpperCase()}"!`
    return
  }

  // Check if word is valid in dictionary
  if (!isValidWord(word)) {
    errorMessage.value = 'Kata tidak ada dalam kamus!'
    return
  }

  // Check if word has been used
  if (isWordUsed(word)) {
    errorMessage.value = 'Kata sudah pernah digunakan!'
    return
  }

  // Valid word, add to history
  addToHistory(word, currentPlayer.value!.name)
  incrementScore(currentPlayer.value!.id)
  inputWord.value = ''
  nextPlayer()
}

const playBotTurn = async () => {
  isBotThinking.value = true

  const bot = new BotPlayer(
    currentDictionary.value,
    new Set(gameHistory.value.map(h => h.word.toLowerCase())),
    'medium'
  )


  const botWord = await bot.makeMove(requiredFirstLetter.value || 'a', 1500)

  if (botWord) {
    addToHistory(botWord, currentPlayer.value!.name)
    incrementScore(currentPlayer.value!.id)
    nextPlayer()
  } else {
    // Bot loses
    winner.value = currentPlayer.value!.name
    showWinnerModal.value = true
  }

  isBotThinking.value = false
}

const confirmQuit = () => {
  if (confirm('Apakah Anda yakin ingin keluar dari permainan?')) {
    backToHome()
  }
}

const playAgain = () => {
  showWinnerModal.value = false
  navigateTo('/')
  resetGame()
}

const backToHome = () => {
  resetGame()
  navigateTo('/')
}

const formatTime = (date: Date) => {
  return new Date(date).toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>
