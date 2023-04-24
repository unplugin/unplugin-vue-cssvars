
import hash from 'hash-sum'
import type { IFramework } from '../types'
import type { TMatchVariable } from '../parser'

const importer = 'import { useCssVars as _useCssVars } from "vue"\n'

export const injectCSSVars = (
  code: string,
  vbindVariableList: TMatchVariable | undefined,
  isScriptSetup: boolean,
  framework: IFramework,
) => {
  if (!vbindVariableList || vbindVariableList.length === 0) return { code, vbindVariableList }
  return injectCSSVarsOnServer(code, vbindVariableList, isScriptSetup, framework)
}

// TODO use ast to impl
// code 是 @vitejs/plugin-vue 编译后的代码
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
  code: string,
  vbindVariableList: TMatchVariable,
  isScriptSetup: boolean,
  framework: IFramework) {
  let resCode = ''
  const hasUseCssVars = code.includes('useCssVars')
  // 1
  if (isScriptSetup) {
    const useCssVars = createUseCssVarsCode(
      code,
      vbindVariableList,
      hasUseCssVars,
      true)

    resCode = injectUseCssVarsSetup(code, useCssVars, hasUseCssVars)
  } else {
    // 2 and 3
    const useCssVars = createUseCssVarsCode(
      code,
      vbindVariableList,
      hasUseCssVars,
      false)

    resCode = injectUseCssVarsOption(code, useCssVars, hasUseCssVars)
  }

  return { code: resCode, vbindVariableList }
}

// TODO: unit test
export function injectUseCssVarsSetup(
  code: string,
  useCssVars: string,
  hasUseCssVars: boolean,
) {
  let resCode = ''
  if (!hasUseCssVars) {
    // TODO: vite unit test
    if (code.includes('setup(__props, { expose }) {')) {
      resCode = code.replaceAll(
        'setup(__props, { expose }) {',
        `setup(__props, { expose }) {${useCssVars}`)
    }

    // TODO unit test webpack
    if (code.includes('setup: function (__props, _a) {')) {
      resCode = code.replaceAll(
        'setup: function (__props, _a) {',
        `setup: function (__props, _a) {${useCssVars}`)
    }

    resCode = resCode ? `${importer}${resCode}` : code
  } else {
    resCode = useCssVars
  }
  return resCode
}

// TODO: unit test
export function injectUseCssVarsOption(
  code: string,
  useCssVars: string,
  hasUseCssVars: boolean,
) {
  let resCode = ''
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
  return resCode
}

// TODO: unit test
export function createCSSVarsObjCode(
  vbindVariableList: TMatchVariable,
  isScriptSetup: boolean,
) {
  let resCode = ''
  vbindVariableList.forEach((vbVar) => {
    // 如果 hash 存在，则说明是由热更新引起的，不需要重新设置 hash
    const hashVal = vbVar.hash || hash(vbVar.value + vbVar.has)
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
    resCode = `"${hashVal}": ${varStr},\n  ${resCode}`
  })
  return resCode
}

// TODO: unit test
export function createUCVCSetupUnHas(cssvarsObjectCode: string) {
  return `
     _useCssVars((_ctx) => ({
      ${cssvarsObjectCode}
  }));`
}

// TODO: unit test
export function createUCVCOptionUnHas(resCode: string) {
  return `
      const __injectCSSVars__ = () => {\n
        ${resCode}\n
      };`
}

// TODO: unit test
export function createUCVCHas(
  code: string,
  cssvarsObjectCode: string,
) {
  let resCode = ''
  // TODO: vite unit test
  if (code.includes('_useCssVars((_ctx')) {
    resCode = code.replaceAll(
      '_useCssVars((_ctx) => ({',
      `_useCssVars((_ctx) => ({\n  ${cssvarsObjectCode}`)
  }

  // TODO: vite unit test
  if (code.includes('_useCssVars(_ctx => ({')) {
    resCode = code.replaceAll(
      '_useCssVars(_ctx => ({',
      `_useCssVars((_ctx) => ({\n  ${cssvarsObjectCode}`)
  }

  // TODO: vite unit webpack
  if (code.includes('_useCssVars(function (_ctx) { return ({')) {
    resCode = code.replaceAll(
      '_useCssVars(function (_ctx) { return ({',
      `_useCssVars(function (_ctx) { return ({\n  ${cssvarsObjectCode}`)
  }
  return resCode
}

export function createUseCssVarsCode(
  code: string,
  vbindVariableList: TMatchVariable,
  isHas: boolean,
  isScriptSetup: boolean,
) {
  const cssvarsObjectCode = createCSSVarsObjCode(vbindVariableList, isScriptSetup)

  let resCode = ''
  if (isHas) {
    resCode = createUCVCHas(code, cssvarsObjectCode)
  } else {
    if (isScriptSetup) {
      // setup script
      resCode = createUCVCSetupUnHas(cssvarsObjectCode)
    } else {
      // composition api 和 option api
      resCode = createUCVCOptionUnHas(cssvarsObjectCode)
    }
  }
  return resCode
}
