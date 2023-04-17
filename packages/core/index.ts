import { createUnplugin } from 'unplugin'
import { NAME } from '@unplugin-vue-cssvars/utils'
import { createFilter } from '@rollup/pluginutils'
import { parse } from '@vue/compiler-sfc'
import chalk from 'chalk'
import { preProcessCSS } from './runtime/pre-process-css'
import { getVBindVariableListByPath } from './runtime/process-css'
import { initOption } from './option'
import { getVariable, matchVariable } from './parser'
import {
  injectCSSVars,
  injectCssOnBuild,
  injectCssOnServer,
} from './inject'
import type { ResolvedConfig } from 'vite'
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
    const CSSFileModuleMap = preProcessCSS(userOptions, userOptions.alias)
    const vbindVariableList = new Map<string, {
      TMatchVariable: TMatchVariable
      orgTransformCode?: string }>()
    let isScriptSetup = false
    if (userOptions.server === undefined) {
      console.warn(chalk.yellowBright.bold(`[${NAME}] The server of option is not set, you need to specify whether you are using the development server or building the project`))
      console.warn(chalk.yellowBright.bold(`[${NAME}] See: https://github.com/baiwusanyu-c/unplugin-vue-cssvars/blob/master/README.md#option`))
    }
    let isServer = !!userOptions.server
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
              } = getVBindVariableListByPath(descriptor, id, CSSFileModuleMap, isServer, userOptions.alias)
              const variableName = getVariable(descriptor)
              vbindVariableList.set(id, {
                TMatchVariable: matchVariable(vbindVariableListByPath, variableName),
              })

              if (!isServer)
                code = injectCssOnBuild(code, injectCSSContent, descriptor)
            }
            return code
          } catch (err: unknown) {
            this.error(`[${NAME}] ${err}`)
          }
        },
        vite: {
          // Vite plugin
          configResolved(config: ResolvedConfig) {
            if (userOptions.server !== undefined)
              isServer = userOptions.server
            else
              isServer = config.command === 'serve'
          },
          handleHotUpdate(hmr) {
            if (hmr.file.endsWith('foo.css'))
              return hmr.modules
          },
        },
      },
      {
        name: `${NAME}:inject`,
        enforce: 'post',
        async transform(code: string, id: string) {
          // ⭐TODO: 只支持 .vue ? jsx, tsx, js, ts ？
          try {
            // transform in dev
            if (isServer) {
              if (id.endsWith('.vue')) {
                const orgCode = code
                // console.log('########', id)
                code = code.replaceAll('if (!mod)', 'console.log(mod)\n if (!mod)')
                // console.log(code)
                const injectRes = injectCSSVars(code, vbindVariableList.get(id).TMatchVariable, isScriptSetup)
                code = injectRes.code
                injectRes.vbindVariableList && vbindVariableList.set(id, {
                  TMatchVariable: injectRes.vbindVariableList,
                  orgTransformCode: orgCode,
                })
              }
              if (id.includes('type=style')) {
                console.log('########', id)
                code = injectCssOnServer(code, vbindVariableList.get(id.split('?vue')[0]).TMatchVariable)
                console.log(code)
              }
            }
            return code
          } catch (err: unknown) {
            this.error(`[${NAME}] ${err}`)
          }
        },
      },
    ]
  })

export const viteVueCSSVars = unplugin.vite
export const rollupVueCSSVars = unplugin.rollup
export const webpackVueCSSVars = unplugin.webpack
export const esbuildVueCSSVars = unplugin.esbuild
