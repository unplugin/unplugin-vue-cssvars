import { createUnplugin } from 'unplugin'
import { NAME } from '@unplugin-vue-cssvars/utils'
import { createFilter } from '@rollup/pluginutils'
import { parse } from '@vue/compiler-sfc'
import { preProcessCSS } from './runtime/pre-process-css'
import { getVBindVariableListByPath } from './runtime/process-css'
import { initOption } from './option'
import { getVariable, matchVariable } from './parser'
import {
  injectCSSVars,
  injectCssOnBuild,
  injectCssOnServer,
} from './inject'
import type { TMatchVariable } from './parser'
import type { Options } from './types'

const unplugin = createUnplugin<Options>(
  (options: Options = {}): any => {
    const userOptions = initOption(options)
    const filter = createFilter(
      userOptions.include,
      userOptions.exclude,
    )
    // 预处理 css 文件
    const CSSFileModuleMap = preProcessCSS(userOptions)
    const vbindVariableList = new Map<string, TMatchVariable>()
    let isScriptSetup = false
    return [
      {
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
              isScriptSetup = !!descriptor.scriptSetup
              const {
                vbindVariableListByPath,
                injectCSSContent,
              } = getVBindVariableListByPath(descriptor, id, CSSFileModuleMap, !!userOptions.dev)
              const variableName = getVariable(descriptor)
              vbindVariableList.set(id, matchVariable(vbindVariableListByPath, variableName))

              if (!userOptions.dev)
                code = injectCssOnBuild(code, injectCSSContent, descriptor)
            }
            return code
          } catch (err: unknown) {
            this.error(`${NAME} ${err}`)
          }
        },
      },
      {
        name: `${NAME}:inject`,
        enforce: 'post',
        async transform(code: string, id: string) {
          // ⭐TODO: 只支持 .vue ? jsx, tsx, js, ts ？
          try {
            // transform in dev
            if (userOptions.dev) {
              if (id.endsWith('.vue')) {
                const injectRes = injectCSSVars(code, vbindVariableList.get(id), isScriptSetup)
                code = injectRes.code
                injectRes.vbindVariableList && vbindVariableList.set(id, injectRes.vbindVariableList)
              }
              if (id.includes('type=style'))
                code = injectCssOnServer(code, vbindVariableList.get(id.split('?vue')[0]))
            }
            return code
          } catch (err: unknown) {
            this.error(`${NAME} ${err}`)
          }
        },
      },
    ]
  })

export const viteVueCSSVars = unplugin.vite
export const rollupVueCSSVars = unplugin.rollup
export const webpackVueCSSVars = unplugin.webpack
export const esbuildVueCSSVars = unplugin.esbuild
