<template>
  <div>
    <NuxtPage />
  </div>
</template>

<script setup lang="ts">
import type { Word } from '~/composables/useDictionary'

const { dictionary } = useDictionary()

// Fetch dictionary on app init (blocking to ensure data is available)
const { data } = await useFetch<Word[]>('/api/dictionary')

if (data.value) {
  dictionary.value = data.value.map(w => ({
    ...w,
    createdAt: new Date(w.createdAt)
  }))
}
</script>
