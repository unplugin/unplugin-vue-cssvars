
import hash from 'hash-sum'
import type { TMatchVariable } from '../parser'

const importer = 'import { useCssVars as _useCssVars } from "vue"\n'

// TODO unit test
export const injectCSSVars = (
  code: string,
  vbindVariableList: TMatchVariable | undefined,
  isScriptSetup: boolean,
  isDev = true,
) => {
  if (!vbindVariableList || vbindVariableList.length === 0) return { code, vbindVariableList }

  if (isDev)
    return injectCSSVarsOnServer(code, vbindVariableList, isScriptSetup)
  else
    return injectCSSVarsOnBuild(code, vbindVariableList, isScriptSetup)
}

// TODO unit test
export function injectCSSVarsOnServer(
  code: string,
  vbindVariableList: TMatchVariable,
  isScriptSetup: boolean) {
  let resCode = ''
  const hasUseCssVars = code.includes('useCssVars')
  const useCssVars = createUseCssVarsCode(code, vbindVariableList, hasUseCssVars, isScriptSetup)
  if (isScriptSetup) {
    // setup script
    if (!hasUseCssVars) {
      (resCode = code.replaceAll(
        'setup(__props, { expose }) {',
        `setup(__props, { expose }) {${useCssVars}`,
      ))
      resCode = `${importer}${resCode}`
    } else {
      resCode = useCssVars
    }
  } else {
    // option api
    if (!hasUseCssVars) {
      resCode = code.replaceAll('const _sfc_main', 'const __default__')
      resCode = resCode.replaceAll(
        'function _sfc_render',
        `${useCssVars}\n
        const __setup__ = __default__.setup
        __default__.setup = __setup__
          ? (props, ctx) => { __injectCSSVars__(); return __setup__(props, ctx) }
            : __injectCSSVars__
            const _sfc_main = __default__
            function _sfc_render`)
      resCode = `${importer}${resCode}`
    } else {
      resCode = useCssVars
    }
  }

  return { code: resCode, vbindVariableList }
}

export function injectCSSVarsOnBuild(
  code: string,
  vbindVariableList: TMatchVariable,
  isScriptSetup: boolean) {
  let resCode = ''
  const hasUseCssVars = code.includes('useCssVars')
  const useCssVars = createUseCssVarsCode(code, vbindVariableList, hasUseCssVars, isScriptSetup)
  if (isScriptSetup) {
    // setup script
    if (!hasUseCssVars) {
      (resCode = code.replaceAll(
        'setup(__props) {',
        `setup(__props) {${useCssVars}`,
      ))
      resCode = `${importer}${resCode}`
    } else {
      resCode = useCssVars
    }
  } else {
    // option api
    if (!hasUseCssVars) {
      resCode = code.replaceAll('const _sfc_main', 'const __default__')
      resCode = resCode.replaceAll(
        'function _sfc_render',
        `${useCssVars}\n
        const __setup__ = __default__.setup
        __default__.setup = __setup__
          ? (props, ctx) => { __injectCSSVars__(); return __setup__(props, ctx) }
            : __injectCSSVars__
            const _sfc_main = __default__
            function _sfc_render`)
      resCode = `${importer}${resCode}`
    } else {
      resCode = useCssVars
    }
  }

  return { code: resCode, vbindVariableList }
}

// TODO unit test
export function createUseCssVarsCode(
  code: string,
  vbindVariableList: TMatchVariable,
  isHas: boolean,
  isScriptSetup: boolean) {
  let cssvarsObjectCode = ''
  vbindVariableList.forEach((vbVar) => {
    const hashVal = hash(vbVar.value + vbVar.has)
    vbVar.hash = hashVal
    let varStr = ''
    // composition api 和 option api 一直帶 _ctx
    if (!isScriptSetup) {
      varStr = `_ctx.${vbVar.value}`
    } else {
      // vbVar.has === false， 要带上 _ctx.
      varStr = vbVar.has ? vbVar.value : `_ctx.${vbVar.value}`
      // ref 用.value
      varStr = vbVar.isRef ? `${vbVar.value}.value` : varStr
    }
    cssvarsObjectCode = `"${hashVal}": ${varStr},\n  ${cssvarsObjectCode}`
  })
  let resCode = ''
  if (isHas) {
    resCode = code.includes('_useCssVars((_ctx') ? code.replaceAll(
      '_useCssVars((_ctx) => ({',
        `_useCssVars((_ctx) => ({\n  ${cssvarsObjectCode}`)
      : code.replaceAll(
        '_useCssVars(_ctx => ({',
        `_useCssVars((_ctx) => ({\n  ${cssvarsObjectCode}`)
  } else {
    // setup script
    resCode = `
     _useCssVars((_ctx) => ({
      ${cssvarsObjectCode}
    }));`

    // composition api 和 option api
    if (!isScriptSetup) {
      resCode = `
      const __injectCSSVars__ = () => {\n
        ${resCode}\n
      };`
    }
  }
  return resCode
}
