import { NAME, SUPPORT_FILE_REG, log, setTArray, transformSymbol } from '@unplugin-vue-cssvars/utils'
import { webpackHMR } from '../hmr/hmr'
import { injectCSSOnServer } from '../inject'
import { handleVBindVariable } from './handle-variable'
import { handleInjectCss } from './handle-inject-css'
import type { IVueCSSVarsCtx } from '../types'
import type { MagicStringBase } from 'magic-string-ast'
import type { Compiler } from 'webpack'
// TODO: unit test
export function transformPreWebpack(
  id: string,
  code: string,
  ctx: IVueCSSVarsCtx,
) {
  if (id.endsWith('.vue'))
    handleVBindVariable(code, id, ctx)

  if ((id.includes('?vue&type=style') || id.includes('?vue&type=script'))
        && ctx.isHMR && ctx.framework === 'webpack') {
    id = id.split('?vue')[0]
    handleVBindVariable(code, id, ctx)
  }
}

// TODO: unit test
export function transformPostWebpack(
  id: string,
  code: string,
  mgcStr: MagicStringBase,
  ctx: IVueCSSVarsCtx,
) {
  if (id.includes('?vue&type=script')) {
    id = id.split('?vue')[0]
    handleInjectCss(id, code, mgcStr, ctx)
  }

  const cssFMM = ctx.CSSFileModuleMap.get(id)
  if (cssFMM && cssFMM.sfcPath && cssFMM.sfcPath.size > 0) {
    const sfcPathIdList = setTArray(cssFMM.sfcPath)
    sfcPathIdList.forEach((v) => {
      mgcStr = injectCSSOnServer(
        mgcStr,
        ctx.vbindVariableList.get(v),
        ctx.isHMR)
    })
  }
  return mgcStr
}

// TODO: unit test
export const webpackPlugin = (ctx: IVueCSSVarsCtx, compiler: Compiler) => {
  // mark webpack hmr
  let modifiedFile = ''
  compiler.hooks.watchRun.tapAsync(NAME, (compilation1, watchRunCallBack) => {
    if (compilation1.modifiedFiles) {
      modifiedFile = transformSymbol(setTArray(compilation1.modifiedFiles)[0] as string)
      if (SUPPORT_FILE_REG.test(modifiedFile)) {
        ctx.isHMR = true
        webpackHMR(
          ctx.CSSFileModuleMap,
          ctx.userOptions,
          modifiedFile,
        )
      }
    }
    watchRunCallBack()
  })

  compiler.hooks.compilation.tap(NAME, (compilation) => {
    compilation.hooks.finishModules.tapAsync(NAME, async(modules, callback) => {
      if (ctx.isHMR) {
        const needRebuildModules = new Map<string, any>()
        for (const value of modules) {
          const resource = transformSymbol(value.resource)
          if (resource.includes('?vue&type=script')) {
            const sfcPathKey = resource.split('?vue')[0]
            if (ctx.CSSFileModuleMap.get(modifiedFile).sfcPath.has(sfcPathKey))
              needRebuildModules.set(sfcPathKey, value)
          }
        }
        if (needRebuildModules.size > 0) {
          const promises = []
          for (const [key] of needRebuildModules) {
            // 创建一个 Promise 对象，表示异步操作
            const promise = new Promise((resolve, reject) => {
              compilation.rebuildModule(needRebuildModules.get(key), (e) => {
                if (e)
                  reject(e)
                else
                  resolve()
              })
            })
            promises.push(promise)
          }
          Promise.all(promises)
            .then(() => {
              callback()
              // hmr end
              ctx.isHMR = false
            })
            .catch((e) => {
              log('error', e)
            })
        } else {
          callback()
        }
      } else {
        callback()
      }
    })
  })
}
