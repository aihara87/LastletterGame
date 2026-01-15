// Mock Nuxt auto-imports
import { ref, computed, onMounted, onUnmounted } from 'vue'

export { ref, computed, onMounted, onUnmounted }

export const useRoute = () => ({
  params: {},
  query: {}
})

export const useRouter = () => ({
  push: () => {},
  replace: () => {}
})

export const navigateTo = () => {}

export const useCookie = () => ref(null)

export const $fetch = async () => ({})
