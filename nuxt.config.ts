// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],

  components: [
    {
      path: '~/components',
      pathPrefix: false,
    },
    {
      path: '~/components/ui',
      pathPrefix: false,
    },
    {
      path: '~/components/ui/badges',
      pathPrefix: false,
    },
    {
      path: '~/components/ui/headers',
      pathPrefix: false,
    },
    {
      path: '~/components/ui/summaries',
      pathPrefix: false,
    },
  ],

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  modules: ['nuxt-fathom', '@nuxt/image', '@nuxtjs/device', '@nuxt/eslint'],

  nitro: {
    storage: {
      data: { driver: 'vercelKV' },
    },
  },

  eslint: {
    config: {
      stylistic: true,
    },
  },

  fathom: {
    siteId: 'FVFGOFSG',
  },

  compatibilityDate: '2024-07-12',

  runtimeConfig: {
    coinGeckoApiKey: process.env.COINGECKO_API_KEY || 'default_secret',
  },
})
