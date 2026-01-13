<template>
  <div class="min-h-screen flex items-center justify-center p-4">
    <div class="max-w-md w-full">
      <div class="card">
        <div class="text-center mb-8">
          <Icon name="mdi:shield-lock" class="text-6xl text-purple-600 mx-auto mb-4" />
          <h1 class="text-3xl font-bold text-gray-800">Admin Login</h1>
          <p class="text-gray-600 mt-2">Masuk ke dashboard admin</p>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-4">
          <div>
            <label class="block text-gray-700 font-semibold mb-2">Username</label>
            <input
              v-model="username"
              type="text"
              placeholder="Masukkan username"
              class="input-field"
              required
            />
          </div>

          <div>
            <label class="block text-gray-700 font-semibold mb-2">Password</label>
            <input
              v-model="password"
              type="password"
              placeholder="Masukkan password"
              class="input-field"
              required
            />
          </div>

          <div v-if="errorMessage" class="p-3 bg-red-100 border border-red-400 text-red-700 rounded-xl">
            {{ errorMessage }}
          </div>

          <button type="submit" class="btn-primary w-full">
            <Icon name="mdi:login" class="inline mr-2" />
            Masuk
          </button>
        </form>

        <div class="mt-6 text-center">
          <NuxtLink to="/" class="text-purple-600 hover:text-purple-700 font-semibold">
            <Icon name="mdi:arrow-left" class="inline mr-1" />
            Kembali ke Game
          </NuxtLink>
        </div>

        <div class="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-xl">
          <p class="text-sm text-blue-800">
            <strong>Demo Credentials:</strong><br />
            Username: admin<br />
            Password: admin123
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { login, isAuthenticated } = useAuth()

const username = ref('')
const password = ref('')
const errorMessage = ref('')

// Redirect if already authenticated
onMounted(() => {
  if (isAuthenticated.value) {
    navigateTo('/admin/dashboard')
  }
})

const handleLogin = () => {
  errorMessage.value = ''
  
  const success = login(username.value, password.value)
  
  if (success) {
    navigateTo('/admin/dashboard')
  } else {
    errorMessage.value = 'Username atau password salah!'
    password.value = ''
  }
}
</script>
