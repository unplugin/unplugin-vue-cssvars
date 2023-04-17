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
    const vbindVariableList = new Map<string, TMatchVariable>()
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
              vbindVariableList.set(id, matchVariable(vbindVariableListByPath, variableName))

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
              console.log(code)
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
