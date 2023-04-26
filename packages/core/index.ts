import { createUnplugin } from 'unplugin'
import {
  JSX_TSX_REG, NAME,
  SUPPORT_FILE_REG,
  setTArray,
  transformSymbol,
} from '@unplugin-vue-cssvars/utils'
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
  injectCSSOnServer,
} from './inject'
import { viteHMR, webpackHMR } from './hmr/hmr'
import type { MagicStringBase } from 'magic-string-ast'
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
    let isHMR = false
    const cacheWebpackModule = new Map<string, any>()
    let cacheCodeWepackHMR = ''

    function handleVBindVariable(
      code: string,
      id: string,
      mgcStr?: MagicStringBase,
    ) {
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

        // wepack 热更新统一
        // TODO: webpack 热更新时应该打平
        if ((id.includes('vue&type=style') && framework === 'webpack' && isHMR)){
          vbindVariableList.set(id.split('?vue')[0], matchVariable(vbindVariableListByPath, variableName))
        }
        // vite、rollup、esbuild 打包生效
        if (mgcStr && !isServer && framework !== 'webpack' && framework !== 'rspack') {
          mgcStr = injectCssOnBuild(mgcStr, injectCSSContent, descriptor)
          return mgcStr
        }
      }
    }

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
              cacheCodeWepackHMR = code

              const res = handleVBindVariable(code, transId, mgcStr)
              if (res)
                mgcStr = res
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
              isHMR = true
              viteHMR(
                CSSFileModuleMap,
                userOptions,
                transformSymbol(hmr.file),
                hmr.server,
              )
            }
          },
        },
        webpack(compiler) {
          // mark webpack hmr
          compiler.hooks.watchRun.tap(`${NAME}:webpack:watchRun`, (compilation) => {
            let file = ''
            if (compilation.modifiedFiles) {
              file = transformSymbol(setTArray(compilation.modifiedFiles)[0] as string)
              if (SUPPORT_FILE_REG.test(file)) {
                isHMR = true
                webpackHMR(
                  CSSFileModuleMap,
                  userOptions,
                  file,
                )
              }
            }
            compiler.hooks.compilation.tap(`${NAME}:webpack:watchRun:compilation`, (compilation) => {
              compilation.hooks.finishModules.tap(`${NAME}:webpack:watchRun:finishModules`, (modules) => {
                // TODO:
                const keyPath = 'D:/project-github/unplugin-vue-cssvars/play/webpack/src/App.vue'
                // rebuild module to hmr
                if (isHMR){
                  const cwm = cacheWebpackModule.get(keyPath)
                  console.log(cwm.size)
                  for (const mv of cwm) {
                    compilation.rebuildModule(mv, (e) => {
                      if (e) {
                        console.log(e)
                        return
                      }
                      console.log('hot updated')
                    })
                  }
                }
              })
            })
          })

          compiler.hooks.compilation.tap(`${NAME}:webpack:compilation`, (compilation) => {
            compilation.hooks.finishModules.tap(`${NAME}:webpack:finishModules`, (modules) => {
              // cache module
              for (const value of modules) {
                const resource = transformSymbol(value.resource)
               if (resource.includes('vue&type=script')) {
                  const transId = resource.split('?vue&type=script')[0]
                  if (vbindVariableList.get(transId)){
                    let ca = cacheWebpackModule.get(transId)
                    if(!ca){
                      ca = new Set()
                    }
                    ca.add(value)
                    cacheWebpackModule.set(transId, ca)
                  }
               }
              }
            })
          })
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
              isHMR = false
            }

            // transform in dev
            // 'vite' | 'rollup' | 'esbuild'
            if (isServer) {
              if (framework === 'vite'
                || framework === 'rollup'
                || framework === 'esbuild') {
                // inject cssvars to sfc code
                if (transId.endsWith('.vue'))
                  injectCSSVarsFn(transId)
                // inject css code
                if (transId.includes('vue&type=style')) {
                  mgcStr = injectCSSOnServer(
                    mgcStr,
                    vbindVariableList.get(transId.split('?vue')[0]),
                    isHMR,
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

              const cssFMM = CSSFileModuleMap.get(transId)
              if (cssFMM && cssFMM.sfcPath && cssFMM.sfcPath.size > 0) {
                const sfcPathIdList = setTArray(cssFMM.sfcPath)
                sfcPathIdList.forEach((v) => {
                  mgcStr = injectCSSOnServer(
                    mgcStr,
                    vbindVariableList.get(v),
                    isHMR)
                })
              }
            }
          //console.log(mgcStr.toString())
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
