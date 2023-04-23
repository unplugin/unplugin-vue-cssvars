import { createUnplugin } from 'unplugin'
import { JSX_TSX_REG, NAME, SUPPORT_FILE_REG, setTArray } from '@unplugin-vue-cssvars/utils'
import { createFilter } from '@rollup/pluginutils'
import { parse } from '@vue/compiler-sfc'
import chalk from 'chalk'
import MagicString from 'magic-string'
import { preProcessCSS } from './runtime/pre-process-css'
import { getVBindVariableListByPath } from './runtime/process-css'
import { initOption } from './option'
import { getVariable, matchVariable } from './parser'
import {
  injectCSSVars,
  injectCssOnBuild,
  injectCssOnServer,
} from './inject'
import { viteHMR } from './hmr/hmr'
import type { HmrContext, ResolvedConfig } from 'vite'
import type { TMatchVariable } from './parser'
import type { Options } from './types'
// TODO: webpack hmr
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
    let isHmring = false
    return [
      {
        name: NAME,
        enforce: 'pre',
        transformInclude(id: string) {
          return filter(id)
        },
        async transform(code: string, id: string) {
          let mgcStr = new MagicString(code)
          try {
          // ⭐TODO: 只支持 .vue ? jsx, tsx, js, ts ？
            if (id.endsWith('.vue')) {
              const { descriptor } = parse(code)
              const lang = descriptor?.script?.lang ?? 'js'
              // ⭐TODO: 只支持 .vue ? jsx, tsx, js, ts ？
              if (!JSX_TSX_REG.test(`.${lang}`)) {
                isScriptSetup = !!descriptor.scriptSetup
                const {
                  vbindVariableListByPath,
                  injectCSSContent,
                } = getVBindVariableListByPath(descriptor, id, CSSFileModuleMap, isServer, userOptions.alias)
                const variableName = getVariable(descriptor)
                vbindVariableList.set(id, matchVariable(vbindVariableListByPath, variableName))
                // TODO: webpack
                // vite
                if (!isServer)
                  mgcStr = injectCssOnBuild(mgcStr, injectCSSContent, descriptor)
              }
            }
            return {
              code: mgcStr.toString(),
              get map() {
                return mgcStr.generateMap({
                  source: id,
                  includeContent: true,
                  hires: true,
                })
              },
            }
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
          handleHotUpdate(hmr: HmrContext) {
            if (SUPPORT_FILE_REG.test(hmr.file)) {
              isHmring = true
              viteHMR(
                CSSFileModuleMap,
                userOptions,
                hmr.file,
                hmr.server,
              )
            }
          },
        },
      },
      {
        name: `${NAME}:inject`,
        enforce: 'post',
        transformInclude(id: string) {
          return filter(id)
        },
        async transform(code: string, id: string) {
          console.log('############', id)
          console.log(code)
          let mgcStr = new MagicString(code)

          // ⭐TODO: 只支持 .vue ? jsx, tsx, js, ts ？
          try {
            // transform in dev
            // vite
            if (isServer) {
              if (id.endsWith('.vue')) {
                const injectRes = injectCSSVars(code, vbindVariableList.get(id), isScriptSetup)
                mgcStr = mgcStr.overwrite(0, mgcStr.length(), injectRes.code)
                injectRes.vbindVariableList && vbindVariableList.set(id, injectRes.vbindVariableList)
                isHmring = false
              }
              // webpack
              // TODO refactor
              if (id.includes('vue&type=script')) {
                const transId = id.split('?vue&type=script')[0]
                //  todo 重复注入了
                const injectRes = injectCSSVars(code, vbindVariableList.get(transId), isScriptSetup)

                mgcStr = mgcStr.overwrite(0, mgcStr.length(), injectRes.code)
                injectRes.vbindVariableList && vbindVariableList.set(transId, injectRes.vbindVariableList)
                isHmring = false
              }

              // vite
              if (id.includes('vue&type=style'))
                mgcStr = injectCssOnServer(mgcStr, vbindVariableList.get(id.split('?vue')[0]), isHmring)

              // webpack
              const cssFMM = CSSFileModuleMap.get(id)
              if (cssFMM && cssFMM.sfcPath && cssFMM.sfcPath.size > 0) {
                const sfcPathIdList = setTArray(cssFMM.sfcPath)
                sfcPathIdList.forEach((v) => {
                  mgcStr = injectCssOnServer(mgcStr, vbindVariableList.get(v), isHmring)
                })
              }
            }

            return {
              code: mgcStr.toString(),
              get map() {
                return mgcStr.generateMap({
                  source: id,
                  includeContent: true,
                  hires: true,
                })
              },
            }
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
