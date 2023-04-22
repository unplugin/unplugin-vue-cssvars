import { resolve } from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { viteVueCSSVars } from '../../dist'
// https://vitejs.dev/config/
export default defineConfig({
  build: {
    sourcemap: true,
    cssCodeSplit: false,
    minify: false,
    /* lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: 'src/main.ts',
      name: 'index',
      // the proper extensions will be added
      fileName: 'index',
    },
    rollupOptions: {
      // 确保外部化处理那些你不想打包进库的依赖
      external: ['vue'],
      output: {
        // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
        globals: {
          vue: 'Vue',
        },
      },
    }, */
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  plugins: [
    vue(),
    vueJsx(),
    viteVueCSSVars({
      include: [/.vue/],
      includeCompile: ['**/**.scss', '**/**.css'],
      alias: {
        '@': resolve(__dirname, './src'),
      },
    }),
  ],
})
