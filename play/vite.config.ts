import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { viteVueCSSVars } from 'unplugin-vue-cssvars'
// https://vitejs.dev/config/
export default defineConfig({
  build: {
    minify: false,
  },
  plugins: [
    vue(),
    viteVueCSSVars({
      include: [/App.vue/],
    }),
  ],
})
