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
const isMyTurn = computed(() => room.value?.players?.[room.value.currentPlayerIndex]?.id === playerId)

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
