import hash from 'hash-sum'
import { type MagicStringBase } from 'magic-string-ast'
import { ts } from '@ast-grep/napi'
import type { SgNode } from '@ast-grep/napi'
import MagicString from 'magic-string'
import type { IParseSFCRes, TMatchVariable } from '../parser'
import {BindingMetadata, BindingTypes} from "@vue/compiler-dom";
import {CSSVarsBindingTypes} from "../parser/utils";

const importer = 'import { useCssVars as _useCssVars } from "vue"\n'
const importerUnref = 'import { unref as _unref } from "vue"\n'
function findIdentifierFromExp(cssContent: string) {
  return ts.parse(cssContent).root().findAll({
    rule: {
      matches: 'cssComplexExpIdentifier',
    },
    utils: {
      cssComplexExpIdentifier: {
        any: [
          {
            kind: 'identifier',
          },
        ],
      },
    },
  })
}

export const injectCSSVars = (
  vbindVariableList: TMatchVariable | undefined,
  isScriptSetup: boolean,
  parserRes: IParseSFCRes,
  mgcStr: MagicStringBase,
  bindings?: BindingMetadata
) => {
  if (!vbindVariableList || vbindVariableList.length === 0) return { vbindVariableList, mgcStr }
  return injectCSSVarsOnServer(vbindVariableList, isScriptSetup, parserRes, mgcStr, bindings)
}

// 分为三种种情况
// 1. setup script
// 1.1 有 useCssVars 的情况
// 1.2 无 useCssVars 的情况
// 2. option api
// 2.1 有 useCssVars 的情况
// 2.2 无 useCssVars 的情况
// 3. composition api
// 3.1 有 useCssVars 的情况
// 3.2 无 useCssVars 的情况
export function injectCSSVarsOnServer(
  vbindVariableList: TMatchVariable,
  isScriptSetup: boolean,
  parserRes: IParseSFCRes,
  mgcStr: MagicStringBase,
  bindings?: BindingMetadata
) {
  let resMgcStr = mgcStr
  const hasUseCssVars = parserRes.hasCSSVars
  const cssvarsObjectCode = createCSSVarsObjCode(vbindVariableList, isScriptSetup, resMgcStr, bindings)
  // 1
  if (isScriptSetup) {
    // 1.1
    if (hasUseCssVars) {
      resMgcStr = injectUseCssVarsSetup(resMgcStr, cssvarsObjectCode, true, parserRes)
    } else {
      // 1.2
      const useCssVars = createUseCssVarsCode(cssvarsObjectCode, true)
      resMgcStr = injectUseCssVarsSetup(resMgcStr, useCssVars, false, parserRes)
    }
  } else {
    // 2 and 3
    // 2.1 and 3.1
    if (hasUseCssVars) {
      resMgcStr = injectUseCssVarsOption(resMgcStr, cssvarsObjectCode, true, parserRes)
    } else {
      // 2.2 and 3.2
      const useCssVars = createUseCssVarsCode(cssvarsObjectCode, false)
      resMgcStr = injectUseCssVarsOption(resMgcStr, useCssVars, false, parserRes)
    }
  }

  return { vbindVariableList, mgcStr: resMgcStr }
}

export function injectUseCssVarsSetup(
  mgcStr: MagicStringBase,
  useCssVars: string,
  hasUseCssVars: boolean,
  parserRes: IParseSFCRes,
) {
  let resMgcStr = mgcStr
  resMgcStr = resMgcStr.prependLeft(0, importerUnref)
  if (parserRes) {
    if (!hasUseCssVars
      && parserRes.setupBodyNode
      && parserRes.setupBodyNode.start) {
      const start = parserRes.setupBodyNode.start + 1
      resMgcStr = resMgcStr.prependLeft(start, useCssVars)
      resMgcStr = resMgcStr.prependLeft(0, importer)
    } else if (hasUseCssVars
      && parserRes.useCSSVarsNode
      && parserRes.useCSSVarsNode.start) {
      const start = parserRes.useCSSVarsNode.start + 1
      resMgcStr = resMgcStr.prependLeft(start, useCssVars)
    }
  }

  return resMgcStr
}

export function injectUseCssVarsOption(
  mgcStr: MagicStringBase,
  useCssVars: string,
  hasUseCssVars: boolean,
  parserRes: IParseSFCRes,
) {
  let resMgcStr = mgcStr
  resMgcStr = resMgcStr.prependLeft(0, importerUnref)
  if (!hasUseCssVars) {
    resMgcStr = resMgcStr.replaceAll('const _sfc_main', 'const __default__')
    resMgcStr = resMgcStr.replaceAll(
      'function _sfc_render',
      `${useCssVars}\n
        const __setup__ = __default__.setup
        __default__.setup = __setup__
          ? (props, ctx) => { __injectCSSVars__(); return __setup__(props, ctx) }
            : __injectCSSVars__
            const _sfc_main = __default__
            function _sfc_render`)
    resMgcStr = resMgcStr.prependLeft(0, importer)
  } else if (hasUseCssVars
      && parserRes.useCSSVarsNode
      && parserRes.useCSSVarsNode.start) {
    const start = parserRes.useCSSVarsNode.start + 1
    resMgcStr = resMgcStr.prependLeft(start, useCssVars)
  }

  return resMgcStr
}

export function createCSSVarsObjCode(
  vbindVariableList: TMatchVariable,
  isScriptSetup: boolean,
  mgcStr?: MagicStringBase,
  bindings?: BindingMetadata
) {
  let resCode = ''
  vbindVariableList.forEach((vbVar) => {
    // 如果 hash 存在，则说明是由热更新引起的，不需要重新设置 hash
    const hashVal = vbVar.hash || hash(vbVar.value + vbVar.has)
    vbVar.hash = hashVal
    let varStr = ''

    const ms = new MagicString(vbVar.value)
    // get Identifier sgNode
    const cssBindKeySgNodes = findIdentifierFromExp(vbVar.value)
    cssBindKeySgNodes.forEach((node) => {
      const range = node.range()
      ms.overwrite(
        range.start.index,
        range.end.index,
        // non-inline composition api 和 option api 一直帶 _ctx
        !isScriptSetup ?
          `(_ctx.${node.text()})` :
          genCSSVarsValue(node, bindings),
      )
    })
    varStr = ms.toString()
    resCode = `\n            "${hashVal}": ${varStr},${resCode}`
  })

  // 避免 webpack 重复注入
  if (mgcStr && mgcStr.toString().includes(resCode))
    return ''

  return resCode
}

export function createUCVCSetupUnHas(cssvarsObjectCode: string) {
  return `
     _useCssVars((_ctx) => ({
      ${cssvarsObjectCode}
  }));`
}

export function createUCVCOptionUnHas(resCode: string) {
  return `
      const __injectCSSVars__ = () => {\n
        _useCssVars((_ctx) => ({
          ${resCode}\n
        }))
      };`
}

export function createUseCssVarsCode(
  cssvarsObjectCode: string,
  isScriptSetup: boolean,
) {
  let resCode = ''
  if (isScriptSetup) {
    // setup script
    resCode = createUCVCSetupUnHas(cssvarsObjectCode)
  } else {
    // composition api 和 option api
    resCode = createUCVCOptionUnHas(cssvarsObjectCode)
  }
  return resCode
}

// TODO unit test
function genCSSVarsValue(
  node: SgNode,
  bindings?: BindingMetadata){
  let res = '()'
  if(bindings){
    const binding = bindings[node.text()]
    switch (binding){
      case CSSVarsBindingTypes.PROPS:
      case CSSVarsBindingTypes.SETUP_CONST:
      case CSSVarsBindingTypes.SETUP_REACTIVE_CONST:
      case CSSVarsBindingTypes.LITERAL_CONST:
        res = node.text()
        break
      case CSSVarsBindingTypes.SETUP_MAYBE_REF:
      case CSSVarsBindingTypes.SETUP_LET:
        res = `_unref(${node.text()})`
        break
      // The `vineProp` variable is inconsistent with vue here, and vue is `PROPS`
      // Because vine compilation will use `toRefs` processing
      case CSSVarsBindingTypes.SETUP_REF:
        res = `${node.text()}.value`
        break
      default:
        res = `_ctx.${node.text()}`
    }
  }
  return res
}
// TODO non-inline css - vite - dev 🚧
// TODO non-inline bindingTypes - vite - build

// TODO inline css - vite - dev
// TODO inline bindingTypes - vite - build

// TODO non-inline css - webpack - dev
// TODO non-inline bindingTypes - webpack - build

// TODO inline css - webpack - dev
// TODO inline bindingTypes - webpack - build
