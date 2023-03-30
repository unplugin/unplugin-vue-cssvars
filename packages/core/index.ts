import { createUnplugin } from 'unplugin'
import { NAME } from '@unplugin-vue-cssvars/utils'
import { createFilter } from '@rollup/pluginutils'
import { parse } from '@vue/compiler-sfc'
import { preProcessCSS } from './runtime/pre-process-css'
import { getVBindVariableListByPath } from './runtime/process-css'
import { initOption } from './option'
import { getVariable, matchVariable } from './parser'
import { injectCSSVars } from './inject/inject-cssvars'
import { injectCssOnBuild, injectCssOnServer } from './inject/inject-css'
import type { TMatchVariable } from './parser'
import type { IBundle, Options } from './types'

import type { OutputOptions } from 'rollup'

const unplugin = createUnplugin<Options>(
  (options: Options = {}): any => {
    const userOptions = initOption(options)
    const filter = createFilter(
      userOptions.include,
      userOptions.exclude,
    )
    // 预处理 css 文件
    const CSSFileModuleMap = preProcessCSS(userOptions)
    let vbindVariableList: TMatchVariable = []
    const curSFCScopeId = ''
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
              const vbindVariableListByPath = getVBindVariableListByPath(descriptor, id, CSSFileModuleMap)
              const variableName = getVariable(descriptor)
              vbindVariableList = matchVariable(vbindVariableListByPath, variableName)
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
          debugger
          // ⭐TODO: 只支持 .vue ? jsx, tsx, js, ts ？
          try {
            // transform in dev
            if (userOptions.dev) {
              if (id.endsWith('.vue')) {
                const injectRes = injectCSSVars(code, vbindVariableList, isScriptSetup, userOptions.dev)
                code = injectRes.code
                vbindVariableList = injectRes.vbindVariableList
              }
              if (id.includes('type=style'))
                code = injectCssOnServer(code, vbindVariableList)
            } else {
              // transform in build
              if (id.includes('type=script') || id.endsWith('.vue')) {
                const injectRes = injectCSSVars(code, vbindVariableList, isScriptSetup, userOptions.dev)
                code = injectRes.code
                vbindVariableList = injectRes.vbindVariableList
              }
            }

            return code
          } catch (err: unknown) {
            this.error(`${NAME} ${err}`)
          }
        },

        async writeBundle(options: OutputOptions, bundle: IBundle) {
          // just only run in build
         //  injectCssOnBuild(options, bundle, vbindVariableList)
         //  console.log(vbindVariableList)
        },
      },
    ]
  })

export const viteVueCSSVars = unplugin.vite
export const rollupVueCSSVars = unplugin.rollup
export const webpackVueCSSVars = unplugin.webpack
export const esbuildVueCSSVars = unplugin.esbuild
