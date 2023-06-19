import {babelParse, parse} from '@vue/compiler-sfc'
import { getVariable, matchVariable } from '../parser'
import { getVBindVariableListByPath } from './process-css'
import type { IVueCSSVarsCtx } from '../types'
import {analyzeScriptBindings} from "../parser/parser-script-bindings";

export function handleVBindVariable(
  code: string,
  id: string,
  ctx: IVueCSSVarsCtx,
) {
  const { descriptor } = parse(code)

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
  // 解析 bindingsType
  ctx.isScriptSetup && (ctx.bindingsTypeMap[id] = analyzeScriptBindings(descriptor))
  return {
    descriptor,
    injectCSSContent,
  }
}
