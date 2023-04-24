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
  (options: Options = {}, meta): any => {
    const framework = meta.framework
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
                // 'vite' | 'rollup' | 'esbuild'
                if (!isServer && framework !== 'webpack' && framework !== 'rspack')
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
          let mgcStr = new MagicString(code)
          // ⭐TODO: 只支持 .vue ? jsx, tsx, js, ts ？
          try {
            // transform in dev
            // 'vite' | 'rollup' | 'esbuild'
            if (isServer) {
              function injectCSSVarsFn(idKey: string) {
                const injectRes = injectCSSVars(code, vbindVariableList.get(idKey), isScriptSetup, framework)
                mgcStr = mgcStr.overwrite(0, mgcStr.length(), injectRes.code)
                injectRes.vbindVariableList && vbindVariableList.set(id, injectRes.vbindVariableList)
                isHmring = false
              }

              if (framework === 'vite' ||
                framework === 'rollup' ||
                framework === 'esbuild') {
                if (id.endsWith('.vue'))
                  injectCSSVarsFn(id)

                if (id.includes('vue&type=style')) {
                  mgcStr = injectCssOnServer(
                    mgcStr,
                    vbindVariableList.get(id.split('?vue')[0]),
                    isHmring,
                  )
                }
              }

              if (framework === 'webpack') {
                if (id.includes('vue&type=script')) {
                  const transId = id.split('?vue&type=script')[0]
                  //  todo 重复注入了
                  injectCSSVarsFn(transId)
                }
                const cssFMM = CSSFileModuleMap.get(id)
                if (cssFMM && cssFMM.sfcPath && cssFMM.sfcPath.size > 0) {
                  const sfcPathIdList = setTArray(cssFMM.sfcPath)
                  sfcPathIdList.forEach((v) => {
                    mgcStr = injectCssOnServer(mgcStr, vbindVariableList.get(v), isHmring)
                  })
                }
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
