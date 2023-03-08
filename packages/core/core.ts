import { createUnplugin } from 'unplugin'
import { NAME } from '@unplugin-vue-cssvars/utils'
import { createFilter } from '@rollup/pluginutils'
import type { UnpluginOptions } from 'unplugin'
import type { FilterPattern } from '@rollup/pluginutils'
export interface Options {
  include?: FilterPattern
  exclude?: FilterPattern
}
const unplugin = createUnplugin<Options>(
  (userOptions = {}): UnpluginOptions => {
    const filter = createFilter(userOptions.include, userOptions.exclude)

    return {
      name: NAME,
      enforce: 'pre',

      transformInclude(id) {
        return filter(id)
      },

      transform(code, id) {
        try {
          if (code.includes('__name: \'App\','))
            code = code.replace('__name: \'App\',', '__name: \'AppTransform\',')
          console.log(code, id)
          return code
        } catch (err: unknown) {
          this.error(`${name} ${err}`)
        }
      },
    }
  })

export const viteVueCSSVars = unplugin.vite
export const rollupVueCSSVars = unplugin.rollup
export const webpackVueCSSVars = unplugin.webpack
export const esbuildVueCSSVars = unplugin.esbuild
