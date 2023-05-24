import { SUPPORT_FILE_REG } from '@unplugin-vue-cssvars/utils'
import { normalizePath } from 'baiwusanyu-utils'
import { injectCSSOnServer, injectCssOnBuild } from '../inject'
import { viteHMR } from '../hmr/hmr'
import { handleVBindVariable } from './handle-variable'
import { handleInjectCss } from './handle-inject-css'
import type { IVueCSSVarsCtx } from '../types'
import type { MagicStringBase } from 'magic-string-ast'
import type { HmrContext, ResolvedConfig } from 'vite'

/**
 *
 * @param id
 * @param code
 * @param mgcStr
 * @param ctx
 */
export function transformPreVite(
  id: string,
  code: string,
  mgcStr: MagicStringBase,
  ctx: IVueCSSVarsCtx,
) {
  let injectCSSContent = null
  let descriptor = null
  if (id.endsWith('.vue')) {
    // 根据 sfc 的内容，分析匹配 css 文件中的变量
    const res = handleVBindVariable(code, id, ctx)
    if (res) {
      descriptor = res.descriptor
      injectCSSContent = res.injectCSSContent
    }
  }

  // just only run with vite、rollup、esbuild
  // build only
  // 打包构建时，将css提升到组件代码的 style 标签中
  if (mgcStr && !ctx.isServer && ctx.framework !== 'webpack' && ctx.framework !== 'rspack')
    mgcStr = injectCssOnBuild(mgcStr, injectCSSContent, descriptor)

  return mgcStr
}

/**
 * dev only
 * @param id
 * @param code
 * @param mgcStr
 * @param ctx
 */
export function transformPostViteDev(
  id: string,
  code: string,
  mgcStr: MagicStringBase,
  ctx: IVueCSSVarsCtx,
) {
  // inject cssvars to sfc code
  if (id.endsWith('.vue') || id.includes('&lang.tsx') || id.includes('&lang.jsx'))
    mgcStr = handleInjectCss(id.split('?vue')[0], code, mgcStr, ctx)

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

/**
 * vite 的插件，用于热更新和识别是否为 dev server
 * dev only
 * @param ctx
 */
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
