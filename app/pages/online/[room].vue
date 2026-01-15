<template>
  <div class="min-h-screen p-4">
    <div class="max-w-6xl mx-auto">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Online Room {{ roomId }}
        </h1>
        <button @click="handleLeave" class="btn-danger">
          <Icon name="mdi:logout" class="inline mr-2" /> Leave Room
        </button>
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
              v-for="p in sortedPlayers"
              :key="p.id"
              class="flex items-center justify-between p-3 rounded-xl transition-all duration-300"
              :class="[

                p.id === room.players[room.currentPlayerIndex]?.id ? 'bg-purple-100 border-2 border-purple-500 scale-105' : 'bg-gray-50',
                p.isEliminated ? 'opacity-60 bg-gray-100' : ''
              ]"
            >
              <div>
                <div class="flex items-center gap-2">
                  <p class="font-semibold" :class="{ 'line-through text-gray-500': p.isEliminated }">{{ p.name }}</p>
                  <div class="flex text-red-500" v-if="!p.isEliminated">
                    <Icon v-for="i in p.lives" :key="i" name="mdi:heart" class="text-xs" />
                    <Icon v-for="i in (2 - p.lives)" :key="`lost-${i}`" name="mdi:heart-outline" class="text-xs opacity-50" />
                  </div>
                </div>
                <div class="flex gap-1 flex-wrap">
                  <span v-if="p.isHost" class="text-[10px] bg-yellow-100 text-yellow-800 px-1.5 rounded">HOST</span>
                  <span v-if="p.isEliminated" class="text-[10px] bg-red-100 text-red-800 px-1.5 rounded font-bold">OUT</span>
                </div>
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
              <div v-if="room.timerEnabled" class="flex flex-col items-center">
                <p class="text-sm text-gray-600 mb-1">Time Remaining</p>
                <div 
                  class="flex items-center justify-center w-20 h-20 rounded-full border-4 transition-all duration-300"
                  :class="getTimerColorClass()"
                >
                  <div class="text-center">
                    <Icon 
                      name="mdi:timer-sand" 
                      class="text-2xl mb-1"
                      :class="(room.timeRemaining || 0) <= 5 ? 'animate-bounce' : ''"
                    />
                    <p class="font-bold text-xl">{{ room.timeRemaining ?? '-' }}</p>
                  </div>
                </div>
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
            
            <div v-if="amIEliminated" class="text-center py-6 bg-gray-50 rounded-xl border-2 border-gray-100">
              <Icon name="mdi:eye-outline" class="text-4xl text-gray-400 mb-2" />
              <p class="font-bold text-gray-600">You are eliminated</p>
              <p class="text-sm text-gray-500">You can still watch the game.</p>
            </div>

            <div v-else>
              <div v-if="!isMyTurn" class="text-gray-500 text-sm mb-2 flex items-center gap-2">
                <div class="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                Waiting for your turn...
              </div>
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
            <div class="bg-gray-100 p-3 rounded-lg mb-2">
              <p class="text-sm font-semibold text-gray-700 mb-2">Vote to Retry</p>
              <div class="w-full bg-gray-300 rounded-full h-2.5 mb-1">
                <div class="bg-green-600 h-2.5 rounded-full transition-all duration-500" :style="{ width: `${(voteCount / room.players.length) * 100}%` }"></div>
              </div>
              <p class="text-xs text-gray-500">{{ voteCount }} / {{ room.players.length }} votes</p>
            </div>

            <button v-if="!hasVoted" @click="handleVoteRetry" class="btn-success w-full py-3 shadow-lg transform hover:scale-105 transition-all">
              <Icon name="mdi:thumb-up" class="inline mr-2 text-xl" /> 
              <span class="font-bold">Vote Retry</span>
            </button>
            <div v-else class="text-center text-green-600 font-bold py-2 bg-green-50 rounded-lg border border-green-200">
              <Icon name="mdi:check" /> Voted
            </div>

            <button @click="handleLeave" class="btn-primary w-full py-3 shadow-lg transform hover:scale-105 transition-all block">
              <Icon name="mdi:home" class="inline mr-2 text-xl" /> 
              <span class="font-bold">Back to Home</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Leave Modal -->
      <div v-if="showLeaveModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
        <div class="card max-w-sm mx-4 w-full">
          <h3 class="text-xl font-bold mb-4">Leave Room?</h3>
          <p class="text-gray-600 mb-6">Are you sure you want to leave this room?</p>
          <div class="flex gap-3">
            <button @click="showLeaveModal = false" class="btn-secondary flex-1">Cancel</button>
            <button @click="confirmLeave" class="btn-danger flex-1">Leave</button>
          </div>
        </div>
      </div>

      <!-- Host Left Modal -->
      <div v-if="showHostLeftModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
        <div class="card max-w-sm mx-4 w-full text-center">
          <Icon name="mdi:alert-circle" class="text-6xl text-red-500 mx-auto mb-4" />
          <h3 class="text-xl font-bold mb-2">Room Closed</h3>
          <p class="text-gray-600 mb-6">The host has closed the room.</p>
          <NuxtLink to="/" class="btn-primary w-full block">Back to Home</NuxtLink>
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
const hasVoted = computed(() => room.value?.retryVotes?.includes(playerId))
const voteCount = computed(() => room.value?.retryVotes?.length || 0)
const startPending = ref(false)
const showLeaveModal = ref(false)
const showHostLeftModal = ref(false)

const getTimerColorClass = () => {
  const time = room.value?.timeRemaining || 0
  if (time > 15) return 'border-green-500 text-green-600'
  if (time > 5) return 'border-yellow-500 text-yellow-600'
  return 'border-red-500 text-red-600 animate-pulse'
}

const sortedPlayers = computed(() => {
  if (!room.value?.players) return []
  return [...room.value.players].sort((a, b) => {
    // 1. Eliminated status (Alive first)
    if (a.isEliminated !== b.isEliminated) {
      return a.isEliminated ? 1 : -1
    }
    // 2. Score (High to Low)
    return b.score - a.score
  })
})

const amIEliminated = computed(() => {
  const me = room.value?.players?.find((p: any) => p.id === playerId)
  return me?.isEliminated
})

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

const handleVoteRetry = async () => {
  try {
    const res: any = await $fetch(`/api/rooms/${roomId}/vote`, {
      method: 'POST',
      body: { playerId }
    })
    room.value = res
  } catch (err: any) {
    alert(err?.data?.message || 'Failed to vote')
  }
}

const handleLeave = () => {
  showLeaveModal.value = true
}

const confirmLeave = async () => {
  try {
    await $fetch(`/api/rooms/${roomId}/leave`, {
      method: 'POST',
      body: { playerId }
    })
  } catch (e) {
    console.error('Failed to leave room', e)
  }
  navigateTo('/')
}

const fetchRoom = async (useHeartbeat = false) => {
  try {
    let data
    if (useHeartbeat && playerId) {
      // Use heartbeat to update lastSeen and get room state
      data = await $fetch(`/api/rooms/${roomId}/heartbeat`, {
        method: 'POST',
        body: { playerId }
      })
    } else {
      // Initial fetch without heartbeat
      data = await $fetch(`/api/rooms/${roomId}`)
    }
    room.value = data
    pending.value = false
    error.value = null
  } catch (err: any) {
    if (err.statusCode === 404) {
      if (pollInterval.value) clearInterval(pollInterval.value)
      showHostLeftModal.value = true
      return
    }
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
  await fetchRoom(false) // Initial fetch without heartbeat
  pollInterval.value = setInterval(() => fetchRoom(true), 2000) // Use heartbeat for polling
})

onUnmounted(() => {
  if (pollInterval.value) clearInterval(pollInterval.value)
})
</script>
