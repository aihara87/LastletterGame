<template>
  <div class="min-h-screen p-4">
    <div class="max-w-6xl mx-auto">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Online Rooms
        </h1>
        <NuxtLink to="/" class="btn-secondary">
          <Icon name="mdi:home" class="inline mr-2" /> Home
        </NuxtLink>
      </div>

      <div class="card">
        <h3 class="text-xl font-bold mb-3">Available Rooms</h3>
        <div v-if="pending" class="text-gray-500 flex items-center gap-2">
          <Icon name="mdi:loading" class="animate-spin" /> Loading...
        </div>
        <div v-else-if="rooms.length === 0" class="text-gray-500">No rooms available. Create one from Home.</div>
        <div v-else class="grid md:grid-cols-2 gap-3">
          <div v-for="r in rooms" :key="r.id" class="p-4 rounded-xl border bg-white shadow-sm">
            <p class="font-bold text-lg">Room {{ r.id }}</p>
            <p class="text-sm text-gray-600">Players: {{ r.players }} / 6</p>
            <p class="text-sm text-gray-600">Dict: {{ r.dictionaryLanguage === 'id' ? 'ID' : 'EN' }}</p>
            <p class="text-sm text-gray-600">Timer: {{ r.timerEnabled ? r.timerDuration + 's' : 'Off' }}</p>
            <NuxtLink :to="`/online/${r.id}`" class="btn-primary w-full mt-3 text-center block">View</NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { data, pending } = useAsyncData('rooms-list', () => $fetch('/api/rooms'))
const rooms = computed(() => data.value || [])
</script>
