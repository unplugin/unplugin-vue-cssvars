import { createUnplugin } from 'unplugin'
import {
  JSX_TSX_REG, NAME,
  SUPPORT_FILE_REG,
  setTArray,
  transformSymbol} from '@unplugin-vue-cssvars/utils'
import { createFilter } from '@rollup/pluginutils'
import { parse } from '@vue/compiler-sfc'
import chalk from 'chalk'
import MagicString from 'magic-string'
import { preProcessCSS } from './runtime/pre-process-css'
import { getVBindVariableListByPath } from './runtime/process-css'
import { initOption } from './option'
import { getVariable, matchVariable, parserCompiledSfc } from './parser'
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
          const transId = transformSymbol(id)
          let mgcStr = new MagicString(code)
          try {
          // ⭐TODO: 只支持 .vue ? jsx, tsx, js, ts ？
            // webpack 时 使用 id.includes('vue&type=style') 判断
            // webpack dev 和 build 都回进入这里
            if (transId.endsWith('.vue')
                || (transId.includes('vue&type=style') && framework === 'webpack')) {
              const { descriptor } = parse(code)
              const lang = descriptor?.script?.lang ?? 'js'
              // ⭐TODO: 只支持 .vue ? jsx, tsx, js, ts ？
              if (!JSX_TSX_REG.test(`.${lang}`)) {
                isScriptSetup = !!descriptor.scriptSetup
                const {
                  vbindVariableListByPath,
                  injectCSSContent,
                } = getVBindVariableListByPath(descriptor, transId, CSSFileModuleMap, isServer, userOptions.alias)
                const variableName = getVariable(descriptor)
                vbindVariableList.set(transId, matchVariable(vbindVariableListByPath, variableName))

                // vite、rollup、esbuild 打包生效
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
          let transId = transformSymbol(id)
          let mgcStr = new MagicString(code)
          // ⭐TODO: 只支持 .vue ? jsx, tsx, js, ts ？
          try {
            function injectCSSVarsFn(idKey: string) {
              const parseRes = parserCompiledSfc(code)
              const injectRes = injectCSSVars(vbindVariableList.get(idKey), isScriptSetup, parseRes, mgcStr)
              mgcStr = injectRes.mgcStr
              injectRes.vbindVariableList && vbindVariableList.set(transId, injectRes.vbindVariableList)
              isHmring = false
            }

            // transform in dev
            // 'vite' | 'rollup' | 'esbuild'
            if (isServer) {
              if (framework === 'vite'
                || framework === 'rollup'
                || framework === 'esbuild') {
                if (transId.endsWith('.vue'))
                  injectCSSVarsFn(transId)
                if (transId.includes('vue&type=style')) {
                  mgcStr = injectCssOnServer(
                    mgcStr,
                    vbindVariableList.get(transId.split('?vue')[0]),
                    isHmring,
                  )
                }
              }
            }

            // webpack dev 和 build 都回进入这里
            if (framework === 'webpack') {
              if (transId.includes('vue&type=script')) {
                transId = transId.split('?vue&type=script')[0]
                injectCSSVarsFn(transId)
              }
              /*mgcStr = mgcStr.replaceAll(
                'vue&type=template&id=7ba5bd90&scoped=true&ts=true", () => {',
                'vue&type=template&id=7ba5bd90&scoped=true&ts=true", () => { console.log(render);')*/
              const cssFMM = CSSFileModuleMap.get(transId)
              if (cssFMM && cssFMM.sfcPath && cssFMM.sfcPath.size > 0) {
                const sfcPathIdList = setTArray(cssFMM.sfcPath)
                sfcPathIdList.forEach((v) => {
                  mgcStr = injectCssOnServer(mgcStr, vbindVariableList.get(v), isHmring)
                })
              }
            }
            // console.log(mgcStr.toString())
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
