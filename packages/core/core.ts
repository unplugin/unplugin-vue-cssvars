import { createUnplugin } from 'unplugin'
import { NAME } from '@unplugin-vue-cssvars/utils'
import { createFilter } from '@rollup/pluginutils'
import { parse } from '@vue/compiler-sfc'
import { preProcessCSS } from './css/pre-process-css'
import { createCSSModule } from './css/process-css'
import { initOption } from './option'
import { getVariable } from './get-variable'
import { injectCSSVars } from './inject/inject-cssvars'
import type { UnpluginOptions } from 'unplugin'
import type { Options } from './types'

const unplugin = createUnplugin<Options>(
  (options: Options): UnpluginOptions => {
    const userOptions = initOption(options)
    const filter = createFilter(
      userOptions.include,
      userOptions.exclude,
    )
    // 预处理 css 文件
    const preProcessCSSRes = preProcessCSS(userOptions)
    return {
      name: NAME,
      enforce: 'pre',

      transformInclude(id) {
        return filter(id)
      },

      async transform(code, id) {
        try {
          // TODO: 只支持 sfc ？
          if (id.endsWith('.vue')) {
            const { descriptor } = parse(code)
            const importCSSModule = createCSSModule(descriptor, id, preProcessCSSRes)
            const variableName = getVariable(descriptor)
            code = injectCSSVars(code, importCSSModule, variableName)
            console.log(code)
          }
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
