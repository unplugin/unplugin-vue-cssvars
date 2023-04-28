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
  injectCSSOnServer,
  injectCSSVars,
  injectCssOnBuild,
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
          let transId = transformSymbol(id)
          let mgcStr = new MagicString(code)
          try {
          // ⭐TODO: 只支持 .vue ? jsx, tsx, js, ts ？
            // webpack 时 使用 id.includes('?vue&type=style') 判断
            // webpack dev 和 build 都回进入这里

            if (transId.endsWith('.vue')) {
              const res = handleVBindVariable(code, transId, mgcStr)
              if (res)
                mgcStr = res
            }

            if ((transId.includes('?vue&type=style') && isHMR && framework === 'webpack')) {
              transId = transId.split('?vue&type=style')[0]
              const res = handleVBindVariable(code, transId, mgcStr)
              if (res)
                mgcStr = res
            }
            // console.log('###### pre transId#######\n', id)
            // console.log('###### pre mgcStr#######\n', mgcStr.toString())
            // console.log(vbindVariableList)
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

          console.log('################## pev', id)
          console.log(mgcStr.toString())
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
          let file = ''
          compiler.hooks.watchRun.tap(NAME, (compilation1) => {
            console.log('watchRun')
            if (compilation1.modifiedFiles) {
              file = transformSymbol(setTArray(compilation1.modifiedFiles)[0] as string)
              if (SUPPORT_FILE_REG.test(file)) {
                isHMR = true
                webpackHMR(
                  CSSFileModuleMap,
                  userOptions,
                  file,
                )
              }
            }
          })

          compiler.hooks.compilation.tap(NAME, (compilation) => {

            compilation.hooks.finishModules.tapAsync(NAME, (modules, callback) => {
              // cache module
              for (const value of modules) {
                console.log('##### finishModules', modules.size)
                const resource = transformSymbol(value.resource)
                // 只有 script（两个） 只更新 style
                //只有 第二个 script 更新 style 和 sfc， 但 sfc 会延后一次
                //只有 第一个 script 只更新 style
               if (resource.includes('?vue&type=script')) {
                  const transId = 'D:/project-github/unplugin-vue-cssvars/play/webpack/src/App.vue'
                 if (vbindVariableList.get(transId)) {
                    let ca = cacheWebpackModule.get(transId)
                    ca = new Set()
                    ca.add(value)
                    cacheWebpackModule.set(transId, ca)
                  }
                }
              }

                if (isHMR) {
                  const keyPath = 'D:/project-github/unplugin-vue-cssvars/play/webpack/src/App.vue'
                  const cwm = cacheWebpackModule.get(keyPath)
                  console.log('############### cwm', cwm.size)
                  //for (const mv of cwm) {
                      compilation.rebuildModule([...cwm][0], (e) => {
                        console.log('hot updated')
                        callback()
                        if (e) {
                          console.log(e)
                        }
                      })
                 // }
                }else{
                  callback()
                }
            })

          })
          /**
           * 现在问题是 通过watchRun在finishModuled的钩子里，
           * 我 rebuildModule另一个模块，但 无法完成整个周期（我觉得  rebuildModule 后应该再次进入finishModuled），
           * 实现热更新，只能在下次watchRun 时结束，这导致我第一层热更新失效，第二次热更新结果是第一次的
           */
         /* compiler.hooks.compilation.tap(NAME, (compilation) => {
            compilation.hooks.afterOptimizeChunkAssets.tap(NAME, (chunks) => {

            });
          });
*/
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
                if (transId.includes('?vue&type=style')) {
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
              if (transId.includes('?vue&type=script')) {
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

            console.log('################## post', id)
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
