<template>
  <div class="relative inline-block">
    <button
      @click="toggleLanguage"
      class="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border-2 border-purple-200 hover:border-purple-400"
    >
      <Icon :name="currentLanguage === 'id' ? 'twemoji:flag-indonesia' : 'twemoji:flag-united-states'" class="text-2xl" />
      <span class="font-semibold text-gray-700">
        {{ currentLanguage === 'id' ? 'ID' : 'EN' }}
      </span>
      <Icon name="mdi:chevron-down" class="text-gray-500" />
    </button>

    <!-- Tooltip -->
    <div class="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 whitespace-nowrap bg-gray-800 text-white text-sm px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
      {{ currentLanguage === 'id' ? 'Switch to English' : 'Ganti ke Bahasa Indonesia' }}
    </div>
  </div>
</template>

<script setup lang="ts">
const { currentLanguage, toggleLanguage } = useLanguage()
</script>
