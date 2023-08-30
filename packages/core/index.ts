import { createUnplugin } from 'unplugin'
import { NAME } from '@unplugin-vue-cssvars/utils'
import { log, normalizePath, setGlobalPrefix } from 'baiwusanyu-utils'

import { createFilter } from '@rollup/pluginutils'
import MagicString from 'magic-string'
import { preProcessCSS } from './runtime/pre-process-css'
import { initOption } from './option'
import {
  transformPostViteDev,
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
      log('warning', 'See: https://github.com/unplugin/unplugin-vue-cssvars/blob/master/README.md#option')
    }

    const context = {
      CSSFileModuleMap: preProcessCSS(userOptions, userOptions.alias),
      vbindVariableList: new Map<string, TMatchVariable>(),
      isServer: !!userOptions.server,
      isHMR: false,
      userOptions,
      framework: meta.framework,
      isScriptSetup: false,
      bindingsTypeMap: {},
    } as IVueCSSVarsCtx

    return [
      {
        name: NAME,
        enforce: 'pre',
        transformInclude(id: string) {
          return filter(id)
        },
        async transform(code: string, id: string) {
          const transId = normalizePath(id)
          let mgcStr = new MagicString(code)
          try {
            if (context.framework === 'vite'
              || context.framework === 'rollup'
              || context.framework === 'esbuild') {
              mgcStr = transformPreVite(
                transId,
                code,
                mgcStr,
                context,
              )
            }

            if (context.framework === 'webpack') {
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
        // handle hmr with vite and command
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
          const transId = normalizePath(id)
          let mgcStr = new MagicString(code)
          try {
            // transform in dev
            // dev only
            if (context.isServer) {
              if (context.framework === 'vite'
                || context.framework === 'rollup'
                || context.framework === 'esbuild')
                mgcStr = transformPostViteDev(transId, code, mgcStr, context)
            }

            // webpack dev 和 build 都会执行
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
