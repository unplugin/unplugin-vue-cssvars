import { parse } from '@vue/compiler-sfc'
import { JSX_TSX_REG } from '@unplugin-vue-cssvars/utils'
import { getVariable, matchVariable } from '../parser'
import { getVBindVariableListByPath } from './process-css'
import type { IVueCSSVarsCtx } from '../types'

// TODO: unit test
export function handleVBindVariable(
  code: string,
  id: string,
  ctx: IVueCSSVarsCtx,
) {
  const { descriptor } = parse(code)
  const lang = descriptor?.script?.lang ?? 'js'
  // ⭐TODO: 只支持 .vue ? jsx, tsx, js, ts ？
  if (!JSX_TSX_REG.test(`.${lang}`)) {
    ctx.isScriptSetup = !!descriptor.scriptSetup
    const {
      vbindVariableListByPath,
      injectCSSContent,
    } = getVBindVariableListByPath(
      descriptor,
      id,
      ctx.CSSFileModuleMap,
      ctx.isServer,
      ctx.userOptions.alias,
    )

    const variableName = getVariable(descriptor)
    ctx.vbindVariableList.set(id, matchVariable(vbindVariableListByPath, variableName))
    return {
      descriptor,
      injectCSSContent,
    }
  }
}
