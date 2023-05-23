import { SUPPORT_FILE_REG } from '@unplugin-vue-cssvars/utils'
import { normalizePath } from 'baiwusanyu-utils'
import { injectCSSOnServer, injectCssOnBuild } from '../inject'
import { viteHMR } from '../hmr/hmr'
import { handleVBindVariable } from './handle-variable'
import { handleInjectCss } from './handle-inject-css'
import type { IVueCSSVarsCtx } from '../types'
import type { MagicStringBase } from 'magic-string-ast'
import type { HmrContext, ResolvedConfig } from 'vite'

export function transformPreVite(
  id: string,
  code: string,
  mgcStr: MagicStringBase,
  ctx: IVueCSSVarsCtx,
) {
  let injectCSSContent = null
  let descriptor = null
  if (id.endsWith('.vue')) {
    const res = handleVBindVariable(code, id, ctx)
    if (res) {
      descriptor = res.descriptor
      injectCSSContent = res.injectCSSContent
    }
  }

  // just only run with vite、 rollup、esbuild
  // build only
  if (mgcStr && !ctx.isServer && ctx.framework !== 'webpack' && ctx.framework !== 'rspack')
    mgcStr = injectCssOnBuild(mgcStr, injectCSSContent, descriptor)

  return mgcStr
}

export function transformPostVite(
  id: string,
  code: string,
  mgcStr: MagicStringBase,
  ctx: IVueCSSVarsCtx,
) {

  // inject cssvars to sfc code
  // TODO 更好的判断
  // TODO: 多次注入 ？？？
  // TODO： build
  if (id.endsWith('.vue') || id.includes('&lang.tsx') || id.includes('&lang.jsx')){
    mgcStr = handleInjectCss(id.split('?vue')[0], code, mgcStr, ctx)
  }

  // inject css code
  if (id.includes('?vue&type=style')) {
    mgcStr = injectCSSOnServer(
      mgcStr,
      ctx.vbindVariableList.get(id.split('?vue')[0]),
      ctx.isHMR,
    )
  }
  return mgcStr
}

export const vitePlugin = (ctx: IVueCSSVarsCtx) => {
  return {
    // Vite plugin
    configResolved(config: ResolvedConfig) {
      if (ctx.userOptions.server !== undefined)
        ctx.isServer = ctx.userOptions.server
      else
        ctx.isServer = config.command === 'serve'
    },
    handleHotUpdate(hmr: HmrContext) {
      if (SUPPORT_FILE_REG.test(hmr.file)) {
        ctx.isHMR = true
        viteHMR(
          ctx.CSSFileModuleMap,
          ctx.userOptions,
          normalizePath(hmr.file),
          hmr.server,
        )
      }
    },
  }
}
