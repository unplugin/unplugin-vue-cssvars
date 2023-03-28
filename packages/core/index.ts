import { createUnplugin } from 'unplugin'
import { NAME } from '@unplugin-vue-cssvars/utils'
import { createFilter } from '@rollup/pluginutils'
import { parse } from '@vue/compiler-sfc'
import { preProcessCSS } from './runtime/pre-process-css'
import { createCSSModule } from './runtime/process-css'
import { initOption } from './option'
import { getVariable } from './parser/parser-variable'
import { injectCSSVars } from './inject/inject-cssvars'
import { revokeCSSVars } from './inject/revoke-cssvars'
import type { IBundle, Options } from './types'

import type { OutputOptions } from 'rollup'

const unplugin = createUnplugin<Options>(
  (options: Options): any => {
    const userOptions = initOption(options)
    const filter = createFilter(
      userOptions.include,
      userOptions.exclude,
    )
    // 预处理 css 文件
    const preProcessCSSRes = preProcessCSS(userOptions)
    return [{
      name: NAME,
      enforce: 'pre',

      transformInclude(id: string) {
        return filter(id)
      },

      async transform(code: string, id: string) {
        try {
          // ⭐TODO: 只支持 .vue ? jsx, tsx, js, ts ？
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
    },
    {
      name: `${NAME}:revoke-inject`,
      async writeBundle(options: OutputOptions, bundle: IBundle) {
        if (userOptions.revoke)
          await revokeCSSVars(options, bundle)
      },
    }]
  })

export const viteVueCSSVars = unplugin.vite
export const rollupVueCSSVars = unplugin.rollup
export const webpackVueCSSVars = unplugin.webpack
export const esbuildVueCSSVars = unplugin.esbuild
