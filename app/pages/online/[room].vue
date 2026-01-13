<template>
  <div class="min-h-screen p-4">
    <div class="max-w-6xl mx-auto">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Online Room {{ roomId }}
        </h1>
        <NuxtLink to="/" class="btn-secondary">
          <Icon name="mdi:home" class="inline mr-2" /> Home
        </NuxtLink>
      </div>

      <div v-if="pending" class="text-center py-10 text-gray-500">
        <Icon name="mdi:loading" class="animate-spin text-4xl inline" /> Loading room...
      </div>

      <div v-else-if="error" class="text-center py-10 text-red-500">
        {{ error }}
      </div>

      <div v-else>
        <!-- Waiting Room -->
        <div v-if="room.status === 'waiting'" class="card max-w-2xl mx-auto text-center py-12">
          <Icon name="mdi:sofa" class="text-6xl text-purple-200 mb-4" />
          <h2 class="text-3xl font-bold text-gray-800 mb-2">Waiting Room</h2>
          <p class="text-gray-600 mb-6">Share this room code with your friends</p>
          
          <div class="inline-block bg-purple-50 border-2 border-purple-200 rounded-xl px-6 py-3 mb-8">
            <p class="text-sm text-purple-600 font-bold uppercase tracking-wider mb-1">Room Code</p>
            <p class="text-4xl font-mono font-bold text-purple-800 tracking-widest">{{ roomId }}</p>
          </div>

          <div class="mb-8">
            <h3 class="font-bold text-lg mb-4 text-gray-700">
              Players Joined <span class="bg-gray-100 px-2 py-1 rounded text-sm ml-2">{{ room.players.length }} / 6</span>
            </h3>
            <div class="flex flex-wrap justify-center gap-3">
              <div v-for="p in room.players" :key="p.id" class="flex items-center gap-2 bg-white border border-gray-200 shadow-sm px-4 py-2 rounded-full">
                <div class="w-2 h-2 rounded-full bg-green-500"></div>
                <span class="font-semibold">{{ p.name }}</span>
                <span v-if="p.isHost" class="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-bold">HOST</span>
                <span v-if="p.id === playerId" class="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">YOU</span>
              </div>
            </div>
          </div>

          <div v-if="isHost" class="space-y-3">
            <button 
              @click="handleStartGame" 
              class="btn-primary w-full max-w-xs text-lg py-4 shadow-xl hover:shadow-2xl transition-all disabled:opacity-50 disabled:shadow-none"
              :disabled="room.players.length < 2 || startPending"
            >
              <Icon v-if="startPending" name="mdi:loading" class="animate-spin mr-2" />
              <Icon v-else name="mdi:play" class="mr-2" />
              Start Game
            </button>
            <p v-if="room.players.length < 2" class="text-sm text-gray-500">
              Need at least 2 players to start
            </p>
          </div>
          <div v-else class="text-center space-y-2">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <p class="text-gray-500 font-medium">Waiting for host to start the game...</p>
          </div>
        </div>

        <!-- Game Interface -->
        <div v-else class="grid lg:grid-cols-3 gap-6">

        <!-- Players -->
        <div class="card">
          <div class="flex justify-between items-center mb-3">
            <h3 class="text-xl font-bold text-gray-800">Players</h3>
            <span class="text-sm text-gray-500">{{ room.players.length }} / 6</span>
          </div>
          <div class="space-y-2">
            <div
              v-for="p in room.players"
              :key="p.id"
              class="flex items-center justify-between p-3 rounded-xl"
              :class="p.id === room.players[room.currentPlayerIndex]?.id ? 'bg-purple-100 border-2 border-purple-500' : 'bg-gray-50'"
            >
              <div>
                <p class="font-semibold">{{ p.name }}</p>
                <p v-if="p.isHost" class="text-xs text-gray-500">Host</p>
              </div>
              <span class="text-purple-600 font-bold text-xl">{{ p.score }}</span>
            </div>
          </div>
        </div>

        <!-- Game area -->
        <div class="lg:col-span-2 space-y-4">
          <div class="card">
            <div class="flex flex-wrap gap-4 justify-between items-center">
              <div>
                <p class="text-sm text-gray-600">Turn</p>
                <p class="font-bold text-lg text-purple-600">
                  {{ room.players[room.currentPlayerIndex]?.name }}
                </p>
              </div>
              <div v-if="room.timerEnabled" class="text-center">
                <p class="text-sm text-gray-600">Time Remaining</p>
                <p class="text-2xl font-bold text-blue-600">{{ room.timeRemaining ?? '-' }}s</p>
              </div>
              <div>
                <p class="text-sm text-gray-600">Dictionary</p>
                <p class="font-bold text-lg">{{ room.dictionaryLanguage === 'id' ? 'Bahasa Indonesia' : 'English' }}</p>
              </div>
              <div v-if="lastWord">
                <p class="text-sm text-gray-600">Last Word</p>
                <p class="font-bold text-lg text-pink-600">{{ lastWord }}</p>
              </div>
              <div v-if="requiredFirstLetter">
                <p class="text-sm text-gray-600">Must Start With</p>
                <p class="text-3xl font-bold text-blue-600 uppercase">{{ requiredFirstLetter }}</p>
              </div>
            </div>
          </div>

          <div class="card">
            <h3 class="text-xl font-bold text-gray-800 mb-3">Enter Word</h3>
            <div v-if="!isMyTurn" class="text-gray-500 text-sm mb-2">Waiting for your turn...</div>
            <form @submit.prevent="submitWord" class="space-y-3">
              <input
                v-model="inputWord"
                type="text"
                placeholder="Your word"
                class="input-field"
                :disabled="!isMyTurn"
              />
              <p v-if="errorMsg" class="text-red-500 text-sm">{{ errorMsg }}</p>
              <button type="submit" class="btn-primary w-full" :disabled="!isMyTurn || !inputWord.trim()">
                <Icon name="mdi:send" class="inline mr-2" /> Send
              </button>
            </form>
          </div>

          <div class="card">
            <h3 class="text-xl font-bold text-gray-800 mb-3">History</h3>
            <div class="max-h-80 overflow-y-auto space-y-2">
              <div v-for="(h, idx) in [...room.gameHistory].reverse()" :key="idx" class="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl flex justify-between">
                <div>
                  <p class="font-semibold text-purple-600">{{ h.word }}</p>
                  <p class="text-sm text-gray-600">{{ h.playerName }}</p>
                </div>
                <p class="text-xs text-gray-400">{{ formatTime(h.timestamp) }}</p>
              </div>
              <div v-if="room.gameHistory.length === 0" class="text-center text-gray-400 py-6">No words yet</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Game Over Modal -->
      <div v-if="room && !room.isActive" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="card max-w-md mx-4 text-center">
          <Icon v-if="isWinner" name="mdi:trophy" class="text-8xl text-yellow-500 mx-auto mb-4" />
          <Icon v-else name="mdi:emoticon-sad" class="text-8xl text-gray-400 mx-auto mb-4" />
          
          <h2 class="text-3xl font-bold mb-4" :class="isWinner ? 'text-green-600' : 'text-red-600'">
            {{ isWinner ? 'You Won!' : 'Game Over!' }}
          </h2>
          
          <p class="text-xl mb-6">
            <span v-if="winnerName">Winner: <span class="font-bold text-purple-600">{{ winnerName }}</span></span>
            <span v-else>Game Ended (Timeout)</span>
          </p>
          
          <div class="flex flex-col gap-3">
            <button v-if="isHost" @click="handleRetryGame" class="btn-success w-full py-3 shadow-lg transform hover:scale-105 transition-all">
              <Icon name="mdi:replay" class="inline mr-2 text-xl" /> 
              <span class="font-bold">Retry Game</span>
            </button>
            <NuxtLink to="/" class="btn-primary w-full py-3 shadow-lg transform hover:scale-105 transition-all block">
              <Icon name="mdi:home" class="inline mr-2 text-xl" /> 
              <span class="font-bold">Back to Home</span>
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
</template>

<script setup lang="ts">
const route = useRoute()

const roomId = route.params.room as string
const playerId = route.query.playerId as string

const inputWord = ref('')
const errorMsg = ref('')
const room = ref<any>(null)
const pending = ref(true)
const error = ref<string | null>(null)
const pollInterval = ref<NodeJS.Timeout | null>(null)

const lastWord = computed(() => room.value?.gameHistory?.at(-1)?.word || null)
const requiredFirstLetter = computed(() => {
  if (!lastWord.value) return null
  return lastWord.value.slice(-1)
})
const isMyTurn = computed(() => room.value?.status === 'playing' && room.value?.players?.[room.value.currentPlayerIndex]?.id === playerId)
const isHost = computed(() => room.value?.players?.find((p: any) => p.id === playerId)?.isHost)
const isWinner = computed(() => room.value?.winnerId === playerId)
const startPending = ref(false)

const winnerName = computed(() => {
  if (!room.value || !room.value.winnerId) return null
  const winner = room.value.players.find((p: any) => p.id === room.value.winnerId)
  return winner ? winner.name : null
})

const handleStartGame = async () => {
  if (!room.value || room.value.players.length < 2) return
  startPending.value = true
  try {
    const res: any = await $fetch(`/api/rooms/${roomId}/start`, {
      method: 'POST',
      body: { playerId }
    })
    room.value = res
  } catch (err: any) {
    alert(err?.data?.message || 'Failed to start game')
  } finally {
    startPending.value = false
  }
}

const handleRetryGame = async () => {
  try {
    const res: any = await $fetch(`/api/rooms/${roomId}/retry`, {
      method: 'POST',
      body: { playerId }
    })
    room.value = res
  } catch (err: any) {
    alert(err?.data?.message || 'Failed to retry game')
  }
}

const fetchRoom = async () => {

  try {
    const data = await $fetch(`/api/rooms/${roomId}`)
    room.value = data
    pending.value = false
    error.value = null
  } catch (err: any) {
    error.value = err?.data?.message || 'Failed to load room'
    pending.value = false
  }
}

const submitWord = async () => {
  if (!inputWord.value.trim()) return
  errorMsg.value = ''
  try {
    const res: any = await $fetch(`/api/rooms/${roomId}/play`, {
      method: 'POST',
      body: { playerId, word: inputWord.value }
    })
    if (res.error) {
      errorMsg.value = res.error === 'WRONG_LETTER' && res.required
        ? `Must start with ${res.required}`
        : res.error
      return
    }
    room.value = res
    inputWord.value = ''
  } catch (err: any) {
    errorMsg.value = err?.data?.message || 'Failed to submit'
  }
}

const formatTime = (ts: number) => new Date(ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

onMounted(async () => {
  if (!playerId) {
    error.value = 'playerId missing'; pending.value = false; return
  }
  await fetchRoom()
  pollInterval.value = setInterval(fetchRoom, 2000)
})

onUnmounted(() => {
  if (pollInterval.value) clearInterval(pollInterval.value)
})
</script>
