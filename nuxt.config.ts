// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss', '@nuxt/icon'],
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      title: 'Last Letter Game',
      meta: [
        { name: 'description', content: 'Game Last Letter - Asah kemampuan kosakata Anda!' }
      ]
    }
  },
  nitro: {
    serverAssets: [{
      baseName: 'migrations',
      dir: './server/database/migrations'
    }]
  },
  test: {
    environment: 'jsdom',
    deps: {
      inline: [/vue/, /@nuxt/]
    }
  }
})
