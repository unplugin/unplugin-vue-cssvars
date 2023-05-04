import { createUnplugin } from 'unplugin'
import { NAME, transformSymbol} from '@unplugin-vue-cssvars/utils'
import { log, setGlobalPrefix } from 'baiwusanyu-utils'
import { createFilter } from '@rollup/pluginutils'
import MagicString from 'magic-string'
import { preProcessCSS } from './runtime/pre-process-css'
import { initOption } from './option'
import {
  transformPostVite,
  transformPreVite,
  vitePlugin,
} from './runtime/vite'
import {
  transformPostWebpack,
  transformPreWebpack,
  webpackPlugin,
} from './runtime/webpack'
import type { TMatchVariable } from './parser'
import type { IVueCSSVarsCtx, Options } from './types'
import type { Compiler } from 'webpack'
const unplugin = createUnplugin<Options>(
  (options: Options = {}, meta): any => {
    setGlobalPrefix(`[${NAME}]:`)
    const userOptions = initOption(options)
    const filter = createFilter(
      userOptions.include,
      userOptions.exclude,
    )

    if (userOptions.server === undefined) {
      log('warning', 'The server of option is not set, you need to specify whether you are using the development server or building the project')
      log('warning', 'See: https://github.com/baiwusanyu-c/unplugin-vue-cssvars/blob/master/README.md#option')
    }

    const context = {
      CSSFileModuleMap: preProcessCSS(userOptions, userOptions.alias),
      vbindVariableList: new Map<string, TMatchVariable>(),
      isServer: !!userOptions.server,
      isHMR: false,
      userOptions,
      framework: meta.framework,
      isScriptSetup: false,
    } as IVueCSSVarsCtx

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
            if (context.framework !== 'webpack'
                && context.framework !== 'rspack') {
              mgcStr = transformPreVite(
                transId,
                code,
                mgcStr,
                context,
              )
            } else {
              transformPreWebpack(
                transId,
                code,
                context,
              )
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
        // handle hmr with vite
        vite: vitePlugin(context),
        // handle hmr with webpack
        webpack(compiler: Compiler) {
          webpackPlugin(context, compiler)
        },
      },

      {
        name: `${NAME}:inject`,
        enforce: 'post',
        transformInclude(id: string) {
          return filter(id)
        },
        async transform(code: string, id: string) {
          const transId = transformSymbol(id)
          let mgcStr = new MagicString(code)
          try {
            // transform in dev
            // 'vite' | 'rollup' | 'esbuild'
            if (context.isServer) {
              if (context.framework === 'vite'
                || context.framework === 'rollup'
                || context.framework === 'esbuild')
                mgcStr = transformPostVite(transId, code, mgcStr, context)
            }

            // webpack dev 和 build 都回进入这里
            if (context.framework === 'webpack')
              mgcStr = transformPostWebpack(transId, code, mgcStr, context)

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
        buildEnd() {
          if (context.isServer) {
            if (context.framework === 'vite'
                || context.framework === 'rollup'
                || context.framework === 'esbuild')
              context.isHMR = false
          }
        },
      },
    ]
  })

export const viteVueCSSVars = unplugin.vite
export const rollupVueCSSVars = unplugin.rollup
export const webpackVueCSSVars = unplugin.webpack
export const esbuildVueCSSVars = unplugin.esbuild
