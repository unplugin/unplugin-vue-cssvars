import { ts } from '@ast-grep/napi'
import { CSSVarsBindingTypes } from './utils'
import { getRules } from './ast-grep-rules'
import type { SgNode } from '@ast-grep/napi'
import type { SFCDescriptor } from '@vue/compiler-sfc'
import type { BindingMetadata } from '@vue/compiler-dom'

export function analyzeScriptBindings(descriptor: SFCDescriptor): BindingMetadata {
  const scriptSetupContent = descriptor.scriptSetup?.content || ''
  const scriptContent = descriptor.script?.content || ''
  if (!scriptSetupContent && !scriptContent) return {}
  const bindings = {}
  const sgNodeScriptSetup = ts.parse(scriptSetupContent).root()
  walkSgNodeToGetBindings(sgNodeScriptSetup, bindings)
  const sgNodeScript = ts.parse(scriptContent).root()
  walkSgNodeToGetBindings(sgNodeScript, bindings)

  return bindings
}

function walkSgNodeToGetBindings(node: SgNode, bindings: BindingMetadata) {
  node.findAll(getRules('LET_VAR')).map((n) => {
    const key = n.getMatch('VAR')?.text() || ''
    bindings[key] = CSSVarsBindingTypes.SETUP_LET
  })

  let constVARs = node.findAll(getRules('CONST_VAR'))
  // function x(){}
  constVARs = constVARs.concat(node.findAll(getRules('CONST_NOR_FN')))
  constVARs.map((n) => {
    const key = n.getMatch('VAR')?.text() || n.find(getRules('IDENT_NAME'))?.text() || ''
    if (!key) return
    bindings[key] = CSSVarsBindingTypes.LITERAL_CONST
    // ref
    if (n.find(getRules('CONST_REF_VAR'))) {
      bindings[key] = CSSVarsBindingTypes.SETUP_REF
    }
    // reactive
    else if (n.find(getRules('CONST_REACTIVE_VAR'))) {
      bindings[key] = CSSVarsBindingTypes.SETUP_REACTIVE_CONST
    }
    // const a = b()、new xxx()
    else if (n.find(getRules('FN_CALL'))
      || n.find(getRules('NEW_EXP'))
      || (n.find(getRules('OBJ_PATTERN'))?.text().startsWith('{')
        && n.find(getRules('OBJ_PATTERN'))?.text().endsWith('}'))) {
      bindings[key] = CSSVarsBindingTypes.SETUP_MAYBE_REF
      //  解构赋值
      const deconstructVal = n.find(getRules('OBJ_PATTERN'))
      const deconstructKeyNode = deconstructVal?.findAll(getRules('OBJ_PATTERN_VAL'))
      deconstructKeyNode && deconstructKeyNode.forEach((nI) => {
        Reflect.deleteProperty(bindings, key)
        bindings[nI.text()] = CSSVarsBindingTypes.SETUP_MAYBE_REF
      })
    }
    // const a = () => {}
    // const a = function x(){}
    // function x(){}
    else if (
      n.find(getRules('ARROW_FN'))
      || n.find(getRules('NOR_FN'))
      || n.find(getRules('OBJ_VAR'))
      || n.find(getRules('ARR_VAR'))
      || n.kind() === 'function_declaration'
      || n.find(getRules('NOR_FN_VAR'))
    ) {
      if (n.kind() === 'function_declaration')
        bindings[n.find(getRules('IDENT_NAME'))?.text() || 'unk'] = CSSVarsBindingTypes.SETUP_CONST
      else
        bindings[key] = CSSVarsBindingTypes.SETUP_CONST
    }

    // const propss = withDefaults(defineProps<Props>(), {
    //   msg: 'hello',
    //   labels: () => ['one', 'two']
    // })
    // set 'msg'、'labels'
    if (n.find(getRules('PROPS_DEFAULT_CALL'))
      && n.find(getRules('PROPS_DEFAULT_CALL'))?.text().includes('withDefaults')) {
      const argObjNode = n.findAll(getRules('PROPS_DEFAULT_ARG'))
      argObjNode.forEach((nI) => {
        !bindings[nI.text()] && (bindings[nI.text()] = CSSVarsBindingTypes.PROPS)
      })
      bindings[key] = CSSVarsBindingTypes.SETUP_CONST
    }
    // e.g
    // const props = defineProps(
    //  {
    //    color: {
    //       type: String
    //     }
    //   })
    if (n.find(getRules('CONST_PROPS_VAR'))) {
      const argObjNode = n.findAll(getRules('PROPS_DEFAULT_ARG'))
      argObjNode.forEach((nI) => {
        !bindings[nI.text()] && (bindings[nI.text()] = CSSVarsBindingTypes.PROPS)
      })
      bindings[key] = CSSVarsBindingTypes.SETUP_REACTIVE_CONST
    }
  })
}
