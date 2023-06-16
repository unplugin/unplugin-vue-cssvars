import { parse, compileScript } from '@vue/compiler-sfc'
import { getVariable, matchVariable, parseScriptBindings } from '../parser'
import { getVBindVariableListByPath } from './process-css'
import type { IVueCSSVarsCtx } from '../types'

export function handleVBindVariable(
  code: string,
  id: string,
  ctx: IVueCSSVarsCtx,
) {
  debugger
  const { descriptor } = parse(code)
  const { scriptAst} = compileScript(descriptor,{
    id,
    inlineTemplate: true,
  })
  const bindings = parseScriptBindings(scriptAst!)
  console.log(bindings)



  // let lang = 'js'
  // if (descriptor?.scriptSetup?.lang)
  //   lang = descriptor.scriptSetup.lang

  // if (descriptor?.script?.lang)
  //   lang = descriptor.script.lang

  // if (!JSX_TSX_REG.test(`.${lang}`)) {
  ctx.isScriptSetup = !!descriptor.scriptSetup
  // 分析 @import 的链路
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
  // 分析 sfc 内容中的变量
  const variableName = getVariable(descriptor)
  // 进行匹配得到最终的 cssvars 内容
  ctx.vbindVariableList.set(id, matchVariable(vbindVariableListByPath, variableName))
  return {
    descriptor,
    injectCSSContent,
  }
  // }
}
