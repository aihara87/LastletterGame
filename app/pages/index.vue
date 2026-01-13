<template>
  <div class="min-h-screen flex flex-col items-center justify-center p-4">
    <div class="max-w-4xl w-full">
      <!-- Language Switcher -->
      <div class="flex justify-end mb-4">
        <LanguageSwitcher />
      </div>

      <!-- Header -->
      <div class="text-center mb-12 animate-fade-in">
        <h1 class="text-6xl font-bold mb-4 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
          {{ t('app.title') }}
        </h1>
        <p class="text-xl text-gray-600">
          {{ t('app.subtitle') }}
        </p>
      </div>

      <!-- Mode Selection -->
      <div class="grid md:grid-cols-3 gap-6 mb-8">
        <!-- PvP Mode -->
        <div class="game-card cursor-pointer group" @click="selectMode('pvp')">
          <div class="flex flex-col items-center">
            <Icon name="mdi:account-multiple" class="text-6xl text-purple-600 mb-4 group-hover:scale-110 transition-transform" />
            <h3 class="text-2xl font-bold text-gray-800 mb-2">{{ t('mode.multiplayer') }}</h3>
            <p class="text-gray-600 text-center">
              {{ t('mode.multiplayer.desc') }}
            </p>
          </div>
        </div>

        <!-- Bot Mode -->
        <div class="game-card cursor-pointer group" @click="selectMode('bot')">
          <div class="flex flex-col items-center">
            <Icon name="mdi:robot" class="text-6xl text-pink-600 mb-4 group-hover:scale-110 transition-transform" />
            <h3 class="text-2xl font-bold text-gray-800 mb-2">{{ t('mode.bot') }}</h3>
            <p class="text-gray-600 text-center">
              {{ t('mode.bot.desc') }}
            </p>
          </div>
        </div>

        <!-- Online Mode -->
        <div class="game-card cursor-pointer group" @click="selectMode('online')">
          <div class="flex flex-col items-center">
            <Icon name="mdi:web" class="text-6xl text-blue-600 mb-4 group-hover:scale-110 transition-transform" />
            <h3 class="text-2xl font-bold text-gray-800 mb-2">Online</h3>
            <p class="text-gray-600 text-center">
              Bermain jarak jauh dengan teman
            </p>
          </div>
        </div>
      </div>

      <!-- Player Setup (shown after mode selection) -->
      <div v-if="selectedMode" class="card mb-6 animate-slide-up">
        <h3 class="text-2xl font-bold text-gray-800 mb-4">
          {{ selectedMode === 'pvp' ? t('setup.player') : t('setup.game') }}
        </h3>

        <!-- Dictionary Language Selection -->
        <div class="mb-6 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-200">
          <div class="flex items-center justify-between mb-3">
            <div>
              <p class="text-sm text-emerald-700 font-semibold">{{ t('dict.language') }}</p>
              <p class="text-xs text-emerald-600">{{ t('dict.language.desc') }}</p>
            </div>
            <Icon name="mdi:translate" class="text-2xl text-emerald-700" />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <button
              @click="setDictionaryLanguage('id')"
              :class="[
                'w-full px-4 py-3 rounded-xl border transition-all',
                dictionaryLanguage === 'id'
                  ? 'bg-emerald-500 text-white border-emerald-600 shadow-lg scale-[1.02]'
                  : 'bg-white text-emerald-700 border-emerald-200 hover:border-emerald-400'
              ]"
            >
              <span class="flex items-center justify-center gap-2 font-semibold">
                <Icon name="twemoji:flag-indonesia" class="text-xl" />
                {{ t('dict.language.id') }}
              </span>
            </button>
            <button
              @click="setDictionaryLanguage('en')"
              :class="[
                'w-full px-4 py-3 rounded-xl border transition-all',
                dictionaryLanguage === 'en'
                  ? 'bg-emerald-500 text-white border-emerald-600 shadow-lg scale-[1.02]'
                  : 'bg-white text-emerald-700 border-emerald-200 hover:border-emerald-400'
              ]"
            >
              <span class="flex items-center justify-center gap-2 font-semibold">
                <Icon name="twemoji:flag-united-states" class="text-xl" />
                {{ t('dict.language.en') }}
              </span>
            </button>
          </div>
        </div>

        <!-- PvP Setup -->
        <div v-if="selectedMode === 'pvp'" class="space-y-4">
          <div v-for="(player, index) in playerNames" :key="index" class="flex gap-2">
            <input
              v-model="playerNames[index]"
              type="text"
              :placeholder="`Nama Pemain ${index + 1}`"
              class="input-field"
            />
            <button
              v-if="playerNames.length > 2"
              @click="removePlayer(index)"
              class="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
            >
              <Icon name="mdi:delete" class="text-xl" />
            </button>
          </div>
          
          <button
            v-if="playerNames.length < 6"
            @click="addPlayer"
            class="btn-secondary w-full"
          >
            <Icon name="mdi:plus" class="inline mr-2" />
            Tambah Pemain
          </button>
        </div>


        <!-- Timer Setup (for both modes) -->
        <div class="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2">
              <Icon name="mdi:timer" class="text-2xl text-blue-600" />
              <label class="text-gray-700 font-semibold">Aktifkan Timer</label>
            </div>
            <button
              @click="timerEnabled = !timerEnabled"
              class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
              :class="timerEnabled ? 'bg-blue-600' : 'bg-gray-300'"
            >
              <span
                class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                :class="timerEnabled ? 'translate-x-6' : 'translate-x-1'"
              />
            </button>
          </div>

          <div v-if="timerEnabled" class="space-y-3">
            <div>
              <label class="block text-gray-700 font-semibold mb-2">
                Waktu per Giliran: {{ timerDuration }} detik
              </label>
              <input
                v-model.number="timerDuration"
                type="range"
                min="10"
                max="120"
                step="5"
                class="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
              />
              <div class="flex justify-between text-xs text-gray-500 mt-1">
                <span>10s</span>
                <span>30s</span>
                <span>60s</span>
                <span>120s</span>
              </div>
            </div>
            <p class="text-sm text-gray-600">
              <Icon name="mdi:information" class="inline" />
              Timer akan dimulai setiap giliran pemain. Jika waktu habis, giliran akan dilewati.
            </p>
          </div>
        </div>

        <button
          v-if="selectedMode !== 'online'"
          @click="startGame"
          :disabled="!canStartGame"
          class="btn-primary w-full mt-6"
          :class="{ 'opacity-50 cursor-not-allowed': !canStartGame }"
        >
          <Icon name="mdi:play" class="inline mr-2" />
          Mulai Permainan
        </button>

        <div v-else class="space-y-3 mt-4">
          <div class="p-4 bg-blue-50 rounded-xl border border-blue-200">
            <p class="font-semibold text-blue-800 mb-2">Online Mode</p>
            <p class="text-sm text-blue-700">Buat room baru atau gabung dengan kode.</p>
          </div>
          <div class="grid md:grid-cols-2 gap-3">
            <input v-model="playerNames[0]" class="input-field" placeholder="Your name" />
            <input v-model="joinRoomId" class="input-field" placeholder="Room code (join)" />
          </div>
          <div class="grid md:grid-cols-2 gap-3">
            <button class="btn-primary w-full" :disabled="!playerNames[0].trim()" @click="createOnlineRoom">
              <Icon name="mdi:plus" class="inline mr-2" /> Create Room
            </button>
            <button class="btn-secondary w-full" :disabled="!playerNames[0].trim() || !joinRoomId.trim()" @click="joinOnlineRoom">
              <Icon name="mdi:login" class="inline mr-2" /> Join Room
            </button>
          </div>
          <p v-if="onlineError" class="text-red-500 text-sm">{{ onlineError }}</p>
        </div>
      </div>

      <!-- Admin Link -->
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useLanguage()
const { dictionaryLanguage, setDictionaryLanguage } = useDictionary()

const selectedMode = ref<'pvp' | 'bot' | 'online' | null>(null)
const playerNames = ref<string[]>(['', ''])
const botDifficulty = ref<'easy' | 'medium' | 'hard'>('medium')
const timerEnabled = ref(false)
const timerDuration = ref(30)

const canStartGame = computed(() => {
  if (selectedMode.value === 'online') return playerNames.value[0].trim().length > 0
  if (selectedMode.value === 'pvp') {
    return playerNames.value.every(name => name.trim().length > 0)
  } else {
    return playerNames.value[0].trim().length > 0
  }
})

const selectMode = (mode: 'pvp' | 'bot' | 'online') => {
  selectedMode.value = mode
  if (mode === 'bot') {
    playerNames.value = ['', 'Bot AI']
  } else {
    playerNames.value = ['', '']
  }
}

const addPlayer = () => {
  if (playerNames.value.length < 6) {
    playerNames.value.push('')
  }
}

const removePlayer = (index: number) => {
  if (playerNames.value.length > 2) {
    playerNames.value.splice(index, 1)
  }
}

const joinRoomId = ref('')
const onlineError = ref('')

const startGame = () => {
  if (!canStartGame.value || selectedMode.value === 'online') return
  
  const { initGame } = useGameState()
  const mode = selectedMode.value as 'pvp' | 'bot'
  
  initGame(
    mode,
    playerNames.value.filter(name => name.trim().length > 0),
    timerEnabled.value,
    timerDuration.value
  )
  
  navigateTo('/game')
}

const createOnlineRoom = async () => {
  onlineError.value = ''
  try {
    const res: any = await $fetch('/api/rooms', {
      method: 'POST',
      body: {
        playerName: playerNames.value[0],
        dictionaryLanguage: dictionaryLanguage.value,
        timerEnabled: timerEnabled.value,
        timerDuration: timerDuration.value
      }
    })
    navigateTo(`/online/${res.room.id}?playerId=${res.playerId}`)
  } catch (err: any) {
    onlineError.value = err?.data?.message || 'Gagal membuat room'
  }
}

const joinOnlineRoom = async () => {
  onlineError.value = ''
  try {
    const res: any = await $fetch(`/api/rooms/${joinRoomId.value}/join`, {
      method: 'POST',
      body: {
        playerName: playerNames.value[0]
      }
    })
    navigateTo(`/online/${joinRoomId.value}?playerId=${res.playerId}`)
  } catch (err: any) {
    onlineError.value = err?.data?.message || 'Gagal masuk room'
  }
}
</script>


<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.6s ease-out;
}

.animate-slide-up {
  animation: slide-up 0.4s ease-out;
}
</style>
