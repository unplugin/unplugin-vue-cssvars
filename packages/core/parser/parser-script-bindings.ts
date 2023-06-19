import { CSSVarsBindingTypes } from './utils'
import type { BindingMetadata } from '@vue/compiler-dom'
import {SFCDescriptor} from "@vue/compiler-sfc";
import {SgNode, ts} from '@ast-grep/napi'

const mpc = `const appAsd = () => 'red' // √
const appTheme5 = { color: 'red' } // √
const appTheme6 = () => 'red' // √
const fn1 = function(){ // √
  console.log('aa')
}
function f2(){ // √
  console.log(1)
}
  
const fooColor = appAsd() // √
const appTheme3 = ref('red') // √
const appTheme4 = reactive({ color: 'red' })  // √

const a = 100// √
const appTheme2 = 'blue'// √
// const props = defineProps({color: {type: String}})  // √ !!
interface Props {
  msg?: string
  labels?: string[]
}

const propss = withDefaults(defineProps<Props>(), { 
  msg: 'hello', // √
  labels: () => ['one', 'two'] // √
})
const { color } = propss // √`

declare type bindingsParserCtx = { bindings: BindingMetadata}
export function analyzeScriptBindings(descriptor: SFCDescriptor): BindingMetadata {
  debugger
  const scriptSetupContent = descriptor.scriptSetup?.content || ''
  const scriptContent = descriptor.script?.content || ''
  if(!scriptSetupContent && !scriptContent) return {}
  const ctx = {bindings:{}}
  const sgNodeScriptSetup = ts.parse(scriptSetupContent).root()
  walkSgNodeToGetBindings(sgNodeScriptSetup, ctx)
  const sgNodeScript = ts.parse(scriptContent).root()
  walkSgNodeToGetBindings(sgNodeScript, ctx)
  debugger
  return {}
}



const getRules = (name: string)=> {
  return {
    rule: {
      matches: name,
    },
    utils: {
      IDENT_NAME: {
        has:{
          kind: 'identifier',
          field: 'name'
        }
      },
      FN_CALL: {
        has:{
          kind: 'variable_declarator',
          has:{
            kind: 'call_expression'
          }
        }
      },
      ARROW_FN: {
        has:{
          kind: 'variable_declarator',
          has:{
            kind: 'arrow_function'
          }
        }
      },
      NOR_FN_VAR: {
        has:{
          kind: 'variable_declarator',
          has:{
            kind: 'function'
          }
        }
      },
      OBJ_VAR: {
        has:{
          kind: 'variable_declarator',
          has:{
            kind: 'object',
            field: 'value'
          }
        }
      },
      NOR_FN: {
        has:{
          kind: 'function_declaration',
          has:{
            kind: 'identifier',
            field: 'name'
          }
        }
      },
      PROPS_DEFAULT_CALL: {
        has:{
          kind: 'call_expression',
          has:{
            kind: 'identifier',
            field: 'function'
          }
        }
      },
      PROPS_DEFAULT_ARG:{
        kind: 'property_identifier',
        inside: {
          kind: 'pair',
          inside: {
            kind: 'object',
            inside: {
              kind: 'arguments',
            }
          }
        }
      },
      PROPS_DEFAULT_VAL:{
        kind: 'object',
        inside: {
          kind: 'arguments'
        }
      },
      CONST_VAR: {
        any:[
          {
            pattern: 'const $VAR'
          }
        ]
      },
      LET_VAR: {
        any:[
          {
            pattern: 'let $VAR'
          }
        ]
      },
      CONST_REF_VAR: {
        any:[
          {
            pattern: 'const $VAR = ref($VAL)',
          }
        ]
      },
      CONST_REACTIVE_VAR: {
        any:[
          {
            pattern: 'const $VAR = reactive($VAL)'
          }
        ]
      },
      CONST_PROPS_VAR: {
        any:[
          {
            pattern: 'const $VAR = defineProps($VAL)'
          }
        ]
      },
      CONST_NOR_FN: {
        has:
          {
            kind: 'function_declaration'
          }
      },
      OBJ_PATTERN: {
        has:
          {
            kind: 'object_pattern'
          }
      },
      OBJ_PATTERN_VAL: {
        any:
          [
            {
              kind: 'object_pattern'
            },
            {
              kind: 'shorthand_property_identifier_pattern'
            }
          ]
      },

    },
  }
}


function walkSgNodeToGetBindings(node: SgNode, ctx:bindingsParserCtx){
  node.findAll(getRules('LET_VAR')).map(n => {
    const key = n.getMatch('VAR')?.text() || ''
    ctx.bindings[key] = CSSVarsBindingTypes.SETUP_LET
  })

  let constVARs = node.findAll(getRules('CONST_VAR'))
  // function x(){}
  constVARs = constVARs.concat(node.findAll(getRules('CONST_NOR_FN')))
  constVARs.map(n => {
    const key = n.getMatch('VAR')?.text() || n.find(getRules('IDENT_NAME'))?.text() || ''
    if(!key) return
    ctx.bindings[key] = CSSVarsBindingTypes.LITERAL_CONST
    // ref
    if(n.find(getRules('CONST_REF_VAR'))){
      ctx.bindings[key] = CSSVarsBindingTypes.SETUP_REF
    }
    // reactive、 defineProps
    else if(n.find(getRules('CONST_REACTIVE_VAR'))
      || n.find(getRules('CONST_PROPS_VAR'))){
      ctx.bindings[key] = CSSVarsBindingTypes.SETUP_REACTIVE_CONST
    }
    // const a = b()
    else if(n.find(getRules('FN_CALL')) ||
      (n.find(getRules("OBJ_PATTERN"))?.text().startsWith('{') &&
        n.find(getRules("OBJ_PATTERN"))?.text().endsWith('}'))){

      ctx.bindings[key] = CSSVarsBindingTypes.SETUP_MAYBE_REF
      //  解构赋值
      const deconstructVal = n.find(getRules('OBJ_PATTERN'))
      deconstructVal?.findAll(getRules('OBJ_PATTERN_VAL')).forEach(nI => {
        Reflect.deleteProperty(ctx.bindings, key)
        ctx.bindings[nI.text()] = CSSVarsBindingTypes.SETUP_MAYBE_REF
      })
    }
    // const a = () => {}
    // const a = function x(){}
    // function x(){}
    else if(
      n.find(getRules('ARROW_FN'))
      || n.find(getRules('NOR_FN'))
      || n.find(getRules('OBJ_VAR'))
      || n.kind() === 'function_declaration'
      || n.find(getRules('NOR_FN_VAR'))
      ){
      if(n.kind() === 'function_declaration'){
        ctx.bindings[n.find(getRules('IDENT_NAME'))?.text() || 'unk'] = CSSVarsBindingTypes.SETUP_CONST
      }else {
        ctx.bindings[key] = CSSVarsBindingTypes.SETUP_CONST
      }
    }

    // const propss = withDefaults(defineProps<Props>(), {
    //   msg: 'hello',
    //   labels: () => ['one', 'two']
    // })
    // set 'msg'、'labels'
    if(n.find(getRules('PROPS_DEFAULT_CALL')) &&
      n.find(getRules('PROPS_DEFAULT_CALL'))?.text().includes('withDefaults')){
      const argObjNode = n.findAll(getRules('PROPS_DEFAULT_ARG'))
      argObjNode.forEach(nI =>{
        !ctx.bindings[nI.text()] && (ctx.bindings[nI.text()] = CSSVarsBindingTypes.PROPS)
      })
      ctx.bindings[key] = CSSVarsBindingTypes.SETUP_CONST;
    }

  })
}
