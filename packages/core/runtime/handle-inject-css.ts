import { parserCompiledSfc } from '../parser'
import { injectCSSVars } from '../inject'
import type { MagicStringBase } from 'magic-string-ast'
import type { IVueCSSVarsCtx } from '../types'

export function handleInjectCss(
  id: string,
  code: string,
  mgcStr: MagicStringBase,
  ctx: IVueCSSVarsCtx,
) {
  const parseRes = parserCompiledSfc(code)
  debugger
  const injectRes = injectCSSVars(
    ctx.vbindVariableList.get(id),
    ctx.isScriptSetup,
    parseRes,
    mgcStr,
  )
  mgcStr = injectRes.mgcStr
  injectRes.vbindVariableList && ctx.vbindVariableList.set(id, injectRes.vbindVariableList)
  return mgcStr
}
