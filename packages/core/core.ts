import { createUnplugin } from 'unplugin'
import { NAME } from '@unplugin-vue-cssvars/utils'

const unplugin = createUnplugin(
  () => {
    return {
      name: NAME,
    }
  })

export const viteWindiCSS = unplugin.vite
export const rollupWindiCSS = unplugin.rollup
export const webpackWindiCSS = unplugin.webpack
export const esbuildWindiCSS = unplugin.esbuild
